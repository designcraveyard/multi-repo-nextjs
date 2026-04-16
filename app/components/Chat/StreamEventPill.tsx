'use client';

// --- Props ---

interface StreamEventPillProps {
  label: string;
}

// --- Component ---

export function StreamEventPill({ label }: StreamEventPillProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--surfaces-base-low-contrast)] max-w-fit">
      {/* Slowly rotating star icon */}
      <span
        className="text-[var(--typography-secondary)] text-sm leading-none animate-spin"
        style={{ animationDuration: '2s', display: 'inline-block' }}
        aria-hidden="true"
      >
        ✦
      </span>
      <span className="text-xs text-[var(--typography-secondary)] font-medium truncate max-w-[200px]">
        {label}
      </span>
    </div>
  );
}
