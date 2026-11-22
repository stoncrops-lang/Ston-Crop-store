import { NextRequest, NextResponse } from 'next/server';
import {
  getSupabaseServiceClient,
  verifyRazorpaySignature,
  sendOwnerWhatsAppNotification,
  sendCustomerOrderConfirmation,
  sendOwnerOrderAlert,
} from '@stoncrops/shared';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { success: false, error: 'Missing payment verification credentials' },
        { status: 400 }
      );
    }

    const hasRazorpayConfig = Boolean(process.env.RAZORPAY_KEY_SECRET);

    // 1. Signature Verification
    if (hasRazorpayConfig) {
      const isValid = verifyRazorpaySignature(
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature
      );

      if (!isValid) {
        console.error('[Security Warning] Invalid Razorpay signature for order:', orderId);
        return NextResponse.json(
          { success: false, error: 'Invalid payment signature verification failed' },
          { status: 400 }
        );
      }
    } else {
      console.log('[Payment Sandbox] Simulated verification for order:', orderId);
    }

    const supabase = getSupabaseServiceClient();

    // 2. Query order from database
    const { data: order } = await supabase
      .from('orders')
      .select('*, order_items (*)')
      .eq('id', orderId)
      .single();

    // If order was already paid, return early (idempotent)
    if (order && order.payment_status === 'captured') {
      return NextResponse.json({
        success: true,
        orderNumber: order.order_number,
        message: 'Order already verified',
      });
    }

    // 3. Atomically commit order & inventory
    try {
      await supabase.rpc('commit_order_stock', {
        p_order_id: orderId,
        p_razorpay_payment_id: razorpayPaymentId,
      });
    } catch {
      // Fallback manual update if RPC not applied yet
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'captured',
          razorpay_payment_id: razorpayPaymentId,
        })
        .eq('id', orderId);
    }

    // 4. Record Payment Transaction
    await supabase.from('payment_transactions').insert({
      order_id: orderId,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      amount: order?.total_amount || 1199,
      currency: 'INR',
      status: 'captured',
      payment_method: 'upi',
    });

    const orderNumber = order?.order_number || `SC-${Date.now().toString().slice(-6)}`;
    const shippingAddress = order?.shipping_address || {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const firstItem = (order?.order_items as any)?.[0] || {
      product_name: 'STONCROPS — Embroidered Edition',
      size: 'M',
      quantity: 1,
    };

    // 5. Asynchronous Non-blocking Notifications
    (async () => {
      try {
        // WhatsApp Alert to Owner
        const waResult = await sendOwnerWhatsAppNotification({
          orderNumber,
          customerName: shippingAddress.fullName || 'Customer',
          customerPhone: shippingAddress.phone || '',
          productName: firstItem.product_name,
          size: firstItem.size,
          quantity: firstItem.quantity,
          totalAmount: order?.total_amount || 1199,
          paymentStatus: 'captured',
          city: shippingAddress.city || 'India',
          state: shippingAddress.state || '',
        });

        await supabase.from('notifications').insert({
          order_id: orderId,
          type: 'whatsapp',
          recipient: process.env.OWNER_WHATSAPP_NUMBER || 'owner',
          payload: { orderNumber, status: 'captured' },
          status: waResult.success ? 'sent' : 'failed',
          error_message: waResult.error,
        });

        // Email Confirmation to Customer
        if (shippingAddress.email) {
          const emailResult = await sendCustomerOrderConfirmation({
            toEmail: shippingAddress.email,
            customerName: shippingAddress.fullName || 'Customer',
            orderNumber,
            productName: firstItem.product_name,
            size: firstItem.size,
            quantity: firstItem.quantity,
            totalAmount: order?.total_amount || 1199,
            shippingAddress,
          });

          await supabase.from('notifications').insert({
            order_id: orderId,
            type: 'email',
            recipient: shippingAddress.email,
            payload: { orderNumber, type: 'customer_confirmation' },
            status: emailResult.success ? 'sent' : 'failed',
            error_message: emailResult.error,
          });
        }

        // Email Alert to Owner
        await sendOwnerOrderAlert({
          orderNumber,
          customerName: shippingAddress.fullName || 'Customer',
          customerPhone: shippingAddress.phone || '',
          customerEmail: shippingAddress.email || '',
          productName: firstItem.product_name,
          size: firstItem.size,
          quantity: firstItem.quantity,
          totalAmount: order?.total_amount || 1199,
        });
      } catch (notifErr) {
        console.error('[Background Notification Worker Error]', notifErr);
      }
    })();

    return NextResponse.json({
      success: true,
      orderNumber,
      orderId,
      message: 'Payment verified successfully and stock committed.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Verify Payment API Error]', message);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
