// lib/auth/api-auth.ts
// Shared auth helper for API routes — supports both cookie (web) and Bearer token (iOS/Android)

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export type AuthResult =
  | { userId: string; error: null }
  | { userId: null; error: NextResponse };

export async function authenticateRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const jwt = authHeader.slice(7);
    const client = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    );
    const { data: { user }, error } = await client.auth.getUser(jwt);
    if (error || !user) {
      return { userId: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    }
    return { userId: user.id, error: null };
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) {
    return { userId: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }
  return { userId: user.id, error: null };
}

export async function createAuthenticatedClient(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    const jwt = authHeader.slice(7);
    const client = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: { persistSession: false },
        global: { headers: { Authorization: `Bearer ${jwt}` } },
      },
    );
    return client;
  }

  return await createClient();
}
