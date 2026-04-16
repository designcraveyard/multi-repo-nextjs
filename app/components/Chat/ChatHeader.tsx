'use client';

import { Icon } from '@/app/components/icons';

// --- Props ---

interface ChatHeaderProps {
  onHistoryToggle: () => void;
  onDebugToggle: () => void;
  debugOpen: boolean;
  onNewChat: () => void;
}

// --- Component ---

export function ChatHeader({ onHistoryToggle, onDebugToggle, debugOpen, onNewChat }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] bg-[var(--surfaces-base-primary)] shrink-0">
      {/* Left: Title + New Chat */}
      <div className="flex items-center gap-3">
        <button
          onClick={onHistoryToggle}
          className="p-2 rounded-lg text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)] transition-colors"
          aria-label="Chat history"
        >
          <Icon name="Clock" size="md" />
        </button>
        <h1 className="text-base font-semibold text-[var(--typography-primary)]">
          PokéChat
        </h1>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        <button
          onClick={onNewChat}
          className="p-2 rounded-lg text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)] transition-colors"
          aria-label="New chat"
        >
          <Icon name="PencilSimple" size="md" />
        </button>
        {/* Debug toggle — desktop only */}
        <button
          onClick={onDebugToggle}
          className={`hidden md:flex p-2 rounded-lg transition-colors ${
            debugOpen
              ? 'text-[var(--surfaces-brand-interactive)] bg-[var(--surfaces-base-low-contrast)]'
              : 'text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)]'
          }`}
          aria-label="Toggle debug panel"
        >
          <Icon name="Bug" size="md" />
        </button>
      </div>
    </header>
  );
}
