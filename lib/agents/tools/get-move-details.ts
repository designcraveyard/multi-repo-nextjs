import { tool } from '@openai/agents';
import { z } from 'zod';

export const getMoveDetails = tool({
  name: 'get_move_details',
  description: 'Get detailed information about a Pokémon move including power, accuracy, PP, type, and effect.',
  parameters: z.object({
    name: z.string().describe('Move name (e.g. "flamethrower", "ice beam")'),
  }),
  execute: async ({ name }) => {
    const slug = name.toLowerCase().trim().replace(/ /g, '-');
    const res = await fetch(`https://pokeapi.co/api/v2/move/${slug}`);
    if (!res.ok) return { error: `Move "${name}" not found` };
    const data = await res.json();

    const effectEntry = data.effect_entries?.find(
      (e: { language: { name: string } }) => e.language.name === 'en'
    );

    return {
      name: data.name,
      type: data.type.name,
      power: data.power,
      accuracy: data.accuracy,
      pp: data.pp,
      damageClass: data.damage_class.name,
      effectText: effectEntry?.short_effect ?? 'No effect description available.',
    };
  },
});
