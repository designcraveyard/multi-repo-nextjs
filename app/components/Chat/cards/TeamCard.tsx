'use client';

import type { TeamCardPayload } from '@/lib/agents/types';

// --- Type color map ---

const TYPE_COLOR_MAP: Record<string, string> = {
  fire: '#F08030',
  water: '#6890F0',
  grass: '#78C850',
  electric: '#F8D030',
  psychic: '#F85888',
  ice: '#98D8D8',
  dragon: '#7038F8',
  dark: '#705848',
  fairy: '#EE99AC',
  normal: '#A8A878',
  fighting: '#C03028',
  flying: '#A890F0',
  poison: '#A040A0',
  ground: '#E0C068',
  rock: '#B8A038',
  bug: '#A8B820',
  ghost: '#705898',
  steel: '#B8B8D0',
};

// --- Props ---

interface TeamCardProps {
  data: TeamCardPayload;
}

// --- Component ---

export function TeamCard({ data }: TeamCardProps) {
  const { team, coverage } = data;

  return (
    <div className="rounded-xl border border-[var(--border-default)] p-4 bg-[var(--surfaces-base-primary)] w-full max-w-sm">
      <h3 className="text-sm font-semibold text-[var(--typography-secondary)] mb-3 uppercase tracking-wide">
        Team Suggestion
      </h3>

      {/* Team grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        {team.map(member => (
          <div
            key={member.name}
            className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[var(--surfaces-base-low-contrast)]"
          >
            <img
              src={member.sprite}
              alt={member.name}
              className="w-12 h-12 object-contain"
              loading="lazy"
            />
            <span className="text-xs font-medium text-[var(--typography-primary)] capitalize text-center">
              {member.name}
            </span>
            {/* Type badges (small) */}
            <div className="flex flex-wrap justify-center gap-0.5">
              {member.types.map(type => (
                <span
                  key={type}
                  className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold text-white capitalize"
                  style={{ backgroundColor: TYPE_COLOR_MAP[type.toLowerCase()] ?? '#A8A878' }}
                >
                  {type}
                </span>
              ))}
            </div>
            {/* Role */}
            {member.role && (
              <span className="text-[10px] text-[var(--typography-secondary)] text-center">
                {member.role}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Coverage summary */}
      {coverage && (
        <div className="pt-3 border-t border-[var(--border-default)]">
          {coverage.uncovered.length > 0 ? (
            <p className="text-xs text-amber-500">
              <span className="font-semibold">Uncovered: </span>
              {coverage.uncovered.join(', ')}
            </p>
          ) : (
            <p className="text-xs text-green-500 font-semibold">
              Full type coverage!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
