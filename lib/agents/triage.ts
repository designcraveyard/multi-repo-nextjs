import { Agent } from '@openai/agents';
import type { AgentContext } from './types';
import { saveMemory } from './tools';

export function createTriageAgent() {
  return new Agent<AgentContext>({
    name: 'PokéRouter',
    model: 'gpt-4.1-mini',
    instructions: (ctx) => `You are PokéRouter, the routing agent for a Pokémon assistant. Your ONLY job is to classify the user's intent and hand off to the right specialist. NEVER answer questions directly.

Routing rules:
- Species info, abilities, evolution chains, lore, Pokédex lookups → hand off to Pokédex Expert
- Team building, team suggestions, type coverage analysis → hand off to Team Builder
- Battle matchups, move recommendations, strategy, held items → hand off to Battle Strategist
- If the user states a preference ("I love Fire types", "my favorite is Pikachu"), save it as a memory and then route normally

${ctx.context.profileSummary ? `User preferences: ${ctx.context.profileSummary}` : ''}
${ctx.context.conversationHistory ? `Recent conversation:\n${ctx.context.conversationHistory}` : ''}`,
    tools: [saveMemory],
    handoffs: [], // wired in index.ts
    modelSettings: { temperature: 0.3 },
  });
}
