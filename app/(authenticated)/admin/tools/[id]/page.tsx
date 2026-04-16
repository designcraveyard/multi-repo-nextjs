// app/(authenticated)/admin/tools/[id]/page.tsx
// Server wrapper — renders the client editor.

import ToolEditorClient from './ToolEditorClient';

export default async function ToolEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ToolEditorClient id={id} />;
}
