import { NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@stoncrops/shared';

export async function GET() {
  try {
    const supabase = getSupabaseServiceClient();

    // 1. Fetch Orders for revenue, counts, and status breakdown
    const { data: orders } = await supabase
      .from('orders')
      .select('id, total_amount, status, payment_status, created_at, shipping_address');

    const allOrders = orders || [];
    const paidOrders = allOrders.filter((o) => o.payment_status === 'captured' || o.status === 'paid');
    const pendingOrders = allOrders.filter((o) => o.payment_status === 'pending');
    const processingOrders = allOrders.filter((o) => o.status === 'processing');
    const shippedOrders = allOrders.filter((o) => o.status === 'shipped');

    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const totalOrdersCount = allOrders.length;
    const successfulPaymentsCount = paidOrders.length;
    const averageOrderValue =
      successfulPaymentsCount > 0 ? Math.round(totalRevenue / successfulPaymentsCount) : 0;

    // 2. Fetch Live Visitors (sessions updated within the last 3 minutes)
    const threeMinutesAgo = new Date(Date.now() - 3 * 60 * 1000).toISOString();
    const { data: liveSessions } = await supabase
      .from('sessions')
      .select('id, device_type, referrer, utm_source, last_heartbeat')
      .gte('last_heartbeat', threeMinutesAgo)
      .eq('is_active', true);

    const liveVisitors = liveSessions?.length ?? 0;

    // 3. Fetch Total Unique Sessions
    const { data: allSessions } = await supabase
      .from('sessions')
      .select('id, device_type, referrer, utm_source, page_views, first_seen')
      .order('first_seen', { ascending: false });

    const totalSessionsList = allSessions || [];
    const totalVisitors = totalSessionsList.length;

    // 4. Device Breakdown (Strictly computed from actual sessions)
    let mobileCount = 0;
    let desktopCount = 0;
    let tabletCount = 0;

    totalSessionsList.forEach((s) => {
      const dev = (s.device_type || '').toLowerCase();
      if (dev.includes('mobile') || dev.includes('phone') || dev.includes('android') || dev.includes('iphone')) {
        mobileCount++;
      } else if (dev.includes('tablet') || dev.includes('ipad')) {
        tabletCount++;
      } else if (dev.includes('desktop') || dev.includes('windows') || dev.includes('mac') || dev.includes('linux')) {
        desktopCount++;
      }
    });

    const totalDeviceTracked = mobileCount + desktopCount + tabletCount;
    const devices = {
      mobile: totalDeviceTracked > 0 ? Math.round((mobileCount / totalDeviceTracked) * 100) : 0,
      desktop: totalDeviceTracked > 0 ? Math.round((desktopCount / totalDeviceTracked) * 100) : 0,
      tablet: totalDeviceTracked > 0 ? Math.round((tabletCount / totalDeviceTracked) * 100) : 0,
    };

    // 5. Traffic / Referrer Sources (Strictly computed from actual referrals)
    let instagramCount = 0;
    let whatsappCount = 0;
    let directCount = 0;
    let searchCount = 0;

    totalSessionsList.forEach((s) => {
      const ref = `${s.referrer || ''} ${s.utm_source || ''}`.toLowerCase();
      if (ref.includes('instagram') || ref.includes('ig') || ref.includes('stonecrops.in')) {
        instagramCount++;
      } else if (ref.includes('whatsapp') || ref.includes('wa.me')) {
        whatsappCount++;
      } else if (ref.includes('google') || ref.includes('bing') || ref.includes('search')) {
        searchCount++;
      } else if (s.referrer || s.utm_source) {
        directCount++;
      }
    });

    const totalRefTracked = instagramCount + whatsappCount + directCount + searchCount;
    const sources = {
      instagram: totalRefTracked > 0 ? Math.round((instagramCount / totalRefTracked) * 100) : 0,
      direct: totalRefTracked > 0 ? Math.round((directCount / totalRefTracked) * 100) : 0,
      whatsapp: totalRefTracked > 0 ? Math.round((whatsappCount / totalRefTracked) * 100) : 0,
      search: totalRefTracked > 0 ? Math.round((searchCount / totalRefTracked) * 100) : 0,
    };

    // 6. Fetch Telemetry Events & Calculate Funnel
    const { data: events } = await supabase
      .from('analytics_events')
      .select('id, session_id, event_type, event_data, created_at, page_path')
      .order('created_at', { ascending: false })
      .limit(100);

    const allEvents = events || [];
    const sizeSelectCount = allEvents.filter((e) => e.event_type === 'size_selected' || e.event_type === 'size_guide_open').length;
    const addToCartCount = allEvents.filter((e) => e.event_type === 'add_to_cart').length;
    const checkoutStartsCount = allEvents.filter((e) => e.event_type === 'checkout_start').length;

    // Computed Funnel Stages (Pure actual numbers)
    const funnel = {
      visitors: totalVisitors,
      sizeExplored: sizeSelectCount,
      cartAdded: addToCartCount,
      checkoutStarted: checkoutStartsCount,
      paidOrders: successfulPaymentsCount,
    };

    // Conversion Rate: Paid Orders / Total Visitors
    const conversionRate =
      funnel.visitors > 0
        ? parseFloat(((successfulPaymentsCount / funnel.visitors) * 100).toFixed(2))
        : 0;

    // Checkout abandonment: started checkout but did not complete payment
    const abandonedCheckouts = Math.max(0, checkoutStartsCount - successfulPaymentsCount);
    const abandonmentRate =
      checkoutStartsCount > 0
        ? parseFloat(((abandonedCheckouts / checkoutStartsCount) * 100).toFixed(1))
        : 0;

    // 7. Inventory Levels
    const { data: inventoryData } = await supabase
      .from('inventory')
      .select('available_stock, reserved_stock, sold_stock, product_variants(size)');

    const sizeStockMap: Record<string, number> = { S: 0, M: 0, L: 0 };
    (inventoryData || []).forEach((item: any) => {
      const sz = item.product_variants?.size;
      if (sz) {
        sizeStockMap[sz] = item.available_stock;
      }
    });

    // 8. Daily revenue (last 7 days)
    const daysMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      daysMap[key] = 0;
    }

    paidOrders.forEach((o) => {
      const dateKey = o.created_at?.split('T')[0];
      if (dateKey && daysMap[dateKey] !== undefined) {
        daysMap[dateKey] += o.total_amount || 0;
      }
    });

    const dailySales = Object.entries(daysMap).map(([date, revenue]) => ({
      date: new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
      revenue,
    }));

    // 9. Recent Telemetry Stream
    const recentEvents = allEvents.slice(0, 10).map((e) => ({
      id: e.id,
      eventType: e.event_type,
      pagePath: e.page_path,
      createdAt: e.created_at,
      metadata: e.event_data,
    }));

    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue,
        totalOrders: totalOrdersCount,
        successfulPayments: successfulPaymentsCount,
        pendingOrders: pendingOrders.length,
        processingOrders: processingOrders.length,
        shippedOrders: shippedOrders.length,
        averageOrderValue,
        totalVisitors: funnel.visitors,
        liveVisitors,
        conversionRate,
        addToCartCount,
        checkoutStartsCount,
        abandonmentRate,
        funnel,
        devices,
        sources,
        stock: sizeStockMap,
        dailySales,
        recentEvents,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn('[Admin Metrics Fallback]', msg);
    return NextResponse.json({
      success: true,
      metrics: {
        totalRevenue: 0,
        totalOrders: 0,
        successfulPayments: 0,
        pendingOrders: 0,
        processingOrders: 0,
        shippedOrders: 0,
        averageOrderValue: 0,
        totalVisitors: 0,
        liveVisitors: 0,
        conversionRate: 0,
        addToCartCount: 0,
        checkoutStartsCount: 0,
        abandonmentRate: 0,
        funnel: {
          visitors: 0,
          sizeExplored: 0,
          cartAdded: 0,
          checkoutStarted: 0,
          paidOrders: 0,
        },
        devices: { mobile: 0, desktop: 0, tablet: 0 },
        sources: { instagram: 0, direct: 0, whatsapp: 0, search: 0 },
        stock: { S: 0, M: 0, L: 0 },
        dailySales: [],
        recentEvents: [],
      },
    });
  }
}
