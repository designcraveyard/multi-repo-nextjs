// app/api/chat/sessions/[id]/messages/route.ts
// Fetch all messages for a specific chat session.

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/api-auth';
import { getSessionMessages } from '@/lib/chat/sessions';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateRequest(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  const messages = await getSessionMessages(id);
  return NextResponse.json(messages);
}
