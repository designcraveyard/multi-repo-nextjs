"use client";

// --- Home Page — Monolithic PokéChat UI ---
// SSE streaming + Pokemon card rendering + debug panel + voice-ready input.

import { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { PokemonCard } from "@/app/components/Chat/cards/PokemonCard";
import { EvolutionCard } from "@/app/components/Chat/cards/EvolutionCard";
import { TypeMatchupCard } from "@/app/components/Chat/cards/TypeMatchupCard";
import { TeamCard } from "@/app/components/Chat/cards/TeamCard";
import { DebugPanel } from "@/app/components/Chat/debug/DebugPanel";
import { useDebugEvents } from "@/lib/hooks/use-debug-events";

// --- SSE animation styles ---
const SSE_STYLES = `
@keyframes star-rotate { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
@keyframes text-shimmer { 0%{background-position:200% center;} 100%{background-position:-200% center;} }
.sse-star { display:inline-flex; animation: star-rotate 2s linear infinite; }
.sse-shimmer {
  background: linear-gradient(90deg, var(--typography-secondary) 0%, var(--typography-secondary) 40%, var(--typography-primary) 50%, var(--typography-secondary) 60%, var(--typography-secondary) 100%);
  background-size: 300% 100%;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: text-shimmer 2.5s linear infinite;
}`;

// --- Types ---
type CardPayload =
  | { type: "pokemon_card"; data: unknown }
  | { type: "evolution_card"; data: unknown }
  | { type: "type_matchup_card"; data: unknown }
  | { type: "team_card"; data: unknown };

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  agentName?: string;
  isStreaming?: boolean;
  eventLabel?: string; // "Searching Pokédex..." etc
  cards?: CardPayload[];
}

