// app/api/chat/sessions/[id]/route.ts
// Delete a specific chat session (soft-delete via status update).

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth/api-auth';
import { deleteSession } from '@/lib/chat/sessions';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await authenticateRequest(req);
  if (auth.error) return auth.error;

  const { id } = await params;
  await deleteSession(id, auth.userId);
  return new NextResponse(null, { status: 204 });
}
