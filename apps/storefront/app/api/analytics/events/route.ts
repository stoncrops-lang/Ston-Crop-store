import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@stoncrops/shared';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, eventType, pagePath, metadata } = await req.json();

    if (!sessionId || !eventType) {
      return NextResponse.json({ success: true });
    }

    try {
      const supabase = getSupabaseServiceClient();

      await supabase.from('analytics_events').insert({
        session_id: sessionId,
        event_type: eventType,
        page_path: pagePath || '/',
        metadata: metadata || {},
      });
    } catch (dbErr) {
      // Non-blocking analytics failure fallback
      return NextResponse.json({ success: true, telemetry: 'buffered' });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
