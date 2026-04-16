// app/api/admin/versions/route.ts
// List versions and create new snapshots (admin only).

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_lib';

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  const { data, error } = await ctx.supabase
    .from('agent_versions')
    .select('id, version_number, published_at, notes')
    .order('published_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  let notes: string | undefined;
  try {
    const body = await req.json();
    notes = body?.notes;
  } catch {
    // notes is optional
  }

  // Snapshot all 4 config tables in parallel
  const [agentsRes, toolsRes, agentToolsRes, handoffsRes] = await Promise.all([
    ctx.supabase.from('agent_configs').select('*'),
    ctx.supabase.from('tool_definitions').select('*'),
    ctx.supabase.from('agent_tools').select('*'),
    ctx.supabase.from('agent_handoffs').select('*').order('sort_order'),
  ]);

  if (agentsRes.error || toolsRes.error || agentToolsRes.error || handoffsRes.error) {
    return NextResponse.json({ error: 'Failed to snapshot configs' }, { status: 500 });
  }

  const snapshot = {
    agents: agentsRes.data,
    tools: toolsRes.data,
    agent_tools: agentToolsRes.data,
    handoffs: handoffsRes.data,
  };

  const { data, error } = await ctx.supabase
    .from('agent_versions')
    .insert({ snapshot, notes: notes ?? null })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
