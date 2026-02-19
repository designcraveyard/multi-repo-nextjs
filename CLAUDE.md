# CLAUDE.md — multi-repo-nextjs

Platform-specific context for the Next.js web app.
See the root `CLAUDE.md` for workspace-wide context, skills, and shared conventions.

**Stack:** Next.js 16.1.6, React 19, TypeScript 5, Tailwind CSS v4, ESLint v9 flat config

---

## Commands

```bash
npm run dev      # Dev server at http://localhost:3000
npm run build    # Production build (also type-checks via next build)
npm run lint     # ESLint flat config (eslint.config.mjs)
npm run start    # Serve production build
```

---

## Architecture

- **App Router** in `app/` — each directory = a route, `page.tsx` = the route entry
- `app/layout.tsx` — Root layout; loads Geist font via `next/font` into `--font-geist-sans` / `--font-geist-mono` CSS vars
- `app/globals.css` — **Design token source of truth**: CSS custom properties for all colors; Tailwind v4 via `@import "tailwindcss"`
- `lib/supabase/client.ts` — Browser Supabase client (add after `/supabase-setup`)
- `lib/supabase/server.ts` — Server Supabase client for RSC and Server Actions
- `lib/database.types.ts` — Auto-generated Supabase TypeScript types
- Path alias: `@/*` → project root

---

## Design Tokens

CSS custom properties in `globals.css` are the **web source of truth** for the shared design system.
Run `/design-token-sync` after any token change to push updates to `DesignTokens.swift` on iOS.

Current tokens:
- `--background` / `--foreground`

Always use `var(--token-name)` or Tailwind utilities in components — never hardcode hex.

---

## Key Config Details

- **Tailwind v4**: `@tailwindcss/postcss` plugin in `postcss.config.mjs` (not the old `tailwindcss` PostCSS plugin)
- **ESLint**: flat config via `eslint.config.mjs` with `next/core-web-vitals` + `next/typescript`
- **TypeScript**: strict mode enabled in `tsconfig.json`
- **`next.config.ts`**: intentionally minimal — add only what is required

---

## Gotchas

- Do NOT edit `package-lock.json` directly — the hook will block it. Use `npm install <pkg>` instead.
- Server Components cannot use browser APIs — move to `'use client'` components when needed.
- Use `@supabase/ssr` (not the older `@supabase/auth-helpers-nextjs`) for cookie-based auth in App Router.
- `app/globals.css` uses `@import "tailwindcss"` (Tailwind v4 syntax) — not `@tailwind base/components/utilities`.

---

## Supabase

```bash
# Regenerate types after schema changes
supabase gen types typescript --linked > lib/database.types.ts

# Migrations
supabase migration new <name>    # Create new migration
supabase db push                 # Apply to linked project

# Local development (requires Docker)
supabase start                   # Start local stack
# Studio: http://localhost:54323
# API: http://localhost:54321
```

Credentials live in `.env.local` (gitignored). Copy from `.env.local.example`.

---

## Screens / Routes

- `/` — Home (`app/page.tsx`)

_Add new routes here as features are added via `/cross-platform-feature` or `/new-screen`._
