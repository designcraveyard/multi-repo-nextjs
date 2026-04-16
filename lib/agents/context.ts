// lib/agents/context.ts
// Per-request context loaded in parallel for all agents.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AgentContext } from './types';
import type { Trace } from './trace';

export async function loadAgentContext(
  userId: string,
  sessionId: string,
  supabase: SupabaseClient,
  trace: Trace,
): Promise<AgentContext> {
  trace.startTimer('load_context');

  const [memories, history] = await Promise.all([
    loadMemories(userId, supabase),
    loadConversationHistory(sessionId, supabase),
  ]);

  const profileSummary = buildProfileSummary(memories);
  const durationMs = trace.endTimer('load_context');
  trace.context('context_loaded', {
    memoryCount: memories?.length ?? 0,
    historyLength: history.length,
  }, durationMs);

  return {
    userId,
    sessionId,
    profileSummary,
    conversationHistory: history,
    rawMemories: memories,
    supabase,
    trace,
  };
}

async function loadMemories(
  userId: string,
  supabase: SupabaseClient,
): Promise<AgentContext['rawMemories']> {
  const { data, error } = await supabase
    .from('user_memories')
    .select('memory_type, content, confidence')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('confidence', { ascending: false })
    .limit(20);

  if (error) {
    console.warn('[context] Failed to load memories:', error.message);
    return null;
  }
  return data;
}

async function loadConversationHistory(
  sessionId: string,
  supabase: SupabaseClient,
): Promise<string> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: true })
    .limit(20);

  if (error || !data?.length) return '';

  return data
    .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
    .join('\n');
}

function buildProfileSummary(
  memories: AgentContext['rawMemories'],
): string {
  if (!memories?.length) return 'No known preferences yet.';

  const prefs = memories
    .filter((m) => m.memory_type === 'preference')
    .map((m) => m.content);
  const reqs = memories
    .filter((m) => m.memory_type === 'requirement')
    .map((m) => m.content);

  const parts: string[] = [];
  if (prefs.length) parts.push(`Preferences: ${prefs.join(', ')}`);
  if (reqs.length) parts.push(`Requirements: ${reqs.join(', ')}`);

  const summary = parts.join('. ');
  return summary.length > 300 ? summary.slice(0, 297) + '...' : summary;
}
