import { tool } from '@openai/agents';
import { z } from 'zod';

const COMPETITIVE_POOL = [
  { name: 'garchomp', id: 445, types: ['dragon', 'ground'], role: 'Sweeper' },
  { name: 'tyranitar', id: 248, types: ['rock', 'dark'], role: 'Tank' },
  { name: 'rotom-wash', id: 479, types: ['electric', 'water'], role: 'Pivot' },
  { name: 'ferrothorn', id: 598, types: ['grass', 'steel'], role: 'Wall' },
  { name: 'gengar', id: 94, types: ['ghost', 'poison'], role: 'Sweeper' },
  { name: 'dragonite', id: 149, types: ['dragon', 'flying'], role: 'Sweeper' },
  { name: 'scizor', id: 212, types: ['bug', 'steel'], role: 'Pivot' },
  { name: 'blissey', id: 242, types: ['normal'], role: 'Wall' },
  { name: 'landorus', id: 645, types: ['ground', 'flying'], role: 'Pivot' },
  { name: 'toxapex', id: 748, types: ['poison', 'water'], role: 'Wall' },
  { name: 'corviknight', id: 823, types: ['flying', 'steel'], role: 'Wall' },
  { name: 'dragapult', id: 887, types: ['dragon', 'ghost'], role: 'Sweeper' },
  { name: 'clefable', id: 36, types: ['fairy'], role: 'Support' },
  { name: 'magnezone', id: 462, types: ['electric', 'steel'], role: 'Trapper' },
  { name: 'gyarados', id: 130, types: ['water', 'flying'], role: 'Sweeper' },
  { name: 'excadrill', id: 530, types: ['ground', 'steel'], role: 'Sweeper' },
  { name: 'volcarona', id: 637, types: ['bug', 'fire'], role: 'Sweeper' },
  { name: 'slowbro', id: 80, types: ['water', 'psychic'], role: 'Wall' },
  { name: 'heatran', id: 485, types: ['fire', 'steel'], role: 'Pivot' },
  { name: 'weavile', id: 461, types: ['dark', 'ice'], role: 'Sweeper' },
  { name: 'hippowdon', id: 450, types: ['ground'], role: 'Wall' },
  { name: 'alakazam', id: 65, types: ['psychic'], role: 'Sweeper' },
  { name: 'skarmory', id: 227, types: ['steel', 'flying'], role: 'Wall' },
  { name: 'hydreigon', id: 635, types: ['dark', 'dragon'], role: 'Sweeper' },
  { name: 'tangrowth', id: 465, types: ['grass'], role: 'Wall' },
];

const ALL_TYPES = ['normal','fire','water','electric','grass','ice','fighting','poison','ground','flying','psychic','bug','rock','ghost','dragon','dark','steel','fairy'];

export const suggestTeam = tool({
  name: 'suggest_team',
  description: 'Build a competitive team around a core Pokémon, selecting 5 complementary teammates with type coverage analysis.',
  parameters: z.object({
    core_pokemon: z.string().describe('The Pokémon to build the team around'),
    strategy: z.string().optional().describe('Team strategy: "balanced", "offensive", "defensive", "rain", "sun"'),
  }),
  execute: async ({ core_pokemon, strategy }) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${core_pokemon.toLowerCase().trim()}`);
    if (!res.ok) return { error: `Pokémon "${core_pokemon}" not found` };
    const data = await res.json();

    const coreTypes: string[] = data.types.map((t: { type: { name: string } }) => t.type.name);
    const coreMember = {
      name: data.name,
      id: data.id,
      sprite: data.sprites.other?.['official-artwork']?.front_default ?? data.sprites.front_default,
      types: coreTypes,
      role: 'Core',
    };

    // Pick 5 teammates that cover the core's weaknesses
    const teamTypes = new Set(coreTypes);
    const team = [coreMember];
    const available = COMPETITIVE_POOL.filter((p) => p.name !== data.name);

    // Prioritize by coverage diversity
    const scored = available.map((p) => {
      const newTypes = p.types.filter((t) => !teamTypes.has(t)).length;
      const strategyBonus = strategy === 'offensive' && p.role === 'Sweeper' ? 2
        : strategy === 'defensive' && p.role === 'Wall' ? 2
        : 0;
      return { ...p, score: newTypes + strategyBonus };
    }).sort((a, b) => b.score - a.score);

    for (const pick of scored) {
      if (team.length >= 6) break;
      team.push({
        name: pick.name,
        id: pick.id,
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pick.id}.png`,
        types: pick.types,
        role: pick.role,
      });
      pick.types.forEach((t) => teamTypes.add(t));
    }

    // Coverage analysis
    const covered = new Set<string>();
    for (const member of team) {
      for (const t of member.types) covered.add(t);
    }
    const uncovered = ALL_TYPES.filter((t) => !covered.has(t));

    return {
      team,
      coverage: { uncovered, doubleResisted: [] },
    };
  },
});
