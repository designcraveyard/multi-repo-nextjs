import { tool } from '@openai/agents';
import { z } from 'zod';

interface ChainLink {
  species: { name: string; url: string };
  evolution_details: Array<{
    trigger: { name: string };
    min_level: number | null;
    item: { name: string } | null;
  }>;
  evolves_to: ChainLink[];
}

function walkChain(link: ChainLink): Array<{ name: string; id: number; sprite: string; trigger: string }> {
  const idMatch = link.species.url.match(/\/pokemon-species\/(\d+)/);
  const id = idMatch ? parseInt(idMatch[1]) : 0;
  const trigger = link.evolution_details.length > 0
    ? formatTrigger(link.evolution_details[0])
    : 'Base';

  const result = [{
    name: link.species.name,
    id,
    sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
    trigger,
  }];

  for (const next of link.evolves_to) {
    result.push(...walkChain(next));
  }
  return result;
}

function formatTrigger(detail: ChainLink['evolution_details'][0]): string {
  if (detail.min_level) return `Lv ${detail.min_level}`;
  if (detail.item) return detail.item.name.replace(/-/g, ' ');
  if (detail.trigger.name === 'trade') return 'Trade';
  return detail.trigger.name.replace(/-/g, ' ');
}

export const getEvolutionChain = tool({
  name: 'get_evolution_chain',
  description: 'Get the full evolution chain for a Pokémon, showing all stages and evolution triggers.',
  parameters: z.object({
    name: z.string().describe('Pokémon name'),
  }),
  execute: async ({ name }) => {
    const speciesRes = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${name.toLowerCase().trim()}`);
    if (!speciesRes.ok) return { error: `Species "${name}" not found` };
    const species = await speciesRes.json();

    const chainRes = await fetch(species.evolution_chain.url);
    if (!chainRes.ok) return { error: 'Failed to fetch evolution chain' };
    const chainData = await chainRes.json();

    return { chain: walkChain(chainData.chain) };
  },
});
