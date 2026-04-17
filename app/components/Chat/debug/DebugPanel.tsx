"use client";

// --- Debug Panel ---
// Resizable right-side panel rendered INLINE within the chat page (not a fixed overlay).
// Desktop only. Captures all SSE events with timestamps.

import { useState, useRef, useCallback, useEffect } from "react";
import { Icon } from "@/app/components/icons";

export interface DebugEvent {
  timestamp: number;
  elapsed: number;
  eventType: string;
  payloadSize: number;
  payload: unknown;
  preview: string;
}

interface DebugPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  events: DebugEvent[];
  traceId: string | null;
  sessionId: string | null;
  onClearEvents?: () => void;
}

const TYPE_COLORS: Record<string, { bg: string; fg: string }> = {
  user_message:       { bg: "rgba(52,152,219,0.18)", fg: "#2980b9" },
  session:            { bg: "rgba(107,203,119,0.12)", fg: "#6bcb77" },
  agent_thinking:     { bg: "rgba(155,89,182,0.12)",  fg: "#9b59b6" },
  tool_call:          { bg: "rgba(243,156,18,0.12)",  fg: "#f39c12" },
  tool_result:        { bg: "rgba(46,204,113,0.12)",  fg: "#27ae60" },
  text_message:       { bg: "rgba(52,152,219,0.10)",  fg: "#3498db" },
  pokemon_card:       { bg: "rgba(231,76,60,0.12)",   fg: "#e74c3c" },
  evolution_card:     { bg: "rgba(230,126,34,0.12)",  fg: "#e67e22" },
  type_matchup_card:  { bg: "rgba(26,188,156,0.12)",  fg: "#1abc9c" },
  team_card:          { bg: "rgba(46,204,113,0.12)",  fg: "#2ecc71" },
  message_done:       { bg: "rgba(44,62,80,0.12)",    fg: "#7f8c8d" },
  done:               { bg: "rgba(127,140,141,0.10)", fg: "#95a5a6" },
  error:              { bg: "rgba(255,0,0,0.12)",     fg: "#ff4444" },
};

const DEFAULT_COLOR = { bg: "rgba(150,150,150,0.10)", fg: "#999" };

