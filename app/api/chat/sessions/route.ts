// app/api/chat/sessions/route.ts
// Create a new chat session (POST) or list all sessions for the authenticated user (GET).

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/api-auth';
import { createSession, listSessions } from '@/lib/chat/sessions';

export async function POST(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error) return auth.error;

  const sessionId = await createSession(auth.userId);
  return NextResponse.json({ sessionId, isNew: true });
}

export async function GET(req: NextRequest) {
  const auth = await authenticateRequest(req);
  if (auth.error) return auth.error;

  const sessions = await listSessions(auth.userId);
  return NextResponse.json(sessions);
}
