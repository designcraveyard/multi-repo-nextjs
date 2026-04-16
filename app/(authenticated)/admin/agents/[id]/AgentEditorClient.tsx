'use client';

// app/(authenticated)/admin/agents/[id]/AgentEditorClient.tsx
// Full editor for a single agent config.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- Types ---

interface ToolDefinition {
  id: string;
  name: string;
  slug: string;
}

interface AgentTool {
  tool_id: string;
  tool_definitions: ToolDefinition | null;
}

interface AgentDetail {
  id: string;
  name: string;
  slug: string;
  model: string;
  temperature: number;
  system_prompt: string | null;
  is_entry_point: boolean;
  is_background: boolean;
  tools: AgentTool[];
}

const MODEL_OPTIONS = ['gpt-4.1-mini', 'gpt-4.1', 'gpt-4o-mini', 'gpt-4o'];

// --- Component ---

export default function AgentEditorClient({ id }: { id: string }) {
  // --- State ---
  const [agent, setAgent] = useState<AgentDetail | null>(null);
  const [allTools, setAllTools] = useState<ToolDefinition[]>([]);
  const [linkedToolIds, setLinkedToolIds] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const router = useRouter();

  // --- Form fields ---
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [model, setModel] = useState('gpt-4.1-mini');
  const [temperature, setTemperature] = useState(0.7);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isEntryPoint, setIsEntryPoint] = useState(false);
  const [isBackground, setIsBackground] = useState(false);

  // --- Load data ---
  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/agents/${id}`).then((r) => r.json()),
      fetch('/api/admin/tools').then((r) => r.json()),
    ]).then(([a, t]: [AgentDetail, ToolDefinition[]]) => {
      setAgent(a);
      setAllTools(Array.isArray(t) ? t : []);
      setName(a.name ?? '');
      setSlug(a.slug ?? '');
      setModel(a.model ?? 'gpt-4.1-mini');
      setTemperature(a.temperature ?? 0.7);
      setSystemPrompt(a.system_prompt ?? '');
      setIsEntryPoint(a.is_entry_point ?? false);
      setIsBackground(a.is_background ?? false);
      const ids = new Set(
        (a.tools ?? []).map((t) => t.tool_id).filter(Boolean),
      );
      setLinkedToolIds(ids);
    });
  }, [id]);

  // --- Handlers ---
  function toggleTool(toolId: string) {
    setLinkedToolIds((prev) => {
      const next = new Set(prev);
      if (next.has(toolId)) next.delete(toolId);
      else next.add(toolId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/agents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, model, temperature, system_prompt: systemPrompt, is_entry_point: isEntryPoint, is_background: isBackground }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage({ text: 'Saved.', ok: true });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Save failed', ok: false });
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/admin/versions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage({ text: 'Version published.', ok: true });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Publish failed', ok: false });
    } finally {
      setPublishing(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete agent "${name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await fetch(`/api/admin/agents/${id}`, { method: 'DELETE' });
      router.push('/admin/agents');
    } catch {
      setDeleting(false);
    }
  }

  if (!agent) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading agent…</p>;
  }

  // --- Render ---
  return (
    <div className="flex flex-col gap-6 max-w-[720px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Edit Agent
        </h1>
        <div className="flex gap-2">
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="px-3 py-2 rounded-md text-sm font-medium border"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
          >
            {publishing ? 'Publishing…' : 'Publish Version'}
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-md text-sm font-medium"
            style={{ backgroundColor: 'var(--surfaces-brand-interactive)', color: 'var(--text-inverse-primary)' }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
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

      {/* --- Form --- */}
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

        <Field label="Model">
          <select
            className="w-full px-3 py-2 rounded-md border text-sm"
            style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)', backgroundColor: 'var(--surfaces-base-primary)' }}
            value={model}
            onChange={(e) => setModel(e.target.value)}
          >
            {MODEL_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </Field>

        <Field label={`Temperature: ${temperature.toFixed(1)}`}>
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            className="w-full"
          />
        </Field>

        <Field label="System Prompt">
          <textarea
            className="w-full px-3 py-2 rounded-md border text-sm font-mono"
            style={{
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)',
              backgroundColor: 'var(--surfaces-base-primary)',
              height: '300px',
              resize: 'vertical',
            }}
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
          />
        </Field>

        {/* Tools */}
        <Field label="Tools">
          <div className="flex flex-col gap-2">
            {allTools.length === 0 && (
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No tools defined.</p>
            )}
            {allTools.map((tool) => (
              <label key={tool.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={linkedToolIds.has(tool.id)}
                  onChange={() => toggleTool(tool.id)}
                />
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{tool.name}</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{tool.slug}</span>
              </label>
            ))}
          </div>
        </Field>

        {/* Toggles */}
        <Field label="Flags">
          <div className="flex flex-col gap-3">
            <Toggle label="Entry Point" checked={isEntryPoint} onChange={setIsEntryPoint} />
            <Toggle label="Background Agent" checked={isBackground} onChange={setIsBackground} />
          </div>
        </Field>
      </div>

      {/* Delete */}
      <div className="pt-4 border-t" style={{ borderColor: 'var(--border-muted)' }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-4 py-2 rounded-md text-sm font-medium border"
          style={{ borderColor: 'var(--border-error)', color: 'var(--text-error)' }}
        >
          {deleting ? 'Deleting…' : 'Delete Agent'}
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

// --- Toggle sub-component ---

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className="w-10 h-6 rounded-full transition-colors relative"
        style={{ backgroundColor: checked ? 'var(--surfaces-brand-interactive)' : 'var(--surfaces-base-high-contrast)' }}
      >
        <div
          className="absolute top-1 w-4 h-4 rounded-full transition-transform"
          style={{
            backgroundColor: 'white',
            transform: checked ? 'translateX(20px)' : 'translateX(4px)',
          }}
        />
      </div>
      <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{label}</span>
    </label>
  );
}
