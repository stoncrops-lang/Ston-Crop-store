'use client';

import { AnalyticsEventType } from '@stoncrops/types';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('sc_session_id');
  if (!id) {
    id = 'sc_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    sessionStorage.setItem('sc_session_id', id);
  }
  return id;
}

export function trackEvent(eventType: AnalyticsEventType, metadata?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;

  const sessionId = getSessionId();
  const payload = {
    sessionId,
    eventType,
    pagePath: window.location.pathname,
    metadata: metadata || {},
  };

  try {
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {}
}

export function startHeartbeat(): () => void {
  if (typeof window === 'undefined') return () => {};

  const sessionId = getSessionId();
  const sendBeat = () => {
    try {
      fetch('/api/analytics/heartbeat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      }).catch(() => {});
    } catch {}
  };

  // Immediate first beat
  sendBeat();

  // Send beat every 30 seconds
  const interval = setInterval(sendBeat, 30000);

  // Send final beacon on unload
  const onUnload = () => {
    try {
      navigator.sendBeacon(
        '/api/analytics/heartbeat',
        JSON.stringify({ sessionId, isClosing: true })
      );
    } catch {}
  };

  window.addEventListener('beforeunload', onUnload);

  return () => {
    clearInterval(interval);
    window.removeEventListener('beforeunload', onUnload);
  };
}
