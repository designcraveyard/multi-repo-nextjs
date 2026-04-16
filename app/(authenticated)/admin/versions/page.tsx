'use client';

// app/(authenticated)/admin/versions/page.tsx
// List of agent config versions with rollback support.

import { useEffect, useState } from 'react';

// --- Types ---

interface Version {
  id: string;
  version_number: number;
  published_at: string;
  notes: string | null;
}

// --- Component ---

export default function VersionsPage() {
  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  function load() {
    fetch('/api/admin/versions')
      .then((r) => r.json())
      .then((d) => {
        setVersions(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }

  useEffect(() => { load(); }, []);

  async function handleRollback(version: Version) {
    if (!confirm(`Roll back to v${version.version_number}? Current config will be overwritten.`)) return;
    setRollingBack(version.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/versions/${version.id}`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage({ text: `Rolled back to v${version.version_number}.`, ok: true });
    } catch (err) {
      setMessage({ text: err instanceof Error ? err.message : 'Rollback failed', ok: false });
    } finally {
      setRollingBack(null);
    }
  }

  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading versions…</p>;
  }

  const latestVersionNumber = versions.length > 0 ? versions[0].version_number : null;

  return (
    <div className="flex flex-col gap-4 max-w-[800px]">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Versions
      </h1>

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

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surfaces-base-low-contrast)' }}>
              {['Version', 'Published', 'Notes', ''].map((h, i) => (
                <th key={i} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {versions.map((v) => {
              const isCurrent = v.version_number === latestVersionNumber;
              return (
                <tr
                  key={v.id}
                  className="border-t"
                  style={{
                    borderColor: 'var(--border-muted)',
                    backgroundColor: isCurrent ? 'var(--surfaces-accent-low-contrast)' : 'transparent',
                  }}
                >
                  <td className="px-4 py-3 font-semibold" style={{ color: 'var(--text-primary)' }}>
                    v{v.version_number}
                    {isCurrent && (
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: 'var(--surfaces-accent-primary)',
                          color: 'white',
                        }}
                      >
                        current
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(v.published_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-muted)' }}>
                    {v.notes ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {!isCurrent && (
                      <button
                        onClick={() => handleRollback(v)}
                        disabled={rollingBack === v.id}
                        className="px-3 py-1 rounded-md text-xs font-medium border"
                        style={{ borderColor: 'var(--border-default)', color: 'var(--text-primary)' }}
                      >
                        {rollingBack === v.id ? 'Rolling back…' : 'Rollback'}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {versions.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                  No versions published yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
