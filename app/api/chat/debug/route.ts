// app/api/chat/debug/route.ts
// Debug endpoint for inspecting trace data.
// Query by ?traceId=<id> for full trace or ?sessionId=<id> for session trace list.

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/api-auth';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error) return auth.error;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('sessionId');
  const traceId = searchParams.get('traceId');

  if (traceId) {
    const { data, error } = await supabase
      .from('debug_traces')
      .select('*')
      .eq('trace_id', traceId)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Trace not found' }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  if (sessionId) {
    const { data, error } = await supabase
      .from('debug_traces')
      .select('trace_id, started_at, total_ms, summary')
      .eq('session_id', sessionId)
      .order('started_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ sessionId, traces: data ?? [] });
  }

  return NextResponse.json({ error: 'Provide sessionId or traceId' }, { status: 400 });
}
