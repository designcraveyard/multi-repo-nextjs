'use client';

// app/(authenticated)/admin/layout.tsx
// Admin shell — checks admin access, renders sidebar + children.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

// --- Types ---

interface MeResponse {
  isAdmin: boolean;
  role: string | null;
}

// --- Nav items ---

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Agents', href: '/admin/agents' },
  { label: 'Tools', href: '/admin/tools' },
  { label: 'Versions', href: '/admin/versions' },
  { label: 'Test', href: '/admin/test' },
] as const;

// --- Component ---

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'denied' | 'ok'>('loading');
  const pathname = usePathname();

  useEffect(() => {
    fetch('/api/admin/me')
      .then((r) => r.json() as Promise<MeResponse>)
      .then((d) => setStatus(d.isAdmin ? 'ok' : 'denied'))
      .catch(() => setStatus('denied'));
  }, []);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ color: 'var(--text-muted)' }}>
        Loading…
      </div>
    );
  }

  if (status === 'denied') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3">
        <p className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Access Denied
        </p>
        <p style={{ color: 'var(--text-muted)' }}>You do not have admin permissions.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--surfaces-base-primary)' }}>
      {/* Sidebar */}
      <aside
        className="w-48 shrink-0 flex flex-col gap-1 p-4 border-r"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
          Admin
        </p>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-2 rounded-md text-sm font-medium transition-colors"
              style={{
                backgroundColor: isActive ? 'var(--surfaces-brand-interactive)' : 'transparent',
                color: isActive ? 'var(--text-inverse-primary)' : 'var(--text-primary)',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  );
}
