// app/api/admin/agents/route.ts
// List and create agent configs (admin only).

import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../_lib';
import { invalidateCache } from '@/lib/agents/config-cache';

export async function GET(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  const { data, error } = await ctx.supabase
    .from('agent_configs')
    .select('*')
    .order('is_entry_point', { ascending: false })
    .order('name');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const ctx = await requireAdmin(req);
  if (ctx.error) return ctx.error;

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { data, error } = await ctx.supabase
    .from('agent_configs')
    .insert(body)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  invalidateCache();
  return NextResponse.json(data, { status: 201 });
}
