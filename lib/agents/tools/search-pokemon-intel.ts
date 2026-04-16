import { tool } from '@openai/agents';
import { z } from 'zod';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';

export const searchPokemonIntel = tool({
  name: 'search_pokemon_intel',
  description: 'Search the Pokémon knowledge base using semantic search. Use for deep lore, competitive analysis, or questions that go beyond basic stats.',
  parameters: z.object({
    query: z.string().describe('Search query about Pokémon'),
  }),
  execute: async ({ query }) => {
    try {
      const openai = new OpenAI();
      const embeddingRes = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query,
      });

      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } },
      );

      const { data, error } = await supabase.rpc('search_intel', {
        query_embedding: embeddingRes.data[0].embedding,
        match_count: 5,
        filter_entity_type: 'pokemon_species',
      });

      if (error || !data?.length) {
        return { results: 'No matching knowledge found. Try using lookup_pokemon for basic data.' };
      }

      const formatted = data.map((r: { content_section: string; chunk_text: string; entity_name: string; similarity: number }) =>
        `## ${r.content_section} (${r.entity_name})\n${r.chunk_text}`
      ).join('\n\n---\n\n');

      return { results: formatted };
    } catch (err) {
      return { error: `Knowledge search failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
    }
  },
});
