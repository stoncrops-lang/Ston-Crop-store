import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient, reviewSubmissionSchema } from '@stoncrops/shared';

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('id, customer_name, rating, title, comment, is_verified_purchase, created_at')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Reviews Query Error]', error);
      return NextResponse.json({ reviews: [] });
    }

    const formatted = (reviews || []).map((r) => ({
      id: r.id,
      customerName: r.customer_name,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: r.is_verified_purchase,
      createdAt: r.created_at,
    }));

    return NextResponse.json({ reviews: formatted });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = reviewSubmissionSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { success: false, error: parse.error.errors[0]?.message || 'Invalid review data' },
        { status: 400 }
      );
    }

    const { customerName, rating, title, comment, orderNumber, website_url } = parse.data;

    // Honeypot check
    if (website_url) {
      return NextResponse.json({ success: true }); // Silently drop spam bot submissions
    }

    const supabase = getSupabaseServiceClient();

    // Verify if orderNumber is valid for verified purchaser badge
    let isVerified = false;
    let verifiedOrderId: string | null = null;

    if (orderNumber) {
      const { data: matchedOrder } = await supabase
        .from('orders')
        .select('id')
        .eq('order_number', orderNumber.toUpperCase().trim())
        .eq('status', 'paid')
        .single();

      if (matchedOrder) {
        isVerified = true;
        verifiedOrderId = matchedOrder.id;
      }
    }

    // Default product ID for Embroidered Edition
    const productId = 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

    const { error: insertErr } = await supabase.from('reviews').insert({
      product_id: productId,
      customer_name: customerName,
      rating,
      title: title || null,
      comment,
      order_id: verifiedOrderId,
      is_verified_purchase: isVerified,
      status: 'pending', // Requires admin moderation
    });

    if (insertErr) {
      console.error('[Review Insert Failed]', insertErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Review received. It will be published after verification.',
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Review Submit Error]', message);
    return NextResponse.json({ success: false, error: 'Failed to submit review' }, { status: 500 });
  }
}
