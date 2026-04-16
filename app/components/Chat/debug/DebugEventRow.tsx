'use client';

import { useState } from 'react';
import type { DebugEvent } from '@/lib/hooks/use-debug-events';

// --- Type colors ---

const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  user_message:     { bg: 'rgba(52,152,219,0.18)',  fg: '#2980b9' },
  session:          { bg: 'rgba(107,203,119,0.12)', fg: '#6bcb77' },
  agent_thinking:   { bg: 'rgba(155,89,182,0.12)',  fg: '#9b59b6' },
  tool_call:        { bg: 'rgba(243,156,18,0.12)',  fg: '#f39c12' },
  tool_result:      { bg: 'rgba(46,204,113,0.12)',  fg: '#27ae60' },
  text_message:     { bg: 'rgba(52,152,219,0.10)',  fg: '#3498db' },
  pokemon_card:     { bg: 'rgba(231,76,60,0.12)',   fg: '#e74c3c' },
  evolution_card:   { bg: 'rgba(230,126,34,0.12)', fg: '#e67e22' },
  type_matchup_card:{ bg: 'rgba(26,188,156,0.12)', fg: '#1abc9c' },
  team_card:        { bg: 'rgba(46,204,113,0.12)', fg: '#2ecc71' },
  message_done:     { bg: 'rgba(44,62,80,0.12)',   fg: '#7f8c8d' },
  done:             { bg: 'rgba(127,140,141,0.10)', fg: '#95a5a6' },
  error:            { bg: 'rgba(255,0,0,0.12)',     fg: '#ff4444' },
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return '';
  if (bytes < 1024) return `${bytes}B`;
  return `${(bytes / 1024).toFixed(1)}K`;
}

// --- Props ---

interface DebugEventRowProps {
  event: DebugEvent;
}

// --- Component ---

export function DebugEventRow({ event }: DebugEventRowProps) {
  const [expanded, setExpanded] = useState(false);
  const colors = TYPE_COLORS[event.eventType] ?? { bg: 'rgba(127,140,141,0.10)', fg: '#95a5a6' };
  const d = event.payload as Record<string, unknown>;

  return (
    <div
      className="border-b border-[var(--border-default)] last:border-0 cursor-pointer select-none"
      onClick={() => setExpanded(v => !v)}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-2 px-3 py-2 hover:bg-[var(--surfaces-base-low-contrast)] transition-colors text-xs">
        {/* Elapsed */}
        <span className="font-mono text-[var(--typography-secondary)] w-14 text-right shrink-0">
          +{event.elapsed}ms
        </span>

        {/* Type badge */}
        <span
          className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 min-w-[72px] text-center truncate"
          style={{ backgroundColor: colors.bg, color: colors.fg }}
        >
          {event.eventType}
        </span>

        {/* Preview */}
        <span className="flex-1 text-[var(--typography-primary)] truncate">
          {event.preview}
        </span>

        {/* Payload size */}
        {event.payloadSize > 0 && (
          <span className="font-mono text-[var(--typography-secondary)] shrink-0">
            {formatBytes(event.payloadSize)}
          </span>
        )}

        {/* Expand arrow */}
        <span className="text-[var(--typography-secondary)] shrink-0 ml-1" aria-hidden="true">
          {expanded ? '▾' : '▸'}
        </span>
      </div>

      {/* Expanded view */}
      {expanded && (
        <div className="px-3 pb-3 pt-1">
          {/* Special expanded views */}
          {event.eventType === 'tool_call' && (
            <div className="mb-2 flex flex-col gap-1 text-xs">
              {d.agentName != null && (
                <div><span className="text-[var(--typography-secondary)]">Agent: </span><span className="text-[var(--typography-primary)] font-medium">{String(d.agentName)}</span></div>
              )}
              {(d.toolName != null || d.tool != null) && (
                <div><span className="text-[var(--typography-secondary)]">Tool: </span><span style={{ color: colors.fg }} className="font-medium">{String(d.toolName ?? d.tool)}</span></div>
              )}
              {d.input != null && (
                <div>
                  <span className="text-[var(--typography-secondary)]">Input: </span>
                  <pre className="mt-1 text-[10px] text-[var(--typography-primary)] bg-[var(--surfaces-base-low-contrast)] rounded p-2 overflow-x-auto font-mono whitespace-pre-wrap">
                    {JSON.stringify(d.input, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {event.eventType === 'text_message' && (
            <div className="mb-2 flex flex-col gap-1 text-xs">
              <div><span className="text-[var(--typography-secondary)]">Tokens: </span><span className="text-[var(--typography-primary)] font-semibold">{String(d.tokenCount ?? '')}</span></div>
              <div><span className="text-[var(--typography-secondary)]">Duration: </span><span className="text-[var(--typography-primary)] font-semibold">{String(d.streamDuration ?? '')}ms</span></div>
            </div>
          )}

          {event.eventType === 'error' && d.message != null && (
            <div className="mb-2 text-xs">
              <span className="text-red-500 font-semibold">Error: </span>
              <span className="text-red-400">{String(d.message)}</span>
            </div>
          )}

          {/* Raw JSON */}
          <pre className="text-[10px] text-[var(--typography-secondary)] bg-[var(--surfaces-base-low-contrast)] rounded p-2 overflow-x-auto font-mono whitespace-pre-wrap max-h-48">
            {JSON.stringify(event.payload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
