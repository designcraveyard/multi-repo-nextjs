'use client';

// app/(authenticated)/admin/tools/[id]/ToolEditorClient.tsx
// Editor for a single tool definition.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- Types ---

interface ToolDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parameters_schema: unknown;
  tool_type: string | null;
}

// --- Component ---

export default function ToolEditorClient({ id }: { id: string }) {
  // --- State ---
  const [tool, setTool] = useState<ToolDetail | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parametersSchema, setParametersSchema] = useState('');
  const [schemaError, setSchemaError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const router = useRouter();

  // --- Load ---
  useEffect(() => {
    fetch(`/api/admin/tools/${id}`)
      .then((r) => r.json())
      .then((t: ToolDetail) => {
        setTool(t);
        setName(t.name ?? '');
        setSlug(t.slug ?? '');
        setDescription(t.description ?? '');
        setParametersSchema(
          t.parameters_schema ? JSON.stringify(t.parameters_schema, null, 2) : '',
        );
      });
  }, [id]);

  // --- Schema validation ---
  function validateSchema(value: string): boolean {
    if (!value.trim()) {
      setSchemaError(null);
      return true;
    }
    try {
      JSON.parse(value);
      setSchemaError(null);
      return true;
    } catch {
      setSchemaError('Invalid JSON');
      return false;
    }
  }

  // --- Handlers ---
  async function handleSave() {
    if (!validateSchema(parametersSchema)) return;
    setSaving(true);
    setMessage(null);
    try {
      const body: Record<string, unknown> = { name, description };
      if (parametersSchema.trim()) {
        body.parameters_schema = JSON.parse(parametersSchema);
      }
      const res = await fetch(`/api/admin/tools/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage({ text: 'Saved.', ok: true });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Save failed', ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete tool "${name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/tools/${id}`, { method: 'DELETE' });
      router.push('/admin/tools');
    } catch {
      setDeleting(false);
    }
  }

  if (!tool) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading tool…</p>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Edit Tool
        </h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{ backgroundColor: 'var(--surfaces-brand-interactive)', color: 'var(--text-inverse-primary)' }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      {message && (
        <p
          className="text-sm px-3 py-2 rounded-md"
          style={{
            backgroundColor: message.ok ? 'var(--surfaces-success-subtle)' : 'var(--surfaces-error-subtle)',
            color: message.ok ? 'var(--text-success)' : 'var(--text-error)',
          }}
        >
          {message.text}
        </p>
      )}

      <div className="flex flex-col gap-4">
        <Field label="Name">
          <input
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', backgroundColor: 'var(--surfaces-base-primary)' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Slug (readonly)">
          <input
            className="w-full px-3 py-2 rounded-md border text-sm font-mono"
            style={{ borderColor: 'var(--border-muted)', color: 'var(--text-muted)', backgroundColor: 'var(--surfaces-base-low-contrast)' }}
            value={slug}
            readOnly
          />
        </Field>

        <Field label="Description">
          <textarea
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--surfaces-base-primary)',
              height: '100px',
              resize: 'vertical',
            }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label="Parameters Schema (JSON)">
          <textarea
            className="w-full px-3 py-2 rounded-md border text-sm font-mono"
            style={{
              borderColor: schemaError ? 'var(--border-error)' : 'var(--border-default)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--surfaces-base-primary)',
              height: '200px',
              resize: 'vertical',
            }}
            value={parametersSchema}
            onChange={(e) => {
              setParametersSchema(e.target.value);
              validateSchema(e.target.value);
            }}
            spellCheck={false}
          />
          {schemaError && (
            <p className="text-xs" style={{ color: 'var(--text-error)' }}>
              {schemaError}
            </p>
          )}
        </Field>
      </div>

      <div className="pt-4 border-t" style={{ borderColor: 'var(--border-muted)' }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-md text-sm font-medium border"
          style={{ borderColor: 'var(--border-error)', color: 'var(--text-error)' }}
        >
          {deleting ? 'Deleting…' : 'Delete Tool'}
        </button>
      </div>
    </div>
  );
}

// --- Field sub-component ---

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
        {label}
      </label>
      {children}
    </div>
  );
}
