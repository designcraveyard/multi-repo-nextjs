// lib/chat/sessions.ts
// Chat session management — create sessions, load history, save messages.

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function createSession(userId: string): Promise<string> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      user_id: userId,
      status: 'active',
      started_at: new Date().toISOString(),
      last_message_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create session: ${error.message}`);
  return data.id;
}

export async function loadChatHistory(
  sessionId: string,
  limit = 20,
): Promise<Array<{ role: 'user' | 'assistant'; content: string }>> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('role, content')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: true })
    .limit(limit);

  if (error) throw new Error(`Failed to load chat history: ${error.message}`);
  return (data ?? []).map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));
}

export async function saveChatMessage(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
  meta?: { agent_name?: string; tool_calls?: unknown },
): Promise<void> {
  const supabase = getSupabase();

  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('session_id', sessionId);

  const nextSeq = (count ?? 0) + 1;

  await supabase.from('chat_messages').insert({
    session_id: sessionId,
    role,
    content,
    agent_name: meta?.agent_name ?? null,
    tool_calls: meta?.tool_calls ?? null,
    sequence_number: nextSeq,
    created_at: new Date().toISOString(),
  });

  await supabase
    .from('chat_sessions')
    .update({
      message_count: nextSeq,
      last_message_at: new Date().toISOString(),
      active_agent: meta?.agent_name ?? null,
    })
    .eq('id', sessionId);
}

export async function listSessions(userId: string, limit = 50) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('chat_sessions')
    .select('id, title, status, active_agent, message_count, last_message_at, started_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('last_message_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`Failed to list sessions: ${error.message}`);
  return data ?? [];
}

export async function getSessionMessages(sessionId: string) {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from('chat_messages')
    .select('id, role, content, agent_name, tool_calls, created_at, sequence_number')
    .eq('session_id', sessionId)
    .order('sequence_number', { ascending: true });

  if (error) throw new Error(`Failed to get messages: ${error.message}`);
  return data ?? [];
}

export async function deleteSession(sessionId: string, userId: string): Promise<void> {
  const supabase = getSupabase();

  const { data: session, error: fetchError } = await supabase
    .from('chat_sessions')
    .select('id, user_id')
    .eq('id', sessionId)
    .single();

  if (fetchError || !session) throw new Error(`Session not found`);
  if (session.user_id !== userId) throw new Error(`Unauthorized`);

  const { error } = await supabase.from('chat_sessions').delete().eq('id', sessionId);
  if (error) throw new Error(`Failed to delete session: ${error.message}`);
}

export async function setSessionTitle(sessionId: string, firstMessage: string): Promise<void> {
  const supabase = getSupabase();
  const title = firstMessage.length > 60 ? firstMessage.slice(0, 57) + '...' : firstMessage;
  await supabase.from('chat_sessions').update({ title }).eq('id', sessionId);
}
