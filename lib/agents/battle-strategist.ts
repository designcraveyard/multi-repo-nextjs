import { Agent } from '@openai/agents';
import type { AgentContext } from './types';
import { analyzeTypeMatchup, getMoveDetails, lookupPokemon } from './tools';

export function createBattleStrategist() {
  return new Agent<AgentContext>({
    name: 'Battle Strategist',
    model: 'gpt-4.1-mini',
    instructions: (ctx) => `You are a Pokémon battle strategist. You analyze matchups, recommend moves, suggest held items, and develop battle plans.

Rules:
- Use analyze_type_matchup for defensive matchup analysis — shows the visual matchup card
- Use get_move_details when discussing specific moves
- Use lookup_pokemon to check stats when relevant
- Be specific: recommend exact moves, abilities, and held items
- Consider both singles and doubles formats unless specified
- Keep advice actionable and concise

${ctx.profileSummary ? `User preferences: ${ctx.profileSummary}` : ''}`,
    tools: [analyzeTypeMatchup, getMoveDetails, lookupPokemon],
    handoffs: [], // wired in index.ts
    modelSettings: { temperature: 0.6 },
  });
}
