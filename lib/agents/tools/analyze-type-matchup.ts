import { tool } from '@openai/agents';
import { z } from 'zod';

const TYPE_CHART: Record<string, { weaknesses: string[]; resistances: string[]; immunities: string[] }> = {
  normal: { weaknesses: ['fighting'], resistances: [], immunities: ['ghost'] },
  fire: { weaknesses: ['water', 'ground', 'rock'], resistances: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'], immunities: [] },
  water: { weaknesses: ['electric', 'grass'], resistances: ['fire', 'water', 'ice', 'steel'], immunities: [] },
  electric: { weaknesses: ['ground'], resistances: ['electric', 'flying', 'steel'], immunities: [] },
  grass: { weaknesses: ['fire', 'ice', 'poison', 'flying', 'bug'], resistances: ['water', 'electric', 'grass', 'ground'], immunities: [] },
  ice: { weaknesses: ['fire', 'fighting', 'rock', 'steel'], resistances: ['ice'], immunities: [] },
  fighting: { weaknesses: ['flying', 'psychic', 'fairy'], resistances: ['bug', 'rock', 'dark'], immunities: [] },
  poison: { weaknesses: ['ground', 'psychic'], resistances: ['fighting', 'poison', 'bug', 'grass', 'fairy'], immunities: [] },
  ground: { weaknesses: ['water', 'grass', 'ice'], resistances: ['poison', 'rock'], immunities: ['electric'] },
  flying: { weaknesses: ['electric', 'ice', 'rock'], resistances: ['fighting', 'bug', 'grass'], immunities: ['ground'] },
  psychic: { weaknesses: ['bug', 'ghost', 'dark'], resistances: ['fighting', 'psychic'], immunities: [] },
  bug: { weaknesses: ['fire', 'flying', 'rock'], resistances: ['fighting', 'grass', 'ground'], immunities: [] },
  rock: { weaknesses: ['water', 'grass', 'fighting', 'ground', 'steel'], resistances: ['normal', 'fire', 'poison', 'flying'], immunities: [] },
  ghost: { weaknesses: ['ghost', 'dark'], resistances: ['poison', 'bug'], immunities: ['normal', 'fighting'] },
  dragon: { weaknesses: ['ice', 'dragon', 'fairy'], resistances: ['fire', 'water', 'electric', 'grass'], immunities: [] },
  dark: { weaknesses: ['fighting', 'bug', 'fairy'], resistances: ['ghost', 'dark'], immunities: ['psychic'] },
  steel: { weaknesses: ['fire', 'fighting', 'ground'], resistances: ['normal', 'grass', 'ice', 'flying', 'psychic', 'bug', 'rock', 'dragon', 'steel', 'fairy'], immunities: ['poison'] },
  fairy: { weaknesses: ['poison', 'steel'], resistances: ['fighting', 'bug', 'dark'], immunities: ['dragon'] },
};

export const analyzeTypeMatchup = tool({
  name: 'analyze_type_matchup',
  description: 'Analyze type weaknesses, resistances, and immunities for a Pokémon based on its types.',
  parameters: z.object({
    name: z.string().describe('Pokémon name'),
  }),
  execute: async ({ name }) => {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase().trim()}`);
    if (!res.ok) return { error: `Pokémon "${name}" not found` };
    const data = await res.json();
    const types: string[] = data.types.map((t: { type: { name: string } }) => t.type.name);

    const effectiveness: Record<string, number> = {};
    const allTypes = Object.keys(TYPE_CHART);

    for (const attackType of allTypes) {
      effectiveness[attackType] = 1;
    }

    for (const defType of types) {
      const chart = TYPE_CHART[defType];
      if (!chart) continue;
      for (const w of chart.weaknesses) effectiveness[w] = (effectiveness[w] ?? 1) * 2;
      for (const r of chart.resistances) effectiveness[r] = (effectiveness[r] ?? 1) * 0.5;
      for (const i of chart.immunities) effectiveness[i] = 0;
    }

    return {
      pokemon: data.name,
      weaknesses: allTypes
        .filter((t) => effectiveness[t] > 1)
        .map((t) => ({ type: t, multiplier: effectiveness[t] })),
      resistances: allTypes
        .filter((t) => effectiveness[t] > 0 && effectiveness[t] < 1)
        .map((t) => ({ type: t, multiplier: effectiveness[t] })),
      immunities: allTypes.filter((t) => effectiveness[t] === 0),
    };
  },
});
