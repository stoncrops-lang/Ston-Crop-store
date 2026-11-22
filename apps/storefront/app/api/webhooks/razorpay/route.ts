import { NextRequest, NextResponse } from 'next/server';
import {
  getSupabaseServiceClient,
  verifyRazorpayWebhookSignature,
} from '@stoncrops/shared';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing webhook signature' }, { status: 400 });
    }

    // Verify webhook signature if secret configured
    if (process.env.RAZORPAY_WEBHOOK_SECRET) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
      if (!isValid) {
        console.error('[Security Warning] Webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
      }
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;
    const payment = event.payload?.payment?.entity;
    const orderId = payment?.order_id;

    console.log(`[Razorpay Webhook Received] Event: ${eventType}, Order: ${orderId}`);

    const supabase = getSupabaseServiceClient();

    if (eventType === 'payment.captured' && orderId) {
      // Find matching order in database
      const { data: order } = await supabase
        .from('orders')
        .select('id, payment_status')
        .eq('razorpay_order_id', orderId)
        .single();

      if (order && order.payment_status !== 'captured') {
        try {
          await supabase.rpc('commit_order_stock', {
            p_order_id: order.id,
            p_razorpay_payment_id: payment.id,
          });
        } catch {
          await supabase
            .from('orders')
            .update({
              status: 'paid',
              payment_status: 'captured',
              razorpay_payment_id: payment.id,
            })
            .eq('id', order.id);
        }
      }
    } else if (eventType === 'payment.failed' && orderId) {
      await supabase
        .from('orders')
        .update({
          payment_status: 'failed',
          notes: `Payment failed: ${payment?.error_description || 'Unknown error'}`,
        })
        .eq('razorpay_order_id', orderId);
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Razorpay Webhook Exception]', message);
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 });
  }
}
