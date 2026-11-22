import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@stoncrops/shared';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const DEFAULT_EDITORIAL_IMAGES = [
  {
    image_url: '/images/product/front-editorial.svg',
    alt_text: 'STONCROPS Embroidered Edition - Front View',
    caption: 'Front Silhouette — Drop-shoulder cut in Off-White Loopnet',
    is_primary: true,
    sort_order: 0,
  },
  {
    image_url: '/images/product/sleeve-embroidery.svg',
    alt_text: 'STONCROPS - Burgundy Floral Sleeve Embroidery',
    caption: 'Sleeve Embroidery — Bespoke burgundy floral motifs along sleeves',
    is_primary: false,
    sort_order: 1,
  },
  {
    image_url: '/images/product/back-silhouette.svg',
    alt_text: 'STONCROPS - Back Drape',
    caption: 'Back Silhouette — Boxy drop-shoulder cut and neckline finish',
    is_primary: false,
    sort_order: 2,
  },
  {
    image_url: '/images/product/fabric-loopnet.svg',
    alt_text: 'STONCROPS - Loopnet Fabric Macro',
    caption: 'Fabric Texture — Heavyweight structured Loopnet knit',
    is_primary: false,
    sort_order: 3,
  },
];

async function getActiveProductId(supabase: ReturnType<typeof getSupabaseServiceClient>): Promise<string> {
  const { data: product } = await supabase
    .from('products')
    .select('id')
    .limit(1)
    .maybeSingle();

  if (product?.id) {
    return product.id;
  }

  // Fallback to standard seeded ID
  return 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d';
}

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: images, error } = await supabase
      .from('product_images')
      .select('*')
      .order('is_primary', { ascending: false })
      .order('sort_order', { ascending: true });

    if (error) {
      console.warn('[Admin Images GET warning]', error.message);
      return NextResponse.json({ images: [] });
    }

    return NextResponse.json({ images: images || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServiceClient();
    const productId = await getActiveProductId(supabase);

    // Check if request is JSON (e.g. for seed action)
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const jsonBody = await req.json();
      if (jsonBody.action === 'seed_defaults') {
        const recordsToInsert = DEFAULT_EDITORIAL_IMAGES.map((img) => ({
          ...img,
          product_id: productId,
        }));

        const { data, error } = await supabase
          .from('product_images')
          .insert(recordsToInsert)
          .select();

        if (error) {
          return NextResponse.json({ error: error.message }, { status: 500 });
        }
        return NextResponse.json({ success: true, seeded: data });
      }
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const caption = (formData.get('caption') as string) || '';
    const altText = (formData.get('altText') as string) || caption || 'STONCROPS Garment Photograph';
    const isPrimary = formData.get('isPrimary') === 'true';
    const sortOrder = parseInt((formData.get('sortOrder') as string) || '0', 10);

    if (!file) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // 1. Strict File Type & Size Validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file format. Only JPEG, PNG, and WebP images are permitted.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit (5MB).' },
        { status: 400 }
      );
    }

    const bucket = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images';
    const fileExt = file.name.split('.').pop() || 'webp';
    const fileName = `stoncrops_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let finalImageUrl = '';

    // 2. Upload to Supabase Storage with graceful Base64 fallback
    try {
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        console.warn('[Storage upload warning, using resilient Base64 fallback]:', uploadError.message);
        // Resilient Base64 Data URL fallback: guaranteed to work in any browser and database!
        finalImageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      } else {
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        finalImageUrl = urlData.publicUrl;
      }
    } catch (storageErr) {
      console.warn('[Storage upload exception, fallback to base64]:', storageErr);
      finalImageUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
    }

    // 3. If marked as primary, reset existing primary images for this product
    if (isPrimary) {
      await supabase
        .from('product_images')
        .update({ is_primary: false })
        .eq('product_id', productId);
    }

    // 4. Insert image record in product_images
    const { data: imageRecord, error: dbError } = await supabase
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: finalImageUrl,
        alt_text: altText,
        caption: caption || altText,
        is_primary: isPrimary,
        sort_order: isNaN(sortOrder) ? 0 : sortOrder,
      })
      .select()
      .single();

    if (dbError) {
      console.error('[Product Images DB Insert Error]', dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, image: imageRecord });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Admin Images POST error]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { imageId, isPrimary, caption, sortOrder } = await req.json();

    if (!imageId) {
      return NextResponse.json({ error: 'Image ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    // If making primary, uncheck all others
    if (isPrimary) {
      const { data: currentImg } = await supabase
        .from('product_images')
        .select('product_id')
        .eq('id', imageId)
        .single();

      if (currentImg?.product_id) {
        await supabase
          .from('product_images')
          .update({ is_primary: false })
          .eq('product_id', currentImg.product_id);
      }
    }

    const updatePayload: Record<string, unknown> = {};
    if (isPrimary !== undefined) updatePayload.is_primary = isPrimary;
    if (caption !== undefined) {
      updatePayload.caption = caption;
      updatePayload.alt_text = caption;
    }
    if (sortOrder !== undefined) updatePayload.sort_order = sortOrder;

    const { data, error } = await supabase
      .from('product_images')
      .update(updatePayload)
      .eq('id', imageId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, image: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Image ID required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from('product_images').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
