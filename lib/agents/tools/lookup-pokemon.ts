import { tool } from '@openai/agents';
import { z } from 'zod';

export const lookupPokemon = tool({
  name: 'lookup_pokemon',
  description: 'Look up a Pokémon by name or Pokédex number. Returns species data, stats, types, abilities, and sprite URL.',
  parameters: z.object({
    name: z.string().describe('Pokémon name (e.g. "charizard") or Pokédex number (e.g. "6")'),
  }),
  execute: async ({ name }) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().trim()}`);
    if (!res.ok) return { error: `Pokémon "${name}" not found` };
    const data = await res.json();
    return {
      name: data.name,
      id: data.id,
      sprite: data.sprites.other?.['official-artwork']?.front_default ?? data.sprites.front_default,
      types: data.types.map((t: { type: { name: string } }) => t.type.name),
      stats: data.stats.map((s: { stat: { name: string }; base_stat: number }) => ({
        name: s.stat.name,
        value: s.base_stat,
      })),
      abilities: data.abilities.map((a: { ability: { name: string } }) => a.ability.name),
      height: data.height / 10,
      weight: data.weight / 10,
    };
  },
});
