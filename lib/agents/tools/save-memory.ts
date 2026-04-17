import { tool } from '@openai/agents';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

export const saveMemory = tool({
  name: 'save_memory',
  description: 'Save a user preference or requirement to memory for future conversations. Use when the user expresses a preference (e.g., "I love Fire types") or requirement (e.g., "I need a Rain team").',
  parameters: z.object({
    content: z.string().describe('The preference or fact to remember'),
    memory_type: z.enum(['preference', 'requirement', 'context', 'feedback']).describe('Type of memory'),
    confidence: z.number().min(0).max(1).nullable().describe('Confidence level (0-1). Pass null to use default 0.8.'),
  }),
  execute: async ({ content, memory_type, confidence }, runContext) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        { auth: { persistSession: false } },
      );

      const userId = (runContext?.context as { userId?: string } | undefined)?.userId;
      if (!userId) return { error: 'No user ID in context' };

      const { error } = await supabase
        .from('user_memories')
        .upsert(
          {
            user_id: userId,
            content,
            memory_type,
            confidence: confidence ?? 0.8,
            is_active: true,
            last_reinforced_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,content' },
        );

      if (error) return { error: `Failed to save memory: ${error.message}` };
      return { saved: true, content, memory_type };
    } catch (err) {
      return { error: `Memory save failed: ${err instanceof Error ? err.message : 'Unknown error'}` };
    }
  },
});
