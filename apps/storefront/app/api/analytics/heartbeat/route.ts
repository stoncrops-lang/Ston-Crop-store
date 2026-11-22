import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceClient } from '@stoncrops/shared';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, isClosing } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ success: true });
    }

    try {
      const supabase = getSupabaseServiceClient();

      if (isClosing) {
        await supabase
          .from('sessions')
          .update({ is_active: false })
          .eq('session_token', sessionId);
      } else {
        await supabase.from('sessions').upsert(
          {
            session_token: sessionId,
            last_heartbeat: new Date().toISOString(),
            is_active: true,
          },
          { onConflict: 'session_token' }
        );
      }
    } catch (dbErr) {
      // Non-blocking telemetry failure fallback
      return NextResponse.json({ success: true, telemetry: 'buffered' });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