// --- Starter prompts ---
const STARTERS = [
  "Tell me about Charizard",
  "Build me a team around Garchomp",
  "What's Pikachu weak to?",
  "Show me Eevee's evolutions",
];

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sessions, setSessions] = useState<
    { id: string; title: string | null; last_message_at: string; message_count: number }[]
  >([]);

  const debugEvents = useDebugEvents();
  const scrollRef = useRef<HTMLDivElement>(null);
  const textBufferRef = useRef("");
  const currentAiIdRef = useRef<string>("");

  // --- Auto-scroll to bottom on new messages ---
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  // --- Load sessions when history opens ---
  useEffect(() => {
    if (!historyOpen) return;
    fetch("/api/chat/sessions")
      .then(r => r.ok ? r.json() : [])
      .then(setSessions)
      .catch(() => setSessions([]));
  }, [historyOpen]);

  // --- SSE event handler ---
  const handleEvent = useCallback((eventType: string, data: Record<string, unknown>, aiMsgId: string) => {
    switch (eventType) {
      case "session":
        if (data.sessionId) setSessionId(data.sessionId as string);
        break;

      case "agent_thinking":
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, eventLabel: "Thinking..." } : m
        ));
        break;

      case "tool_call":
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, eventLabel: (data.label as string) || "Working..." } : m
        ));
        break;

      case "text_delta": {
        const token = data.token as string;
        textBufferRef.current += token;
        const currentText = textBufferRef.current;
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, content: currentText, eventLabel: undefined } : m
        ));
        break;
      }

      case "pokemon_card":
      case "evolution_card":
      case "type_matchup_card":
      case "team_card":
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, cards: [...(m.cards ?? []), { type: eventType, data } as CardPayload] }
            : m
        ));
        break;

      case "message_done":
        textBufferRef.current = "";
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? {
                ...m,
                content: (data.fullText as string) || m.content,
                agentName: data.agentName as string,
                isStreaming: false,
                eventLabel: undefined,
              }
            : m
        ));
        break;

      case "error":
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, content: `Error: ${data.message || "Unknown error"}`, isStreaming: false }
            : m
        ));
        break;
    }
  }, []);

  // --- Send message ---
  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;

    const userId = `msg-${Date.now()}-u`;
    const aiId = `msg-${Date.now()}-a`;
    currentAiIdRef.current = aiId;
    textBufferRef.current = "";

    setMessages(prev => [
      ...prev,
      { id: userId, role: "user", content: trimmed },
      { id: aiId, role: "assistant", content: "", isStreaming: true, eventLabel: "Thinking...", cards: [] },
    ]);
    setInput("");
    setIsStreaming(true);
    debugEvents.captureEvent("user_message", { text: trimmed });

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, sessionId }),
      });

      const traceId = res.headers.get("X-Trace-Id");
      if (traceId) debugEvents.captureTraceId(traceId);

      if (!res.ok || !res.body) {
        setMessages(prev => prev.map(m =>
          m.id === aiId ? { ...m, content: "Failed to reach agent.", isStreaming: false } : m
        ));
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("event: ")) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            try {
              const data = JSON.parse(dataStr);
              debugEvents.captureEvent(currentEvent, data);
              handleEvent(currentEvent, data, aiId);
            } catch {
              // ignore malformed
            }
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection error";
      setMessages(prev => prev.map(m =>
        m.id === aiId ? { ...m, content: `Error: ${msg}`, isStreaming: false } : m
      ));
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, sessionId, debugEvents, handleEvent]);

  // --- Handle Enter key ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // --- Load session ---
  const loadSession = async (id: string) => {
    try {
      const res = await fetch(`/api/chat/sessions/${id}/messages`);
      if (!res.ok) return;
      const data = await res.json();
      const loaded: Message[] = data.map((msg: { id: string; role: string; content: string; agent_name: string }) => ({
        id: msg.id,
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content ?? "",
        agentName: msg.agent_name,
        cards: [],
      }));
      setMessages(loaded);
      setSessionId(id);
      setHistoryOpen(false);
      debugEvents.resetEvents();
    } catch {}
  };

  const newChat = () => {
    setMessages([]);
    setSessionId(null);
    textBufferRef.current = "";
    debugEvents.resetEvents();
  };

  const deleteSession = async (id: string) => {
    await fetch(`/api/chat/sessions/${id}`, { method: "DELETE" });
    setSessions(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--surfaces-base-primary)" }}>
      <style>{SSE_STYLES}</style>

      {/* --- History Sidebar --- */}
      {historyOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setHistoryOpen(false)}
          />
          <aside
            className="fixed left-0 top-0 h-screen w-80 z-50 flex flex-col"
            style={{
              background: "var(--surfaces-base-primary)",
              borderRight: "1px solid var(--border-default)",
            }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-default)" }}>
              <h2 className="font-semibold">Chats</h2>
              <button
                onClick={newChat}
                className="text-sm px-3 py-1 rounded-lg"
                style={{ background: "var(--surfaces-brand-interactive)", color: "white" }}
              >
                New
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {sessions.length === 0 ? (
                <p className="text-sm opacity-60 p-3">No previous chats</p>
              ) : (
                sessions.map(s => (
                  <div
                    key={s.id}
                    className="group flex items-center justify-between p-3 rounded-lg cursor-pointer hover:bg-black/5"
                  >
                    <div className="flex-1 min-w-0" onClick={() => loadSession(s.id)}>
                      <p className="text-sm font-medium truncate">{s.title ?? "New chat"}</p>
                      <p className="text-xs opacity-60">{s.message_count} messages</p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                      className="opacity-0 group-hover:opacity-100 text-xs px-2 py-1"
                      style={{ color: "var(--typography-secondary)" }}
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      )}

      {/* --- Main Chat Column --- */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header
          className="flex items-center justify-between px-4 py-3 border-b"
          style={{ borderColor: "var(--border-default)" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setHistoryOpen(true)}
              className="p-2 rounded-lg hover:bg-black/5"
              aria-label="Chat history"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </button>
            <h1 className="font-semibold text-lg">PokéChat</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={newChat}
              className="p-2 rounded-lg hover:bg-black/5"
              aria-label="New chat"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
            <button
              onClick={() => setDebugOpen(v => !v)}
              className="hidden md:flex p-2 rounded-lg hover:bg-black/5"
              aria-label="Debug panel"
              style={{ color: debugOpen ? "var(--surfaces-brand-interactive)" : undefined }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 2l1.5 1.5M16 2l-1.5 1.5M9 21v-3M15 21v-3M4 13h4M16 13h4M7.5 8h9v7a4.5 4.5 0 01-9 0z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center px-6 py-10">
              <div className="text-6xl mb-6">⚡</div>
              <h2 className="text-2xl font-semibold mb-2">Ask me anything about Pokémon</h2>
              <p className="text-sm opacity-60 mb-8 text-center max-w-md">
                Species info, team building, battle strategy — powered by PokéAPI and specialist agents.
              </p>
              <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                {STARTERS.map(s => (
                  <button
                    key={s}
                    onClick={() => sendMessage(s)}
                    className="text-sm px-4 py-2 rounded-full border transition hover:bg-black/5"
                    style={{ borderColor: "var(--border-default)" }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t px-4 py-3" style={{ borderColor: "var(--border-default)" }}>
          <div className="max-w-3xl mx-auto flex items-end gap-2">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about a Pokémon, team, or matchup..."
              rows={1}
              className="flex-1 resize-none rounded-2xl px-4 py-3 outline-none border"
              style={{
                borderColor: "var(--border-default)",
                background: "var(--surfaces-base-primary)",
                minHeight: "44px",
                maxHeight: "120px",
              }}
              disabled={isStreaming}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              className="rounded-full w-11 h-11 flex items-center justify-center disabled:opacity-40"
              style={{
                background: "var(--surfaces-brand-interactive)",
                color: "white",
              }}
              aria-label="Send"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* --- Debug Panel --- */}
      <DebugPanel
        isOpen={debugOpen}
        onToggle={() => setDebugOpen(v => !v)}
        events={debugEvents.events}
        traceId={debugEvents.traceId}
        sessionId={sessionId}
        onClearEvents={debugEvents.resetEvents}
      />
    </div>
  );
}

// --- Message Bubble (inline) ---
function MessageBubble({ message }: { message: Message }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className="max-w-[75%] px-4 py-2.5 rounded-2xl rounded-br-sm"
          style={{ background: "var(--surfaces-base-low-contrast)" }}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 max-w-[85%]">
      {message.agentName && (
        <p className="text-xs opacity-60 px-1">{message.agentName}</p>
      )}

      {message.eventLabel && !message.content && (
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit"
          style={{ background: "var(--surfaces-base-low-contrast)" }}
        >
          <span className="sse-star">✦</span>
          <span className="sse-shimmer text-sm">{message.eventLabel}</span>
        </div>
      )}

      {message.content && (
        <div className="prose prose-sm max-w-none" style={{ color: "var(--typography-primary)" }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      )}

      {message.cards && message.cards.length > 0 && (
        <div className="flex flex-col gap-3">
          {message.cards.map((card, i) => (
            <div key={i}>
              {card.type === "pokemon_card" && <PokemonCard data={card.data as never} />}
              {card.type === "evolution_card" && <EvolutionCard data={card.data as never} />}
              {card.type === "type_matchup_card" && <TypeMatchupCard data={card.data as never} />}
              {card.type === "team_card" && <TeamCard data={card.data as never} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
