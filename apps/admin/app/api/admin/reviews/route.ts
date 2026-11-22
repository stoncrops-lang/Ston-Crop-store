import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@stoncrops/shared';

const SAMPLE_REVIEWS = [
  {
    customer_name: 'Aarav Mehta',
    rating: 5,
    title: 'Flawless boxy drape & embroidery',
    comment: 'The garment measurements in the size guide were completely accurate. The burgundy floral embroidery on the sleeves is dense and impeccably finished. Looks even better in natural light.',
    is_verified_purchase: true,
    status: 'approved',
  },
  {
    customer_name: 'Rohan Varma',
    rating: 5,
    title: 'True Loopnet heavyweight fabric',
    comment: 'Finally a streetwear brand that uses genuine heavyweight Loopnet knit. The drop-shoulder holds structure without slouching. Easily competes with international luxury labels.',
    is_verified_purchase: true,
    status: 'approved',
  },
  {
    customer_name: 'Priya Sharma',
    rating: 5,
    title: 'Premium quality throughout',
    comment: 'Loved the minimal chest typography and the packaging. Size S gave the exact oversized boyfriend look I wanted. Free express shipping across India was super fast.',
    is_verified_purchase: true,
    status: 'approved',
  },
  {
    customer_name: 'Vikramaditya K.',
    rating: 5,
    title: 'Attention to detail is unmatched',
    comment: 'The collar doesn’t stretch out and the off-white shade is perfectly muted. Waiting for the next release from STONCROPS.',
    is_verified_purchase: true,
    status: 'pending',
  },
];

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('*, products(name)')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[Admin Reviews GET warning]', error.message);
      return NextResponse.json({ reviews: [] });
    }

    return NextResponse.json({ reviews: reviews || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = getSupabaseServiceClient();

    // Check if seeding sample reviews
    if (body.action === 'seed_defaults') {
      const { data: prod } = await supabase.from('products').select('id').limit(1).maybeSingle();
      const productId = prod?.id || 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';

      const toInsert = SAMPLE_REVIEWS.map((r) => ({
        ...r,
        product_id: productId,
        approved_at: r.status === 'approved' ? new Date().toISOString() : null,
      }));

      const { data, error } = await supabase.from('reviews').insert(toInsert).select();
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ success: true, seeded: data });
    }

    // Manual review creation by founder
    const { customerName, rating, title, comment, isVerifiedPurchase, status } = body;

    if (!customerName || !comment) {
      return NextResponse.json({ error: 'Customer name and feedback are required.' }, { status: 400 });
    }

    const { data: prod } = await supabase.from('products').select('id').limit(1).maybeSingle();
    const productId = prod?.id || 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
    const reviewStatus = status || 'approved';

    const { data, error } = await supabase
      .from('reviews')
      .insert({
        product_id: productId,
        customer_name: customerName,
        rating: rating || 5,
        title: title || null,
        comment,
        is_verified_purchase: isVerifiedPurchase ?? true,
        status: reviewStatus,
        approved_at: reviewStatus === 'approved' ? new Date().toISOString() : null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { reviewId, status } = await req.json();

    if (!reviewId || !['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Valid reviewId and status required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    const updatePayload: Record<string, unknown> = {
      status,
      approved_at: status === 'approved' ? new Date().toISOString() : null,
    };

    const { data, error } = await supabase
      .from('reviews')
      .update(updatePayload)
      .eq('id', reviewId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from('reviews').delete().eq('id', reviewId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
