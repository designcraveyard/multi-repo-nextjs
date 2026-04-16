// app/api/admin/_lib.ts
// Shared admin auth helper for all admin API routes.
// Uses an untyped service role client because the admin tables (agent_configs,
// tool_definitions, agent_handoffs, agent_tools, agent_versions, admin_roles)
// are not yet reflected in the generated database.types.ts.

import { NextRequest, NextResponse } from 'next/server';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { authenticateRequest } from '@/lib/auth/api-auth';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AdminSupabase = SupabaseClient<any>;

export type AdminContext = {
  userId: string;
  supabase: AdminSupabase;
  error: null;
};

export type AdminContextError = {
  error: NextResponse;
  userId?: never;
  supabase?: never;
};

function makeServiceClient(): AdminSupabase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

export async function requireAdmin(
  req: NextRequest,
): Promise<AdminContext | AdminContextError> {
  const auth = await authenticateRequest(req);
  if (auth.error) return { error: auth.error };

  const supabase = makeServiceClient();

  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', auth.userId)
    .single();

  if (!data) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { userId: auth.userId, supabase, error: null };
}
