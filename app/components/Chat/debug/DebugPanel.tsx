'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Icon } from '@/app/components/icons';
import type { DebugEvent } from '@/lib/hooks/use-debug-events';
import { DebugEventRow } from './DebugEventRow';

// --- Constants ---

const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  user_message:      { bg: 'rgba(52,152,219,0.18)',  fg: '#2980b9' },
  session:           { bg: 'rgba(107,203,119,0.12)', fg: '#6bcb77' },
  agent_thinking:    { bg: 'rgba(155,89,182,0.12)',  fg: '#9b59b6' },
  tool_call:         { bg: 'rgba(243,156,18,0.12)',  fg: '#f39c12' },
  tool_result:       { bg: 'rgba(46,204,113,0.12)',  fg: '#27ae60' },
  text_message:      { bg: 'rgba(52,152,219,0.10)',  fg: '#3498db' },
  pokemon_card:      { bg: 'rgba(231,76,60,0.12)',   fg: '#e74c3c' },
  evolution_card:    { bg: 'rgba(230,126,34,0.12)',  fg: '#e67e22' },
  type_matchup_card: { bg: 'rgba(26,188,156,0.12)',  fg: '#1abc9c' },
  team_card:         { bg: 'rgba(46,204,113,0.12)',  fg: '#2ecc71' },
  message_done:      { bg: 'rgba(44,62,80,0.12)',    fg: '#7f8c8d' },
  done:              { bg: 'rgba(127,140,141,0.10)', fg: '#95a5a6' },
  error:             { bg: 'rgba(255,0,0,0.12)',     fg: '#ff4444' },
};

const CARD_EVENT_TYPES = new Set(['pokemon_card', 'evolution_card', 'type_matchup_card', 'team_card']);
const TOOL_EVENT_TYPES = new Set(['tool_call', 'tool_result']);

// --- Props ---

interface DebugPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  events: DebugEvent[];
  traceId: string | null;
  sessionId: string | null;
  onClearEvents: () => void;
}

// --- Component ---

export function DebugPanel({ isOpen, onToggle, events, traceId, sessionId, onClearEvents }: DebugPanelProps) {
  const [width, setWidth] = useState(380);
  const [filter, setFilter] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  // Auto-scroll on new events
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [events.length]);

  // Drag resize handlers
  const handleDragStart = useCallback((e: React.PointerEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [width]);

  const handleDragMove = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const delta = startXRef.current - e.clientX;
    const newWidth = Math.min(800, Math.max(300, startWidthRef.current + delta));
    setWidth(newWidth);
  }, []);

  const handleDragEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  // Filter events
  const filteredEvents = filter
    ? events.filter(e =>
        e.eventType.toLowerCase().includes(filter.toLowerCase()) ||
        e.preview.toLowerCase().includes(filter.toLowerCase())
      )
    : events;

  // Compute stats
  const totalElapsed = events.length > 0
    ? events[events.length - 1].elapsed
    : 0;
  const msgCount = events.filter(e => e.eventType === 'user_message' || e.eventType === 'message_done').length;
  const toolCount = events.filter(e => TOOL_EVENT_TYPES.has(e.eventType)).length;
  const cardCount = events.filter(e => CARD_EVENT_TYPES.has(e.eventType)).length;

  // Export
  const handleExport = useCallback(() => {
    const filename = `debug-${traceId || 'session'}-${Date.now()}.json`;
    const blob = new Blob([JSON.stringify({ traceId, sessionId, events }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [events, traceId, sessionId]);

  // Server debug export
  const handleServerExport = useCallback(async () => {
    if (!sessionId) return;
    const res = await fetch(`/api/chat/debug?sessionId=${sessionId}`);
    if (!res.ok) return;
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `server-debug-${sessionId}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [sessionId]);

  // Copy to clipboard
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(JSON.stringify(events, null, 2)).catch(() => {});
  }, [events]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed right-0 top-0 h-screen bg-[var(--surfaces-base-primary)] border-l border-[var(--border-default)] z-50 flex flex-col shadow-xl"
      style={{ width }}
    >
      {/* Drag handle */}
      <div
        className="absolute left-0 top-0 h-full w-1 cursor-col-resize bg-transparent hover:bg-[var(--surfaces-brand-interactive)] transition-colors"
        onPointerDown={handleDragStart}
        onPointerMove={handleDragMove}
        onPointerUp={handleDragEnd}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-default)] shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="Bug" size="sm" color="var(--surfaces-brand-interactive)" />
          <span className="text-xs font-semibold text-[var(--typography-primary)]">Debug Panel</span>
          {traceId && (
            <span className="text-[10px] font-mono text-[var(--typography-secondary)] truncate max-w-[100px]">
              {traceId.slice(0, 8)}…
            </span>
          )}
        </div>
        <button
          onClick={onToggle}
          className="p-1 rounded text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)] transition-colors"
          aria-label="Close debug panel"
        >
          <Icon name="X" size="sm" />
        </button>
      </div>

      {/* Filter */}
      <div className="px-3 py-2 border-b border-[var(--border-default)] shrink-0">
        <input
          type="text"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          placeholder="Filter events..."
          className="w-full text-xs bg-[var(--surfaces-base-low-contrast)] rounded px-2 py-1.5 text-[var(--typography-primary)] placeholder:text-[var(--typography-secondary)] outline-none border border-[var(--border-default)] focus:border-[var(--surfaces-brand-interactive)] transition-colors"
        />
      </div>

      {/* Event list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto text-xs">
        {filteredEvents.length === 0 && (
          <p className="text-center text-[var(--typography-secondary)] py-8 text-xs">
            {events.length === 0 ? 'No events yet. Send a message.' : 'No events match filter.'}
          </p>
        )}
        {filteredEvents.map((event, index) => (
          <DebugEventRow key={`${event.timestamp}-${index}`} event={event} />
        ))}
      </div>

      {/* Footer: stats + actions */}
      <div className="shrink-0 border-t border-[var(--border-default)]">
        {/* Stats */}
        <div className="flex items-center gap-2 px-3 py-2 text-[10px] text-[var(--typography-secondary)]">
          <span>Total {totalElapsed}ms</span>
          <span>·</span>
          <span>Msgs {msgCount}</span>
          <span>·</span>
          <span>Tools {toolCount}</span>
          <span>·</span>
          <span>Cards {cardCount}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 px-3 pb-3">
          <button
            onClick={handleExport}
            disabled={events.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)] transition-colors disabled:opacity-40"
            title="Export events as JSON"
          >
            <Icon name="Export" size="xs" />
            Export
          </button>
          {sessionId && (
            <button
              onClick={handleServerExport}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)] transition-colors"
              title="Download server trace"
            >
              <Icon name="Cloud" size="xs" />
              Server
            </button>
          )}
          <button
            onClick={handleCopy}
            disabled={events.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)] transition-colors disabled:opacity-40"
            title="Copy events to clipboard"
          >
            <Icon name="Copy" size="xs" />
            Copy
          </button>
          <button
            onClick={onClearEvents}
            disabled={events.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-red-500 hover:bg-[var(--surfaces-base-low-contrast)] transition-colors disabled:opacity-40"
            title="Clear all events"
          >
            <Icon name="Trash" size="xs" />
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}
