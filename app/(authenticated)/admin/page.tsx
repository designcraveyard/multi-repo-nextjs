'use client';

// app/(authenticated)/admin/page.tsx
// Admin dashboard — agent graph visualization and summary stats.

import { useEffect, useState } from 'react';

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

interface Handoff {
  id: string;
  source_agent_id: string;
  target_agent_id: string;
}

interface Tool {
  id: string;
  name: string;
}

interface Version {
  id: string;
  version_number: number;
  published_at: string;
}

// --- Component ---

export default function AdminDashboard() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [handoffs, setHandoffs] = useState<Handoff[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [latestVersion, setLatestVersion] = useState<Version | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/agents').then((r) => r.json()),
      fetch('/api/admin/handoffs').then((r) => r.json()),
      fetch('/api/admin/tools').then((r) => r.json()),
      fetch('/api/admin/versions').then((r) => r.json()),
    ]).then(([a, h, t, v]) => {
      setAgents(Array.isArray(a) ? a : []);
      setHandoffs(Array.isArray(h) ? h : []);
      setTools(Array.isArray(t) ? t : []);
      setLatestVersion(Array.isArray(v) && v.length > 0 ? v[0] : null);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading dashboard…</p>;
  }

  const entryAgent = agents.find((a) => a.is_entry_point);
  const specialists = agents.filter((a) => !a.is_entry_point && !a.is_background);
  const backgroundAgents = agents.filter((a) => a.is_background);

  // Count tools per agent (by looking at handoffs count as proxy — real count requires per-agent fetch)
  const handoffTargetIds = new Set(handoffs.map((h) => h.target_agent_id));

  return (
    <div className="flex flex-col gap-6 max-w-[1200px]">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Agent Dashboard
      </h1>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Agents', value: agents.length },
          { label: 'Total Tools', value: tools.length },
          { label: 'Last Version', value: latestVersion ? `v${latestVersion.version_number}` : 'None' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-4 border"
            style={{
              backgroundColor: 'var(--surfaces-base-low-contrast)',
              borderColor: 'var(--border-default)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
            <p className="text-2xl font-semibold mt-1" style={{ color: 'var(--text-primary)' }}>
              {stat.value}
            </p>
            {stat.label === 'Last Version' && latestVersion && (
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                {new Date(latestVersion.published_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Agent graph */}
      <div
        className="rounded-lg border p-6"
        style={{ borderColor: 'var(--border-default)', backgroundColor: 'var(--surfaces-base-primary)' }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
          Agent Graph
        </h2>

        {/* Entry agent */}
        {entryAgent && (
          <div className="flex flex-col items-center gap-0">
            <AgentCard agent={entryAgent} isEntry toolCount={handoffs.filter((h) => h.source_agent_id === entryAgent.id).length} />

            {specialists.length > 0 && (
              <>
                {/* Connector line down */}
                <div className="w-px h-6" style={{ backgroundColor: 'var(--border-default)' }} />

                {/* Specialist row */}
                <div className="flex flex-row flex-wrap gap-4 justify-center">
                  {specialists.map((agent) => (
                    <div key={agent.id} className="flex flex-col items-center gap-0">
                      <div className="w-px h-4" style={{ backgroundColor: 'var(--border-default)' }} />
                      <AgentCard
                        agent={agent}
                        toolCount={handoffs.filter((h) => h.source_agent_id === agent.id).length}
                        isReachable={handoffTargetIds.has(agent.id)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {!entryAgent && (
          <p style={{ color: 'var(--text-muted)' }}>No entry point agent configured.</p>
        )}

        {/* Background agents */}
        {backgroundAgents.length > 0 && (
          <div className="mt-6">
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
              Background Agents
            </p>
            <div className="flex flex-row flex-wrap gap-4">
              {backgroundAgents.map((agent) => (
                <AgentCard key={agent.id} agent={agent} isBackground toolCount={0} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- AgentCard sub-component ---

function AgentCard({
  agent,
  isEntry = false,
  isBackground = false,
  isReachable = false,
  toolCount,
}: {
  agent: Agent;
  isEntry?: boolean;
  isBackground?: boolean;
  isReachable?: boolean;
  toolCount: number;
}) {
  return (
    <div
      className="rounded-lg border px-4 py-3 min-w-[160px] text-center"
      style={{
        borderColor: isEntry ? 'var(--border-brand)' : 'var(--border-default)',
        backgroundColor: isEntry
          ? 'var(--surfaces-brand-interactive)'
          : isBackground
          ? 'var(--surfaces-base-low-contrast)'
          : 'var(--surfaces-base-primary)',
      }}
    >
      <p
        className="font-semibold text-sm"
        style={{ color: isEntry ? 'var(--text-inverse-primary)' : 'var(--text-primary)' }}
      >
        {agent.name}
      </p>
      <p
        className="text-xs mt-1"
        style={{ color: isEntry ? 'var(--text-inverse-secondary)' : 'var(--text-muted)' }}
      >
        {agent.model}
      </p>
      <p
        className="text-xs"
        style={{ color: isEntry ? 'var(--text-inverse-secondary)' : 'var(--text-muted)' }}
      >
        {toolCount} handoff{toolCount !== 1 ? 's' : ''}
      </p>
      {isEntry && (
        <span
          className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--surfaces-brand-interactive-low-contrast)', color: 'var(--text-primary)' }}
        >
          Entry
        </span>
      )}
      {isBackground && (
        <span
          className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full"
          style={{ backgroundColor: 'var(--surfaces-base-high-contrast)', color: 'var(--text-muted)' }}
        >
          Background
        </span>
      )}
    </div>
  );
}
