// app/(authenticated)/admin/agents/[id]/page.tsx
// Server wrapper — extracts the id param and renders the client editor.

import AgentEditorClient from './AgentEditorClient';

export default async function AgentEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AgentEditorClient id={id} />;
}
