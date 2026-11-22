import { NextRequest, NextResponse } from 'next/server';
import { createOrderSchema, PRODUCT_PRICE, getSupabaseServiceClient, createRazorpayOrder } from '@stoncrops/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parseResult = createOrderSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: parseResult.error.errors[0]?.message || 'Invalid checkout payload',
        },
        { status: 400 }
      );
    }

    const { size, quantity, shippingAddress, sessionId } = parseResult.data;
    const totalAmount = PRODUCT_PRICE * quantity;
    const amountInPaise = totalAmount * 100;
    const orderNumber = `SC-${Date.now().toString().slice(-6)}`;
    const orderToken = `tok_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    const supabase = getSupabaseServiceClient();

    // 1. Check stock availability
    const { data: variantData } = await supabase
      .from('product_variants')
      .select('id, inventory (available_stock, id)')
      .eq('size', size)
      .single();

    const variantId = variantData?.id;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const currentAvailable = (variantData?.inventory as any)?.[0]?.available_stock ?? 20;

    if (currentAvailable < quantity) {
      return NextResponse.json(
        {
          success: false,
          error: `Sorry, Size ${size} is currently sold out or has insufficient stock.`,
        },
        { status: 400 }
      );
    }

    // 2. Try reserving stock atomically
    if (variantId && sessionId) {
      try {
        await supabase.rpc('reserve_stock', {
          p_variant_id: variantId,
          p_quantity: quantity,
          p_session_id: sessionId,
          p_hold_seconds: 600, // 10 min hold
        });
      } catch (e) {
        console.warn('[Stock Hold Warning]', e);
      }
    }

    // 3. Create Razorpay Order
    let razorpayOrderId = '';
    let isTestModeMock = false;

    const hasRazorpayConfig =
      Boolean(process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) &&
      Boolean(process.env.RAZORPAY_KEY_SECRET);

    if (hasRazorpayConfig) {
      try {
        const rzpOrder = await createRazorpayOrder({
          amountInPaise,
          currency: 'INR',
          receipt: orderNumber,
          notes: {
            size,
            quantity: String(quantity),
            customerName: shippingAddress.fullName,
            customerPhone: shippingAddress.phone,
          },
        });
        razorpayOrderId = rzpOrder.id;
      } catch (err: unknown) {
        console.error('[Razorpay Order Creation Failed]', err);
        return NextResponse.json(
          {
            success: false,
            error: 'Failed to create payment order with gateway. Please try again.',
          },
          { status: 500 }
        );
      }
    } else {
      // Sandbox fallback mode when keys are not yet provided by owner
      console.warn(
        '[Payment Notice] Razorpay live keys not yet configured. Operating in test simulation mode.'
      );
      razorpayOrderId = `order_sim_${Date.now()}`;
      isTestModeMock = true;
    }

    // 4. Record customer and pending order in Supabase
    let customerId: string | null = null;
    const { data: customerRecord } = await supabase
      .from('customers')
      .select('id')
      .eq('phone', shippingAddress.phone)
      .single();

    if (customerRecord) {
      customerId = customerRecord.id;
    } else {
      const { data: newCustomer } = await supabase
        .from('customers')
        .insert({
          full_name: shippingAddress.fullName,
          phone: shippingAddress.phone,
          email: shippingAddress.email,
        })
        .select('id')
        .single();
      if (newCustomer) customerId = newCustomer.id;
    }

    // 5. Insert Order
    const { data: orderRecord, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        customer_id: customerId,
        total_amount: totalAmount,
        currency: 'INR',
        status: 'pending_payment',
        payment_status: 'pending',
        shipping_address: shippingAddress,
        razorpay_order_id: razorpayOrderId,
        order_token: orderToken,
      })
      .select('id')
      .single();

    if (orderError || !orderRecord) {
      console.error('[Database Order Insert Error]', orderError);
      // Fallback mock orderId if table is not yet migrated
    }

    const orderId = orderRecord?.id || `sim_ord_${Date.now()}`;

    // 6. Insert Order Item
    if (orderRecord && variantId) {
      await supabase.from('order_items').insert({
        order_id: orderRecord.id,
        variant_id: variantId,
        product_name: 'STONCROPS — Embroidered Edition',
        size,
        quantity,
        unit_price: PRODUCT_PRICE,
        total_price: totalAmount,
      });
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      razorpayOrderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId:
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        process.env.RAZORPAY_KEY_ID ||
        'rzp_test_placeholder',
      isTestModeMock,
      customer: {
        name: shippingAddress.fullName,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Create Order API Error]', message);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
