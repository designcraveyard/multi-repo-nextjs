import { Agent } from '@openai/agents';
import type { AgentContext } from './types';
import { saveMemory } from './tools';

export function createMemoryAgent() {
  return new Agent<AgentContext>({
    name: 'Memory Extractor',
    model: 'gpt-4.1-mini',
    instructions: () => `You are a background agent that extracts user preferences from conversations. Analyze the exchange and save any new preferences or requirements.

Look for:
- Favorite Pokémon or types ("I love Fire types", "Charizard is my favorite")
- Playstyle preferences ("I prefer offensive teams", "I like stall")
- Generation preferences ("I only play Gen 1")
- Competitive format preferences ("I play VGC doubles")
- Team composition preferences ("I always run a Steel type")

Rules:
- Only save genuinely new information — don't repeat what's already known
- Use memory_type "preference" for likes/favorites
- Use memory_type "requirement" for must-haves or constraints
- Set confidence to 0.9 for explicit statements, 0.6 for implied preferences
- Don't save trivial observations ("user asked about Pikachu" is not a preference)`,
    tools: [saveMemory],
    handoffs: [],
    modelSettings: { temperature: 0.3 },
  });
}
