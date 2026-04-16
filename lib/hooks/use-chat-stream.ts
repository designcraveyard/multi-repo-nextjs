'use client';

import { useState, useCallback, useRef } from 'react';
import { useDebugEvents } from './use-debug-events';

// --- Types ---

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'event';
  content: string;
  agentName?: string;
  cards?: Array<{ type: string; data: unknown }>;
}

// --- Hook ---

export function useChatStream() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const debugEvents = useDebugEvents();
  const textBufferRef = useRef('');
  const currentMsgIdRef = useRef('');

  const handleSSEEvent = useCallback((eventType: string, data: unknown, aiMsgId: string) => {
    const d = data as Record<string, unknown>;

    switch (eventType) {
      case 'session':
        if (d.sessionId) setSessionId(d.sessionId as string);
        break;

      case 'agent_thinking':
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId ? { ...m, role: 'event' as const, content: 'Thinking...' } : m
        ));
        break;

      case 'tool_call':
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId && m.role === 'event'
            ? { ...m, content: (d.label as string) || 'Working...' }
            : m
        ));
        break;

      case 'text_delta': {
        const token = d.token as string;
        textBufferRef.current += token;
        const currentText = textBufferRef.current;
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, role: 'assistant' as const, content: currentText }
            : m
        ));
        break;
      }

      case 'pokemon_card':
      case 'evolution_card':
      case 'type_matchup_card':
      case 'team_card':
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, cards: [...(m.cards ?? []), { type: eventType, data: d }] }
            : m
        ));
        break;

      case 'message_done':
        textBufferRef.current = '';
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? {
                ...m,
                role: 'assistant' as const,
                content: (d.fullText as string) || m.content,
                agentName: d.agentName as string,
              }
            : m
        ));
        break;

      case 'error':
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, role: 'assistant' as const, content: `Error: ${d.message || 'Unknown error'}` }
            : m
        ));
        break;
    }
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isStreaming) return;

    const userMsgId = `msg-${Date.now()}-user`;
    const aiMsgId = `msg-${Date.now()}-ai`;
    currentMsgIdRef.current = aiMsgId;
    textBufferRef.current = '';

    // Add user message + thinking placeholder
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: text },
      { id: aiMsgId, role: 'event', content: 'Thinking...', cards: [] },
    ]);
    setIsStreaming(true);
    debugEvents.captureEvent('user_message', { text });

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId }),
      });

      const serverTraceId = res.headers.get('X-Trace-Id');
      if (serverTraceId) debugEvents.captureTraceId(serverTraceId);

      if (!res.ok || !res.body) {
        setMessages(prev => prev.map(m =>
          m.id === aiMsgId
            ? { ...m, role: 'assistant' as const, content: 'Failed to get response.' }
            : m
        ));
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEventType = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEventType = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            try {
              const data = JSON.parse(dataStr);
              debugEvents.captureEvent(currentEventType, data);
              handleSSEEvent(currentEventType, data, aiMsgId);
            } catch {
              // Ignore malformed JSON
            }
          }
        }
      }
    } catch {
      setMessages(prev => prev.map(m =>
        m.id === aiMsgId
          ? { ...m, role: 'assistant' as const, content: 'Connection error.' }
          : m
      ));
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming, sessionId, debugEvents, handleSSEEvent]);

  const loadSession = useCallback(async (id: string) => {
    const res = await fetch(`/api/chat/sessions/${id}/messages`);
    if (!res.ok) return;
    const data = await res.json();
    setSessionId(id);

    const loaded: ChatMessage[] = data.map((msg: {
      id: string;
      role: string;
      content: string;
      agent_name: string;
      tool_calls: unknown;
    }) => ({
      id: msg.id,
      role: msg.role as 'user' | 'assistant',
      content: msg.content ?? '',
      agentName: msg.agent_name,
      cards: [],
    }));
    setMessages(loaded);
    debugEvents.resetEvents();
  }, [debugEvents]);

  const newChat = useCallback(() => {
    setMessages([]);
    setSessionId(null);
    textBufferRef.current = '';
    debugEvents.resetEvents();
  }, [debugEvents]);

  return { messages, isStreaming, sessionId, sendMessage, loadSession, newChat, debugEvents };
}
