'use client';

// app/(authenticated)/admin/test/page.tsx
// Mini chat test interface for the agent pipeline.

import { useState, useRef, useEffect } from 'react';
import { useChatStream } from '@/lib/hooks/use-chat-stream';

// --- Component ---

export default function TestPage() {
  const [input, setInput] = useState('');
  const { messages, isStreaming, sessionId, sendMessage, debugEvents } = useChatStream();
  const logRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll messages
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-scroll event log
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [debugEvents.events]);

  async function handleSend() {
    if (!input.trim() || isStreaming) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Get last agent name from messages
  const lastAgent = [...messages].reverse().find((m) => m.agentName)?.agentName;
  const traceId = debugEvents.traceId;

  return (
    <div className="flex flex-col gap-4 max-w-[900px] h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Test Chat
        </h1>
        <div className="flex gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          {lastAgent && <span>Agent: <strong style={{ color: 'var(--text-primary)' }}>{lastAgent}</strong></span>}
          {traceId && <span>Trace: <code className="font-mono">{traceId.slice(0, 12)}…</code></span>}
          {sessionId && <span>Session: <code className="font-mono">{sessionId.slice(0, 8)}…</code></span>}
        </div>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        {/* Chat panel */}
        <div className="flex flex-col flex-1 rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
          {/* Messages */}
          <div
            ref={messagesRef}
            className="flex-1 overflow-y-auto p-4 flex flex-col gap-3"
            style={{ backgroundColor: 'var(--surfaces-base-primary)' }}
          >
            {messages.length === 0 && (
              <p className="text-sm text-center mt-8" style={{ color: 'var(--text-muted)' }}>
                Send a message to test the agent pipeline.
              </p>
            )}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[75%] px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor:
                      msg.role === 'user'
                        ? 'var(--surfaces-brand-interactive)'
                        : msg.role === 'event'
                        ? 'var(--surfaces-base-low-contrast)'
                        : 'var(--surfaces-base-high-contrast)',
                    color:
                      msg.role === 'user'
                        ? 'var(--text-inverse-primary)'
                        : 'var(--text-primary)',
                    fontStyle: msg.role === 'event' ? 'italic' : 'normal',
                  }}
                >
                  {msg.agentName && (
                    <p className="text-xs mb-1 opacity-60">{msg.agentName}</p>
                  )}
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div
            className="flex gap-2 p-3 border-t"
            style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surfaces-base-primary)' }}
          >
            <input
              className="flex-1 px-3 py-2 rounded-md border text-sm"
              style={{
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)',
                backgroundColor: 'var(--surfaces-base-primary)',
              }}
              placeholder="Type a message…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isStreaming}
            />
            <button
              onClick={handleSend}
              disabled={isStreaming || !input.trim()}
              className="px-4 py-2 rounded-md text-sm font-medium"
              style={{
                backgroundColor: isStreaming ? 'var(--surfaces-base-high-contrast)' : 'var(--surfaces-brand-interactive)',
                color: isStreaming ? 'var(--text-muted)' : 'var(--text-inverse-primary)',
                cursor: isStreaming ? 'not-allowed' : 'pointer',
              }}
            >
              {isStreaming ? '…' : 'Send'}
            </button>
          </div>
        </div>

        {/* Event log panel */}
        <div
          className="w-72 shrink-0 rounded-lg border flex flex-col overflow-hidden"
          style={{ borderColor: 'var(--border-default)' }}
        >
          <div
            className="px-3 py-2 border-b text-xs font-semibold"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-muted)', backgroundColor: 'var(--surfaces-base-low-contrast)' }}
          >
            Event Log
          </div>
          <div
            ref={logRef}
            className="flex-1 overflow-y-auto p-2 flex flex-col gap-1"
            style={{ backgroundColor: 'var(--surfaces-base-primary)' }}
          >
            {debugEvents.events.length === 0 && (
              <p className="text-xs text-center mt-4" style={{ color: 'var(--text-muted)' }}>
                No events yet.
              </p>
            )}
            {debugEvents.events.map((ev, i) => (
              <div
                key={i}
                className="text-xs px-2 py-1 rounded font-mono"
                style={{ backgroundColor: 'var(--surfaces-base-low-contrast)', color: 'var(--text-secondary)' }}
              >
                <span style={{ color: 'var(--text-brand)' }}>{ev.eventType}</span>
                {ev.preview && (
                  <span className="ml-1 opacity-60 truncate block">{ev.preview}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
