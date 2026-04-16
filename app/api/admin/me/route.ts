// app/api/admin/me/route.ts
// Returns whether the current user is an admin and their role.

import { NextRequest, NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { authenticateRequest } from '@/lib/auth/api-auth';

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error) return auth.error;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase: SupabaseClient<any> = createClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  const { data } = await supabase
    .from('admin_roles')
    .select('role')
    .eq('user_id', auth.userId)
    .single();

  if (!data) {
    return NextResponse.json({ isAdmin: false, role: null });
  }

  return NextResponse.json({ isAdmin: true, role: data.role });
}
