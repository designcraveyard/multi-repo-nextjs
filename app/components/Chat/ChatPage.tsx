'use client';

import { useState } from 'react';
import { useChatStream } from '@/lib/hooks/use-chat-stream';
import { ChatHeader } from './ChatHeader';
import { ChatMessageList } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ChatHistorySheet } from './ChatHistorySheet';
import { DebugPanel } from './debug/DebugPanel';

// --- Component ---

export function ChatPage() {
  const [debugOpen, setDebugOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { messages, isStreaming, sessionId, sendMessage, loadSession, newChat, debugEvents } =
    useChatStream();

  return (
    <div className="flex h-screen bg-[var(--surfaces-base-primary)] overflow-hidden">
      {/* Chat history sidebar */}
      <ChatHistorySheet
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onLoadSession={loadSession}
        onNewChat={newChat}
      />

      {/* Main chat column */}
      <div
        className="flex flex-col flex-1 min-w-0 transition-all"
        style={{ marginRight: debugOpen ? 0 : 0 }}
      >
        <ChatHeader
          onHistoryToggle={() => setHistoryOpen(v => !v)}
          onDebugToggle={() => setDebugOpen(v => !v)}
          debugOpen={debugOpen}
          onNewChat={newChat}
        />

        <ChatMessageList messages={messages} />

        <ChatInput onSend={sendMessage} isStreaming={isStreaming} />
      </div>

      {/* Debug panel (desktop only, fixed right) */}
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
