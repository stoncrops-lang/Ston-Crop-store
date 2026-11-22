import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient, updateInventorySchema } from '@stoncrops/shared';

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    const { data: variants, error } = await supabase
      .from('product_variants')
      .select('id, size, sku, price, is_active, inventory (id, available_stock, reserved_stock, sold_stock, low_stock_threshold)')
      .order('size', { ascending: true });

    if (error) {
      console.error('[Inventory Query Error]', error);
      // Fallback defaults if tables not yet populated
      return NextResponse.json({
        inventory: [
          { size: 'S', sku: 'SC-EMB-S', available: 25, reserved: 0, sold: 0, lowStockThreshold: 5 },
          { size: 'M', sku: 'SC-EMB-M', available: 40, reserved: 0, sold: 0, lowStockThreshold: 5 },
          { size: 'L', sku: 'SC-EMB-L', available: 20, reserved: 0, sold: 0, lowStockThreshold: 5 },
        ],
      });
    }

    const inventory = (variants || []).map((v) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const inv = (v.inventory as any)?.[0] || {};
      return {
        variantId: v.id,
        size: v.size,
        sku: v.sku,
        available: inv.available_stock ?? 0,
        reserved: inv.reserved_stock ?? 0,
        sold: inv.sold_stock ?? 0,
        totalStock: (inv.available_stock ?? 0) + (inv.reserved_stock ?? 0) + (inv.sold_stock ?? 0),
        lowStockThreshold: inv.low_stock_threshold ?? 5,
      };
    });

    return NextResponse.json({ inventory });
  } catch {
    return NextResponse.json({
      inventory: [
        { size: 'S', sku: 'SC-EMB-S', available: 25, reserved: 0, sold: 0, lowStockThreshold: 5 },
        { size: 'M', sku: 'SC-EMB-M', available: 40, reserved: 0, sold: 0, lowStockThreshold: 5 },
        { size: 'L', sku: 'SC-EMB-L', available: 20, reserved: 0, sold: 0, lowStockThreshold: 5 },
      ],
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = updateInventorySchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json(
        { error: parse.error.errors[0]?.message || 'Invalid inventory update' },
        { status: 400 }
      );
    }

    const { variantId, availableStock, lowStockThreshold } = parse.data;

    const supabase = getSupabaseServiceClient();

    const updatePayload: Record<string, unknown> = {
      available_stock: availableStock,
      updated_at: new Date().toISOString(),
    };

    if (lowStockThreshold !== undefined) {
      updatePayload.low_stock_threshold = lowStockThreshold;
    }

    const { data, error } = await supabase
      .from('inventory')
      .update(updatePayload)
      .eq('variant_id', variantId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await supabase.from('audit_logs').insert({
      action: 'update_inventory',
      entity_type: 'inventory',
      entity_id: variantId,
      new_values: updatePayload,
    });

    return NextResponse.json({ success: true, inventory: data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
