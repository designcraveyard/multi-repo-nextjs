'use client';

import { useState, useCallback, useRef } from 'react';

// --- Types ---

export interface DebugEvent {
  timestamp: number;
  elapsed: number;
  eventType: string;
  payloadSize: number;
  payload: unknown;
  preview: string;
}

// --- Preview generator ---

function generatePreview(eventType: string, data: unknown): string {
  const d = data as Record<string, unknown>;
  switch (eventType) {
    case 'user_message': return `"${String(d.text ?? '').slice(0, 60)}"`;
    case 'session': return `Session: ${d.sessionId}`;
    case 'agent_thinking': return 'Agent thinking...';
    case 'tool_call': return `${d.toolName || d.label || 'tool'}`;
    case 'text_delta': return `"${String(d.token ?? '').slice(0, 30)}"`;
    case 'text_message': return `${d.tokenCount} tokens in ${d.streamDuration}ms`;
    case 'pokemon_card': return `${d.name} #${d.id}`;
    case 'evolution_card': return `${((d.chain as [])?.length ?? 0)} stages`;
    case 'type_matchup_card': return `${d.pokemon} matchup`;
    case 'team_card': return `${((d.team as [])?.length ?? 0)}-mon team`;
    case 'message_done': return `${d.agentName}: ${String(d.fullText ?? '').slice(0, 40)}...`;
    case 'done': return 'Stream closed';
    case 'error': return String(d.message ?? 'Error');
    default: return eventType;
  }
}

// --- Hook ---

export function useDebugEvents() {
  const [events, setEvents] = useState<DebugEvent[]>([]);
  const [traceId, setTraceId] = useState<string | null>(null);
  const firstTimestampRef = useRef<number | null>(null);
  const tokenBufferRef = useRef<{ count: number; startTime: number }>({ count: 0, startTime: 0 });

  const captureEvent = useCallback((eventType: string, data: unknown) => {
    const now = Date.now();
    if (firstTimestampRef.current === null) firstTimestampRef.current = now;

    // Buffer text_delta tokens — don't add individual events
    if (eventType === 'text_delta') {
      if (tokenBufferRef.current.count === 0) tokenBufferRef.current.startTime = now;
      tokenBufferRef.current.count++;
      return;
    }

    // Flush token buffer on message_done
    if (eventType === 'message_done' && tokenBufferRef.current.count > 0) {
      const { count, startTime } = tokenBufferRef.current;
      const streamDuration = now - startTime;
      setEvents(prev => [...prev, {
        timestamp: now,
        elapsed: now - firstTimestampRef.current!,
        eventType: 'text_message',
        payloadSize: 0,
        payload: { tokenCount: count, streamDuration, fullText: (data as Record<string, unknown>).fullText },
        preview: generatePreview('text_message', { tokenCount: count, streamDuration }),
      }]);
      tokenBufferRef.current = { count: 0, startTime: 0 };
    }

    const payloadStr = JSON.stringify(data);
    setEvents(prev => [...prev, {
      timestamp: now,
      elapsed: now - firstTimestampRef.current!,
      eventType,
      payloadSize: payloadStr.length,
      payload: data,
      preview: generatePreview(eventType, data),
    }]);
  }, []);

  const captureTraceId = useCallback((id: string) => {
    setTraceId(id);
  }, []);

  const resetEvents = useCallback(() => {
    setEvents([]);
    setTraceId(null);
    firstTimestampRef.current = null;
    tokenBufferRef.current = { count: 0, startTime: 0 };
  }, []);

  return { events, traceId, captureEvent, captureTraceId, resetEvents };
}
