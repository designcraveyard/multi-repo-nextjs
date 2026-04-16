'use client';

import type { TypeMatchupCardPayload } from '@/lib/agents/types';

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

interface TypeMatchupCardProps {
  data: TypeMatchupCardPayload;
}

// --- Component ---

export function TypeMatchupCard({ data }: TypeMatchupCardProps) {
  const { pokemon, weaknesses, resistances, immunities } = data;

  return (
    <div className="rounded-xl border border-[var(--border-default)] p-4 bg-[var(--surfaces-base-primary)] w-full max-w-sm">
      <h3 className="text-sm font-semibold text-[var(--typography-primary)] capitalize mb-3">
        {pokemon} — Type Matchups
      </h3>

      {/* Weaknesses */}
      {weaknesses.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-red-500 uppercase tracking-wide mb-1.5">
            Weak to
          </p>
          <div className="flex flex-wrap gap-1.5">
            {weaknesses.map(({ type, multiplier }) => (
              <div key={type} className="flex items-center gap-1">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold text-white capitalize"
                  style={{ backgroundColor: TYPE_COLOR_MAP[type.toLowerCase()] ?? '#A8A878' }}
                >
                  {type}
                </span>
                <span className="text-xs text-red-400 font-medium">×{multiplier}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Resistances */}
      {resistances.length > 0 && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1.5">
            Resists
          </p>
          <div className="flex flex-wrap gap-1.5">
            {resistances.map(({ type, multiplier }) => (
              <div key={type} className="flex items-center gap-1">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold text-white capitalize"
                  style={{ backgroundColor: TYPE_COLOR_MAP[type.toLowerCase()] ?? '#A8A878' }}
                >
                  {type}
                </span>
                <span className="text-xs text-green-500 font-medium">×{multiplier}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Immunities */}
      {immunities.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[var(--typography-secondary)] uppercase tracking-wide mb-1.5">
            Immune to
          </p>
          <div className="flex flex-wrap gap-1.5">
            {immunities.map(type => (
              <div key={type} className="flex items-center gap-1">
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-semibold text-white capitalize opacity-60"
                  style={{ backgroundColor: TYPE_COLOR_MAP[type.toLowerCase()] ?? '#A8A878' }}
                >
                  {type}
                </span>
                <span className="text-xs text-[var(--typography-secondary)] font-medium">×0</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
