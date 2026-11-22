import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@stoncrops/shared';

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: images, error } = await supabase
      .from('product_images')
      .select('id, image_url, alt_text, caption, is_primary, sort_order')
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true });

    if (error || !images || images.length === 0) {
      return NextResponse.json({ images: [] });
    }

    return NextResponse.json({
      images: images.map((img) => ({
        id: img.id,
        url: img.image_url,
        alt: img.alt_text,
        label: img.caption || (img.is_primary ? 'Primary View' : 'Garment Detail'),
        caption: img.caption || img.alt_text,
        isPrimary: img.is_primary,
      })),
    });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
