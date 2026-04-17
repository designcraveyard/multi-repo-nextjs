'use client';

import { useState, useEffect, useCallback } from 'react';
import { Icon } from '@/app/components/icons';

// --- Types ---

interface ChatSession {
  id: string;
  title: string | null;
  created_at: string;
  message_count?: number;
}

interface ChatHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSession: (id: string) => void;
  onNewChat: () => void;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

// --- Component ---

export function ChatHistorySheet({ isOpen, onClose, onLoadSession, onNewChat }: ChatHistorySheetProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/chat/sessions', { signal: controller.signal });
        const data = res.ok ? await res.json() : [];
        if (cancelled) return;
        setSessions(Array.isArray(data) ? data : []);
      } catch {
        if (cancelled) return;
        setSessions([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [isOpen]);

  const handleDelete = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await fetch(`/api/chat/sessions/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setSessions(prev => prev.filter(s => s.id !== id));
    }
  }, []);

  const handleLoadSession = useCallback((id: string) => {
    onLoadSession(id);
    onClose();
  }, [onLoadSession, onClose]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sheet */}
      <div
        className={`fixed left-0 top-0 h-full w-72 z-50 bg-[var(--surfaces-base-primary)] border-r border-[var(--border-default)] flex flex-col transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Chat history"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-default)] shrink-0">
          <h2 className="text-sm font-semibold text-[var(--typography-primary)]">Chat History</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)] transition-colors"
            aria-label="Close history"
          >
            <Icon name="X" size="md" />
          </button>
        </div>

        {/* New chat button */}
        <div className="px-3 py-2 shrink-0">
          <button
            onClick={() => { onNewChat(); onClose(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--typography-primary)] hover:bg-[var(--surfaces-base-low-contrast)] transition-colors"
          >
            <Icon name="PencilSimple" size="sm" />
            New Chat
          </button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 py-1">
          {loading && (
            <p className="text-xs text-[var(--typography-secondary)] text-center py-8">
              Loading...
            </p>
          )}

          {!loading && sessions.length === 0 && (
            <p className="text-xs text-[var(--typography-secondary)] text-center py-8">
              No previous chats
            </p>
          )}

          {!loading && sessions.map(session => (
            <div
              key={session.id}
              className="group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[var(--surfaces-base-low-contrast)] transition-colors mb-0.5"
              onClick={() => handleLoadSession(session.id)}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && handleLoadSession(session.id)}
            >
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-sm text-[var(--typography-primary)] truncate">
                  {session.title || 'New chat'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-[var(--typography-secondary)]">
                    {relativeTime(session.created_at)}
                  </span>
                  {session.message_count != null && (
                    <span className="text-[10px] text-[var(--typography-secondary)]">
                      · {session.message_count} msgs
                    </span>
                  )}
                </div>
              </div>
              {/* Delete button */}
              <button
                onClick={e => handleDelete(session.id, e)}
                className="shrink-0 p-1 rounded opacity-0 group-hover:opacity-100 text-[var(--typography-secondary)] hover:text-red-500 transition-all"
                aria-label={`Delete session`}
              >
                <Icon name="Trash" size="sm" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
