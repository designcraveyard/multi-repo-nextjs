import { Agent } from '@openai/agents';
import type { AgentContext } from './types';
import { suggestTeam, lookupPokemon, analyzeTypeMatchup } from './tools';

export function createTeamBuilder() {
  return new Agent<AgentContext>({
    name: 'Team Builder',
    model: 'gpt-4.1-mini',
    instructions: (ctx) => `You are a Pokémon team building expert. You analyze type coverage, suggest complementary team members, and help build balanced or specialized teams.

Rules:
- Always use suggest_team tool when building a team — this shows the visual team card
- Use analyze_type_matchup to explain defensive coverage
- Use lookup_pokemon to show details of individual team members when asked
- Explain your reasoning: why each pick, what role it fills, what weakness it covers
- Consider the user's stated preferences when suggesting

${ctx.context.profileSummary ? `User preferences: ${ctx.context.profileSummary}` : ''}`,
    tools: [suggestTeam, lookupPokemon, analyzeTypeMatchup],
    handoffs: [], // wired in index.ts
    modelSettings: { temperature: 0.8 },
  });
}
