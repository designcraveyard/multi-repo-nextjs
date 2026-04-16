'use client';

import { useState, useRef, useCallback } from 'react';
import { Icon } from '@/app/components/icons';

// --- Props ---

interface ChatInputProps {
  onSend: (text: string) => void;
  isStreaming: boolean;
}

// --- Component ---

export function ChatInput({ onSend, isStreaming }: ChatInputProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setText('');
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [text, isStreaming, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-grow
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, []);

  const isEmpty = !text.trim();

  return (
    <div className="shrink-0 px-4 py-3 border-t border-[var(--border-default)] bg-[var(--surfaces-base-primary)]">
      <div className="flex items-end gap-2 rounded-2xl border border-[var(--border-default)] bg-[var(--surfaces-base-low-contrast)] px-3 py-2 focus-within:border-[var(--surfaces-brand-interactive)] transition-colors">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask about any Pokémon..."
          disabled={isStreaming}
          rows={1}
          className="flex-1 resize-none bg-transparent text-sm text-[var(--typography-primary)] placeholder:text-[var(--typography-secondary)] outline-none leading-relaxed disabled:opacity-60"
          style={{ minHeight: '40px', maxHeight: '120px' }}
          aria-label="Message input"
        />
        <button
          onClick={handleSend}
          disabled={isEmpty || isStreaming}
          className="shrink-0 p-1.5 rounded-lg transition-colors disabled:opacity-40"
          style={{
            color: isEmpty || isStreaming ? 'var(--typography-secondary)' : 'var(--surfaces-brand-interactive)',
          }}
          aria-label="Send message"
        >
          <Icon name="PaperPlaneRight" weight="fill" size="md" />
        </button>
      </div>
      <p className="text-[10px] text-[var(--typography-secondary)] text-center mt-1.5">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
