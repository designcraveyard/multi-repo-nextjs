// app/api/admin/agents/[id]/route.ts
// Get, update, and delete a single agent config (admin only).

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

  // Fetch agent with linked tools and handoffs in parallel
  const [agentRes, toolsRes, handoffsRes] = await Promise.all([
    ctx.supabase.from('agent_configs').select('*').eq('id', id).single(),
    ctx.supabase
      .from('agent_tools')
      .select('tool_id, tool_definitions(*)')
      .eq('agent_id', id),
    ctx.supabase
      .from('agent_handoffs')
      .select('*, target:agent_configs!target_agent_id(id, name, slug)')
      .eq('source_agent_id', id)
      .order('sort_order'),
  ]);

  if (agentRes.error) {
    return NextResponse.json({ error: agentRes.error.message }, { status: 404 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agentData = agentRes.data as Record<string, any>;
  return NextResponse.json({
    ...agentData,
    tools: toolsRes.data ?? [],
    handoffs: handoffsRes.data ?? [],
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Only allow updating specific fields
  const { model, temperature, system_prompt, name, slug, is_entry_point, is_background } = body;
  const updates: Record<string, unknown> = {};
  if (model !== undefined) updates.model = model;
  if (temperature !== undefined) updates.temperature = temperature;
  if (system_prompt !== undefined) updates.system_prompt = system_prompt;
  if (name !== undefined) updates.name = name;
  if (slug !== undefined) updates.slug = slug;
  if (is_entry_point !== undefined) updates.is_entry_point = is_entry_point;
  if (is_background !== undefined) updates.is_background = is_background;

  const { data, error } = await ctx.supabase
    .from('agent_configs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache();
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  const { id } = await params;

  const { error } = await ctx.supabase
    .from('agent_configs')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache();
  return new Response(null, { status: 204 });
}