export function DebugPanel({ isOpen, onToggle, events, traceId, sessionId, onClearEvents }: DebugPanelProps) {
  const [filter, setFilter] = useState("");
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const [width, setWidth] = useState(400);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(400);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - ev.clientX;
      const newWidth = Math.max(300, Math.min(800, startWidth.current + delta));
      setWidth(newWidth);
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, [width]);

  useEffect(() => {
    if (!scrollRef.current) return;
    requestAnimationFrame(() => {
      scrollRef.current!.scrollTop = scrollRef.current!.scrollHeight;
    });
  }, [events.length]);

  const [toast, setToast] = useState<string | null>(null);
  const [copyDropdownOpen, setCopyDropdownOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  }, []);

  const filteredEvents = filter
    ? events.filter(e => e.eventType.includes(filter) || e.preview.toLowerCase().includes(filter.toLowerCase()))
    : events;

  const getLastMessageEvents = useCallback(() => {
    let lastUserIdx = -1;
    for (let i = events.length - 1; i >= 0; i--) {
      if (events[i].eventType === "user_message") { lastUserIdx = i; break; }
    }
    return lastUserIdx >= 0 ? events.slice(lastUserIdx) : events;
  }, [events]);

  const copyEvents = useCallback((scope: "session" | "last") => {
    const data = scope === "last" ? getLastMessageEvents() : events;
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopyDropdownOpen(false);
    showToast(`Copied ${scope === "last" ? "last message" : "session"} logs (${data.length} events)`);
  }, [events, getLastMessageEvents, showToast]);

  const exportEvents = useCallback(() => {
    const blob = new Blob([JSON.stringify({ traceId, sessionId, events }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `debug-${traceId || sessionId || "trace"}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported debug trace as JSON");
  }, [events, traceId, sessionId, showToast]);

  const fetchServerTrace = useCallback(async () => {
    if (!sessionId) return;
    try {
      const res = await fetch(`/api/chat/debug?sessionId=${sessionId}`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `server-trace-${sessionId}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast("Downloaded server trace");
    } catch (err) {
      console.error("Failed to fetch server trace:", err);
      showToast("Failed to fetch server trace");
    }
  }, [sessionId, showToast]);

  if (!isOpen) return null;

  return (<>
    <style>{`
      .debug-action-btn { background: var(--surfaces-base-primary); color: var(--typography-secondary); border: 1px solid var(--border-default); }
      .debug-action-btn:hover { background: var(--surfaces-base-low-contrast); color: var(--typography-primary); }
      .debug-action-btn:active { transform: scale(0.97); }
      .debug-dropdown-item { color: var(--typography-secondary); }
      .debug-dropdown-item:hover { background: var(--surfaces-base-low-contrast); color: var(--typography-primary); }
    `}</style>
    <div
      className="hidden md:flex shrink-0 relative"
      style={{ width, height: "100vh", background: "var(--surfaces-base-primary)" }}
    >
      <div
        className="absolute left-0 top-0 bottom-0 w-[4px] cursor-col-resize z-10 hover:opacity-100 opacity-0 transition-opacity"
        style={{ background: "var(--surfaces-brand-interactive)" }}
        onMouseDown={onDragStart}
      />
      <div className="absolute left-[-3px] top-0 bottom-0 w-[10px] cursor-col-resize z-10" onMouseDown={onDragStart} />

      <div className="flex flex-col flex-1 overflow-hidden border-l" style={{ borderColor: "var(--border-default)" }}>
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 h-[40px] shrink-0 border-b"
          style={{ borderColor: "var(--border-default)", background: "var(--surfaces-base-low-contrast)" }}
        >
          <div className="flex items-center gap-2">
            <Icon name="Bug" size="sm" />
            <span className="text-[13px] font-semibold" style={{ color: "var(--typography-primary)", fontFamily: "ui-monospace, monospace" }}>
              Debug
            </span>
            <span
              className="text-[11px] px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--surfaces-base-primary)", color: "var(--typography-secondary)" }}
            >
              {events.length}
            </span>
            {traceId && (
              <span className="text-[11px] font-mono truncate max-w-[120px]" style={{ color: "var(--typography-secondary)", opacity: 0.7 }}>
                {traceId}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={exportEvents} className="debug-action-btn flex items-center gap-1 text-[11px] px-2 py-1 rounded" title="Export">
              <Icon name="ArrowSquareOut" size="xs" />
              Export
            </button>
            <button onClick={fetchServerTrace} className="debug-action-btn flex items-center gap-1 text-[11px] px-2 py-1 rounded" title="Server">
              <Icon name="Globe" size="xs" />
              Server
            </button>

            <div className="relative">
              <button
                onClick={() => setCopyDropdownOpen(prev => !prev)}
                className="debug-action-btn flex items-center gap-1 text-[11px] px-2 py-1 rounded"
                title="Copy logs"
              >
                <Icon name="Code" size="xs" />
                Copy
                <Icon name="CaretDown" size="xs" />
              </button>
              {copyDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setCopyDropdownOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-1 z-30 rounded py-1 min-w-[160px] shadow-lg"
                    style={{ background: "var(--surfaces-base-primary)", border: "1px solid var(--border-default)" }}
                  >
                    <button onClick={() => copyEvents("session")} className="debug-dropdown-item w-full text-left px-3 py-1.5 text-[11px]">
                      Entire session
                    </button>
                    <button onClick={() => copyEvents("last")} className="debug-dropdown-item w-full text-left px-3 py-1.5 text-[11px]">
                      Last message only
                    </button>
                  </div>
                </>
              )}
            </div>

            <button onClick={onToggle} className="ml-1 p-1 rounded" style={{ color: "var(--typography-secondary)" }}>
              <Icon name="X" size="sm" />
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 px-4 h-[32px] shrink-0 border-b" style={{ borderColor: "var(--border-default)" }}>
          <Icon name="MagnifyingGlass" size="xs" />
          <input
            type="text"
            placeholder="Filter by event type or content..."
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="flex-1 text-[11px] bg-transparent outline-none"
            style={{ color: "var(--typography-primary)", fontFamily: "ui-monospace, monospace" }}
          />
          {filter && (
            <button onClick={() => setFilter("")} className="p-0.5">
              <Icon name="X" size="xs" />
            </button>
          )}
        </div>

        {/* Events */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overflow-x-hidden"
          style={{ fontFamily: "ui-monospace, monospace", fontSize: 11, lineHeight: "18px" }}
        >
          {filteredEvents.map((evt, i) => {
            const colors = TYPE_COLORS[evt.eventType] ?? DEFAULT_COLOR;
            const isExpanded = expandedIdx === i;
            return (
              <div
                key={i}
                className="px-4 py-[3px] border-b cursor-pointer"
                style={{
                  borderColor: "var(--border-default)",
                  background: isExpanded ? "var(--surfaces-base-low-contrast)" : undefined,
                }}
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 tabular-nums" style={{ color: "var(--typography-secondary)", opacity: 0.7, width: 50, textAlign: "right" }}>
                    +{evt.elapsed}ms
                  </span>
                  <span
                    className="shrink-0 px-1.5 py-[1px] rounded text-[10px] font-medium"
                    style={{ background: colors.bg, color: colors.fg, minWidth: 72, textAlign: "center" }}
                  >
                    {evt.eventType}
                  </span>
                  <span className="truncate min-w-0" style={{ color: "var(--typography-secondary)" }}>
                    {evt.preview}
                  </span>
                  <span className="ml-auto shrink-0 tabular-nums" style={{ color: "var(--typography-secondary)", opacity: 0.6 }}>
                    {evt.payloadSize > 1024 ? `${(evt.payloadSize / 1024).toFixed(1)}K` : `${evt.payloadSize}B`}
                  </span>
                </div>
                {isExpanded && <ExpandedDetail evt={evt} />}
              </div>
            );
          })}
          {filteredEvents.length === 0 && (
            <div className="p-6 text-center text-[12px]" style={{ color: "var(--typography-secondary)", opacity: 0.7 }}>
              {events.length === 0 ? "No events yet — send a message to start capturing." : "No events match filter."}
            </div>
          )}
        </div>

        {/* Stats footer */}
        {events.length > 0 && (
          <div
            className="flex items-center gap-4 px-4 h-[28px] shrink-0 border-t text-[10px] tabular-nums"
            style={{ borderColor: "var(--border-default)", color: "var(--typography-secondary)", opacity: 0.8, fontFamily: "ui-monospace, monospace" }}
          >
            <span>Total {events[events.length - 1]?.elapsed ?? 0}ms</span>
            <span>Msgs {events.filter(e => e.eventType === "text_message").length}</span>
            <span>Tools {events.filter(e => e.eventType === "tool_call").length}</span>
            <span>Cards {events.filter(e => ["pokemon_card", "evolution_card", "type_matchup_card", "team_card"].includes(e.eventType)).length}</span>
            {onClearEvents && (
              <button
                onClick={() => { onClearEvents(); showToast("Logs cleared"); }}
                className="ml-auto debug-action-btn flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded"
              >
                <Icon name="Trash" size="xs" />
                Clear
              </button>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div
          className="absolute bottom-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded text-[11px] font-medium shadow-lg z-50"
          style={{ background: "var(--surfaces-brand-interactive)", color: "white" }}
        >
          {toast}
        </div>
      )}
    </div>
  </>);
}

function ExpandedDetail({ evt }: { evt: DebugEvent }) {
  const payload = evt.payload as Record<string, unknown>;
  const preStyle = {
    background: "var(--surfaces-base-primary)",
    color: "var(--typography-secondary)",
    maxHeight: 200,
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-all" as const,
  };
  const labelStyle = {
    color: "var(--typography-secondary)",
    opacity: 0.7,
    fontSize: 9,
    fontWeight: 600,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    marginBottom: 2,
  };

  if (evt.eventType === "text_message" && payload.fullText) {
    return (
      <div className="mt-1 mb-1 space-y-1">
        <div style={labelStyle}>{payload.tokenCount as number} tokens · streamed in {payload.streamDuration as string}</div>
        <pre className="p-2 rounded overflow-x-auto text-[10px] leading-[14px]" style={preStyle}>
          {payload.fullText as string}
        </pre>
      </div>
    );
  }

  if (evt.eventType === "error") {
    return (
      <div className="mt-1 mb-1 space-y-1">
        <pre className="p-2 rounded overflow-x-auto text-[10px] leading-[14px]" style={{ ...preStyle, color: "#ff4444" }}>
          {String(payload.message || "Unknown error")}
        </pre>
      </div>
    );
  }

  return (
    <pre className="mt-1 mb-1 p-2 rounded overflow-x-auto text-[10px] leading-[14px]" style={preStyle}>
      {JSON.stringify(evt.payload, null, 2)}
    </pre>
  );
}
