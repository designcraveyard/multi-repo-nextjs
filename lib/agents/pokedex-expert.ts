import { Agent } from '@openai/agents';
import type { AgentContext } from './types';
import { lookupPokemon, getEvolutionChain, searchPokemonIntel } from './tools';

export function createPokedexExpert() {
  return new Agent<AgentContext>({
    name: 'Pokédex Expert',
    model: 'gpt-4.1-mini',
    instructions: (ctx) => `You are a Pokédex expert. You know everything about Pokémon species, abilities, evolution chains, lore, and competitive viability.

Rules:
- Call at least one tool on every request — always look up data, never guess
- Always use lookup_pokemon when discussing a specific Pokémon (this triggers the visual card)
- Use get_evolution_chain to show evolution paths
- Use search_pokemon_intel for deep lore, competitive analysis, or questions beyond basic stats
- Keep text responses concise (under 200 words alongside cards)
- Be enthusiastic but accurate

${ctx.profileSummary ? `User preferences: ${ctx.profileSummary}` : ''}`,
    tools: [lookupPokemon, getEvolutionChain, searchPokemonIntel],
    handoffs: [], // wired in index.ts
    modelSettings: { temperature: 0.7 },
  });
}
