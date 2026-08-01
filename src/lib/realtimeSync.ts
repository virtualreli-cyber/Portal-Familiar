/**
 * Realtime Multi-Device Sync Engine
 * Handles instant real-time synchronization across devices (Mobile, PC, Tablet)
 * via Global WebSocket Relay (ntfy.sh), Local SSE, and BroadcastChannel.
 */

export interface RealtimeMessage {
  table: string;
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  newRow?: Record<string, unknown>;
  oldRow?: Record<string, unknown>;
  senderId?: string;
}

type RealtimeCallback = (msg: RealtimeMessage) => void;

const SENDER_ID = Math.random().toString(36).substring(2, 9);
const NTFY_TOPIC = 'portal_fam_sync_family_santos_2026';
const callbacks = new Set<RealtimeCallback>();

// 1. BroadcastChannel for same-device cross-tab sync
let broadcastChannel: BroadcastChannel | null = null;
if (typeof BroadcastChannel !== 'undefined') {
  try {
    broadcastChannel = new BroadcastChannel('portal_fam_sync_channel');
    broadcastChannel.onmessage = (event) => {
      const msg = event.data as RealtimeMessage;
      if (msg && msg.senderId !== SENDER_ID) {
        callbacks.forEach(cb => cb(msg));
      }
    };
  } catch (e) {
    console.warn('BroadcastChannel not supported:', e);
  }
}

// 2. Server-Sent Events (SSE) for local network sync (Mobile <-> PC Wi-Fi)
let eventSource: EventSource | null = null;
function initSSE() {
  if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;
  try {
    eventSource = new EventSource('/api/realtime-stream');
    eventSource.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as RealtimeMessage & { type?: string };
        if (msg.type === 'CONNECTED') return;
        if (msg && msg.senderId !== SENDER_ID) {
          callbacks.forEach(cb => cb(msg));
        }
      } catch {
        // ignore parse error
      }
    };
    eventSource.onerror = () => {
      if (eventSource) {
        eventSource.close();
        eventSource = null;
        setTimeout(initSSE, 5000);
      }
    };
  } catch (e) {
    console.warn('Local SSE not available:', e);
  }
}
initSSE();

// 3. Global WebSocket Relay (ntfy.sh) for Instant Cross-Network / Cross-Device Sync (4G/5G/Wi-Fi/Hosting)
let ntfyWs: WebSocket | null = null;
function initNtfyWS() {
  if (typeof window === 'undefined' || typeof WebSocket === 'undefined') return;
  try {
    const wsUrl = `wss://ntfy.sh/${NTFY_TOPIC}/ws`;
    ntfyWs = new WebSocket(wsUrl);
    
    ntfyWs.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data);
        if (raw.event === 'message' && raw.message) {
          const msg = JSON.parse(raw.message) as RealtimeMessage;
          if (msg && msg.table && msg.eventType && msg.senderId !== SENDER_ID) {
            callbacks.forEach(cb => cb(msg));
          }
        }
      } catch {
        // ignore non-json or unparseable messages
      }
    };

    ntfyWs.onclose = () => {
      setTimeout(initNtfyWS, 3000);
    };

    ntfyWs.onerror = () => {
      if (ntfyWs) ntfyWs.close();
    };
  } catch (e) {
    console.warn('Global WebSocket Relay not available:', e);
  }
}
initNtfyWS();

// 4. Polling & Sync Catchup for missed background updates (Mobile sleep, app switch, network drop)
let lastPollTime = Math.floor(Date.now() / 1000) - 60;
const processedMessageIds = new Set<string>();

async function pollMissedUpdates() {
  if (typeof window === 'undefined' || typeof fetch === 'undefined') return;
  try {
    const now = Math.floor(Date.now() / 1000);
    const sinceParam = `${Math.max(10, now - lastPollTime)}s`;
    lastPollTime = now;

    const res = await fetch(`https://ntfy.sh/${NTFY_TOPIC}/json?poll=1&since=${sinceParam}`);
    if (!res.ok) return;
    const text = await res.text();
    const lines = text.trim().split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const raw = JSON.parse(line);
        if (raw.id && processedMessageIds.has(raw.id)) continue;
        if (raw.id) processedMessageIds.add(raw.id);

        if (raw.event === 'message' && raw.message) {
          const msg = JSON.parse(raw.message) as RealtimeMessage;
          if (msg && msg.table && msg.eventType && msg.senderId !== SENDER_ID) {
            callbacks.forEach(cb => cb(msg));
          }
        }
      } catch {
        // ignore parse error
      }
    }
  } catch {
    // ignore network errors
  }
}

// Poll every 3 seconds for active clients
if (typeof window !== 'undefined') {
  setInterval(pollMissedUpdates, 3000);

  // Poll immediately on tab visibility / window focus
  const handleFocus = () => {
    if (document.visibilityState === 'visible') {
      pollMissedUpdates();
    }
  };
  document.addEventListener('visibilitychange', handleFocus);
  window.addEventListener('focus', handleFocus);
}

/** Subscribe a listener callback to real-time events */
export function subscribeRealtime(callback: RealtimeCallback): () => void {
  callbacks.add(callback);
  return () => {
    callbacks.delete(callback);
  };
}

/** Broadcast a mutation event to all other connected devices & tabs */
export function broadcastRealtime(message: Omit<RealtimeMessage, 'senderId'>): void {
  const fullMsg: RealtimeMessage = { ...message, senderId: SENDER_ID };

  // 1. BroadcastChannel (Same device, different tabs)
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage(fullMsg);
    } catch (e) {
      console.warn('BroadcastChannel error:', e);
    }
  }

  // 2. Local Network SSE Broadcast (Same dev server)
  fetch('/api/realtime-broadcast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fullMsg)
  }).catch(() => {
    // Ignore static host 404
  });

  // 3. Global WebSocket Relay Broadcast (ntfy.sh - Works across Internet, 4G, 5G, Wi-Fi, Netlify, Vercel)
  fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fullMsg)
  }).catch((err) => {
    console.warn('Global Relay broadcast error:', err);
  });
}


