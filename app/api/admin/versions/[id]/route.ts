// app/api/admin/versions/[id]/route.ts
// Get a version snapshot and roll back to it (admin only).

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../_lib';
import { invalidateCache } from '@/lib/agents/config-cache';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  const { id } = await params;

  const { data, error } = await ctx.supabase
    .from('agent_versions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

// POST /api/admin/versions/[id] — rollback to this snapshot
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  const { id } = await params;

  // Load the snapshot
  const { data: version, error: fetchError } = await ctx.supabase
    .from('agent_versions')
    .select('snapshot')
    .eq('id', id)
    .single();

  if (fetchError || !version?.snapshot) {
    return NextResponse.json({ error: 'Version not found' }, { status: 404 });
  }

  const snap = version.snapshot as {
    agents: Record<string, unknown>[];
    tools: Record<string, unknown>[];
    agent_tools: Record<string, unknown>[];
    handoffs: Record<string, unknown>[];
  };

  // Delete all 4 tables, then re-insert from snapshot
  const deleteResults = await Promise.all([
    ctx.supabase.from('agent_tools').delete().neq('agent_id', '00000000-0000-0000-0000-000000000000'),
    ctx.supabase.from('agent_handoffs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ctx.supabase.from('agent_configs').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ctx.supabase.from('tool_definitions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
  ]);

  for (const res of deleteResults) {
    if (res.error) {
      return NextResponse.json({ error: `Delete failed: ${res.error.message}` }, { status: 500 });
    }
  }

  // Re-insert in dependency order: tools → agents → agent_tools → handoffs
  const insertSteps: Array<{ table: string; rows: Record<string, unknown>[] }> = [
    { table: 'tool_definitions', rows: snap.tools ?? [] },
    { table: 'agent_configs', rows: snap.agents ?? [] },
    { table: 'agent_tools', rows: snap.agent_tools ?? [] },
    { table: 'agent_handoffs', rows: snap.handoffs ?? [] },
  ];

  for (const step of insertSteps) {
    if (step.rows.length === 0) continue;
    const { error: insertError } = await ctx.supabase.from(step.table).insert(step.rows);
    if (insertError) {
      return NextResponse.json(
        { error: `Insert into ${step.table} failed: ${insertError.message}` },
        { status: 500 },
      );
    }
  }

  invalidateCache();
  return NextResponse.json({ success: true, rolledBackTo: id });
}
