import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@stoncrops/shared';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const exportCsv = searchParams.get('export') === 'csv';

    const supabase = getSupabaseServiceClient();

    let query = supabase
      .from('orders')
      .select('*, order_items (*)')
      .order('created_at', { ascending: false });

    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,razorpay_payment_id.ilike.%${search}%`);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error('[Admin Orders Query Error]', error);
      return NextResponse.json({ orders: [] });
    }

    // Handle CSV Export
    if (exportCsv) {
      const header = 'Order Number,Date,Customer Name,Phone,Email,Product,Size,Qty,Total Amount,Payment Status,Fulfillment Status,Address\n';
      const rows = (orders || [])
        .map((o) => {
          const addr = o.shipping_address || {};
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const item = (o.order_items as any)?.[0] || {};
          const fullAddr = `"${addr.houseBuilding || ''} ${addr.streetAddress || ''} ${addr.city || ''} ${addr.pincode || ''}"`;
          return `${o.order_number},${new Date(o.created_at).toISOString()},"${addr.fullName || ''}",${addr.phone || ''},${addr.email || ''},"${item.product_name || 'Embroidered Edition'}",${item.size || 'M'},${item.quantity || 1},${o.total_amount},${o.payment_status},${o.status},${fullAddr}`;
        })
        .join('\n');

      return new NextResponse(header + rows, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename=stoncrops-orders-${Date.now()}.csv`,
        },
      });
    }

    return NextResponse.json({ orders: orders || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status, notes } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    const updatePayload: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (status) updatePayload.status = status;
    if (notes !== undefined) updatePayload.notes = notes;

    const { data, error } = await supabase
      .from('orders')
      .update(updatePayload)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'update_order_status',
      entity_type: 'orders',
      entity_id: orderId,
      new_values: updatePayload,
    });

    return NextResponse.json({ success: true, order: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
