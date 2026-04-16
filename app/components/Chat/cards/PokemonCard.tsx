'use client';

import type { PokemonCardPayload } from '@/lib/agents/types';

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

const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  attack: 'ATK',
  defense: 'DEF',
  'special-attack': 'SP.A',
  'special-defense': 'SP.D',
  speed: 'SPD',
};

// --- Props ---

interface PokemonCardProps {
  data: PokemonCardPayload;
}

// --- Component ---

export function PokemonCard({ data }: PokemonCardProps) {
  const { name, id, sprite, types, stats, abilities, height, weight } = data;

  return (
    <div className="rounded-xl border border-[var(--border-default)] p-4 bg-[var(--surfaces-base-primary)] w-full max-w-sm">
      {/* Header: sprite + name/id */}
      <div className="flex items-center gap-4 mb-3">
        <img
          src={sprite}
          alt={name}
          className="w-24 h-24 object-contain"
          loading="lazy"
        />
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-semibold text-[var(--typography-primary)] capitalize">
            {name}
          </h3>
          <span className="text-sm text-[var(--typography-secondary)]">
            #{String(id).padStart(3, '0')}
          </span>
          {/* Type badges */}
          <div className="flex flex-wrap gap-1 mt-1">
            {types.map(type => (
              <span
                key={type}
                className="px-2 py-0.5 rounded-full text-xs font-semibold text-white capitalize"
                style={{ backgroundColor: TYPE_COLOR_MAP[type.toLowerCase()] ?? '#A8A878' }}
              >
                {type}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex flex-col gap-1.5 mb-3">
        {stats.map(stat => (
          <div key={stat.name} className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[var(--typography-secondary)] uppercase w-8 shrink-0">
              {STAT_LABELS[stat.name] ?? stat.name.slice(0, 3).toUpperCase()}
            </span>
            <span className="text-xs text-[var(--typography-secondary)] w-6 text-right shrink-0">
              {stat.value}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-[var(--surfaces-base-low-contrast)] overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (stat.value / 255) * 100)}%`,
                  backgroundColor: stat.value >= 100 ? '#78C850' : stat.value >= 60 ? '#F8D030' : '#F08030',
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Abilities */}
      {abilities.length > 0 && (
        <p className="text-xs text-[var(--typography-secondary)] mb-2">
          <span className="font-semibold">Abilities: </span>
          {abilities.map(a => a.replace(/-/g, ' ')).join(', ')}
        </p>
      )}

      {/* Footer: height + weight */}
      <div className="flex gap-4 text-xs text-[var(--typography-secondary)]">
        <span>Height: {(height / 10).toFixed(1)}m</span>
        <span>Weight: {(weight / 10).toFixed(1)}kg</span>
      </div>
    </div>
  );
}
