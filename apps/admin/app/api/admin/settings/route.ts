import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@stoncrops/shared';

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();
    const { data: settings, error } = await supabase.from('store_settings').select('*');

    if (error) {
      return NextResponse.json({ settings: [] });
    }

    return NextResponse.json({ settings: settings || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { key, value, description } = await req.json();

    if (!key) {
      return NextResponse.json({ error: 'Setting key is required' }, { status: 400 });
    }

    const supabase = getSupabaseServiceClient();

    const { data, error } = await supabase.from('store_settings').upsert(
      {
        key,
        value,
        description: description || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'key' }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, setting: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
