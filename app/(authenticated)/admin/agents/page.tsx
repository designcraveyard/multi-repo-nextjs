'use client';

// app/(authenticated)/admin/agents/page.tsx
// Table of all agent configs with navigation to editor.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- Types ---

interface Agent {
  id: string;
  name: string;
  slug: string;
  model: string;
  temperature: number;
  is_entry_point: boolean;
  is_background: boolean;
}

// --- Component ---

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/agents')
      .then((r) => r.json())
      .then((d) => {
        setAgents(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading agents…</p>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-[900px]">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Agents
        </h1>
        <button
          onClick={() => router.push('/admin/agents/new')}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{
            backgroundColor: 'var(--surfaces-brand-interactive)',
            color: 'var(--text-inverse-primary)',
          }}
        >
          New Agent
        </button>
      </div>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surfaces-base-low-contrast)' }}>
              {['Name', 'Slug', 'Model', 'Temp', 'Flags'].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left font-medium"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {agents.map((agent) => (
              <tr
                key={agent.id}
                className="cursor-pointer border-t transition-colors"
                style={{ borderColor: 'var(--border-muted)' }}
                onClick={() => router.push(`/admin/agents/${agent.id}`)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--surfaces-base-low-contrast)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {agent.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {agent.slug}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {agent.model}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {agent.temperature}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {agent.is_entry_point && (
                      <Badge label="Entry" accent />
                    )}
                    {agent.is_background && (
                      <Badge label="Background" />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {agents.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                  No agents configured.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Badge sub-component ---

function Badge({ label, accent = false }: { label: string; accent?: boolean }) {
  return (
    <span
      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
      style={{
        backgroundColor: accent
          ? 'var(--surfaces-brand-interactive)'
          : 'var(--surfaces-base-high-contrast)',
        color: accent ? 'var(--text-inverse-primary)' : 'var(--text-secondary)',
      }}
    >
      {label}
    </span>
  );
}
