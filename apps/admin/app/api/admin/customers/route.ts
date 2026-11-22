import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@stoncrops/shared';

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    const { data: customers, error } = await supabase
      .from('customers')
      .select('id, full_name, phone, email, total_orders, total_spent, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ customers: [] });
    }

    return NextResponse.json({ customers: customers || [] });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
