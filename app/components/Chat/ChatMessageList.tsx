'use client';

import { useRef, useEffect } from 'react';
import { ChatMessage } from './ChatMessage';

// --- Types ---

interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant' | 'event';
  content: string;
  agentName?: string;
  cards?: Array<{ type: string; data: unknown }>;
}

interface ChatMessageListProps {
  messages: ChatMessageData[];
}

// --- Component ---

export function ChatMessageList({ messages }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-4 py-4"
    >
      {messages.length === 0 ? (
        /* Empty state */
        <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
          <span className="text-5xl" aria-hidden="true">
            ⚪
          </span>
          <p className="text-sm text-[var(--typography-secondary)] max-w-xs">
            Ask me anything about Pokémon!
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
          {messages.map(message => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>
      )}
    </div>
  );
}
