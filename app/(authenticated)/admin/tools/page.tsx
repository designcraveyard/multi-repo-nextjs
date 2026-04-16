'use client';

// app/(authenticated)/admin/tools/page.tsx
// Table of all tool definitions.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// --- Types ---

interface Tool {
  id: string;
  name: string;
  slug: string;
  tool_type: string | null;
}

// --- Component ---

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/tools')
      .then((r) => r.json())
      .then((d) => {
        setTools(Array.isArray(d) ? d : []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p style={{ color: 'var(--text-muted)' }}>Loading tools…</p>;
  }

  return (
    <div className="flex flex-col gap-4 max-w-[800px]">
      <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
        Tools
      </h1>

      <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border-default)' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: 'var(--surfaces-base-low-contrast)' }}>
              {['Name', 'Slug', 'Type'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-medium" style={{ color: 'var(--text-muted)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr
                key={tool.id}
                className="cursor-pointer border-t transition-colors"
                style={{ borderColor: 'var(--border-muted)' }}
                onClick={() => router.push(`/admin/tools/${tool.id}`)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = 'var(--surfaces-base-low-contrast)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
              >
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                  {tool.name}
                </td>
                <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                  {tool.slug}
                </td>
                <td className="px-4 py-3" style={{ color: 'var(--text-secondary)' }}>
                  {tool.tool_type ?? '—'}
                </td>
              </tr>
            ))}
            {tools.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center" style={{ color: 'var(--text-muted)' }}>
                  No tools defined.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
