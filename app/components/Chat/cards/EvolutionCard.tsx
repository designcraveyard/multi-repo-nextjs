'use client';

import type { EvolutionCardPayload } from '@/lib/agents/types';

// --- Props ---

interface EvolutionCardProps {
  data: EvolutionCardPayload;
}

// --- Component ---

export function EvolutionCard({ data }: EvolutionCardProps) {
  const { chain } = data;

  if (!chain || chain.length === 0) return null;

  return (
    <div className="rounded-xl border border-[var(--border-default)] p-4 bg-[var(--surfaces-base-primary)] w-full max-w-sm">
      <h3 className="text-sm font-semibold text-[var(--typography-secondary)] mb-3 uppercase tracking-wide">
        Evolution Chain
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        {chain.map((stage, index) => (
          <div key={stage.name} className="flex items-center gap-2">
            {/* Arrow + trigger (not before first stage) */}
            {index > 0 && (
              <div className="flex flex-col items-center gap-0.5">
                {stage.trigger && (
                  <span className="text-[10px] text-[var(--typography-secondary)] max-w-[60px] text-center leading-tight">
                    {stage.trigger}
                  </span>
                )}
                <span className="text-[var(--typography-secondary)] text-base">→</span>
              </div>
            )}

            {/* Stage: sprite + name */}
            <div className="flex flex-col items-center gap-1">
              <img
                src={stage.sprite}
                alt={stage.name}
                className="w-16 h-16 object-contain"
                loading="lazy"
              />
              <span className="text-xs font-medium text-[var(--typography-primary)] capitalize">
                {stage.name}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
