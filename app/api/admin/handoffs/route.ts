// app/api/admin/handoffs/route.ts
// Get full handoff graph, or replace all handoffs atomically (admin only).

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_lib';
import { invalidateCache } from '@/lib/agents/config-cache';

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  const { data, error } = await ctx.supabase
    .from('agent_handoffs')
    .select('*, source:agent_configs!source_agent_id(id, name, slug), target:agent_configs!target_agent_id(id, name, slug)')
    .order('sort_order');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  let handoffs: Record<string, unknown>[];
  try {
    handoffs = await req.json();
    if (!Array.isArray(handoffs)) throw new Error('Expected array');
  } catch {
    return NextResponse.json({ error: 'Expected JSON array of handoffs' }, { status: 400 });
  }

  // Delete all existing handoffs then bulk-insert new ones
  const { error: deleteError } = await ctx.supabase
    .from('agent_handoffs')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all rows

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (handoffs.length > 0) {
    const { data, error: insertError } = await ctx.supabase
      .from('agent_handoffs')
      .insert(handoffs)
      .select();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    invalidateCache();
    return NextResponse.json(data);
  }

  invalidateCache();
  return NextResponse.json([]);
}
