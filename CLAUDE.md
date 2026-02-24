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

Token categories in `globals.css`:
- **Colors** — `--surface-*`, `--text-*`, `--icon-*`, `--border-*`, `--overlay-*`
- **Radius** — `--radius-xs` … `--radius-full` (Mobile default + `@media (min-width: 768px)` Desktop override)
- **Spacing** — `--space-1` (4px) … `--space-24` (96px), wired into Tailwind `p-*`/`gap-*`/`m-*` utilities
- **Typography** — `--typography-{role}-{size}-{size|leading|weight}` for all 28 type styles

Always use `var(--token-name)` or Tailwind utilities in components — never hardcode hex.

---

## Icon System (Phosphor Icons)

**Package:** `@phosphor-icons/react` — installed, tree-shaken via `optimizePackageImports` in `next.config.ts`
**Same icon set used in Figma, web, and iOS.**

### Rules

- **Always** import from `@/app/components/icons` — never from `@phosphor-icons/react` directly
- Use the typed `<Icon />` wrapper for all icon usage
- Default weight: **regular** · Default size: **md** (20px)
- Use `var(--icon-*)` CSS tokens for color, not hardcoded hex

### Usage

```tsx
import { Icon } from "@/app/components/icons";

// Basic (weight=regular, size=md, color=currentColor)
<Icon name="House" />

// With tokens
<Icon name="Heart" weight="fill" size="lg" color="var(--icon-error)" />

// Accessible (adds aria-label)
<Icon name="Bell" label="Notifications" />
```

### Size tokens

| Token | px  | Tailwind frame example |
|-------|-----|------------------------|
| `xs`  | 12  | `w-3 h-3`              |
| `sm`  | 16  | `w-4 h-4`              |
| `md`  | 20  | `w-5 h-5` _(default)_  |
| `lg`  | 24  | `w-6 h-6`              |
| `xl`  | 32  | `w-8 h-8`              |

### Figma → Code

Icon name in Figma sidebar (e.g. `House`) = `name` prop. Weight layer = `weight` prop. Size from Dimensions = nearest token.

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

## Authentication

Auth gate via Next.js middleware — unauthenticated users are redirected to `/login`.

**Route groups:**
- `app/(auth)/` — Public routes (login page)
- `app/(authenticated)/` — Protected routes (requires session)

**Key files:**
- `middleware.ts` — Session refresh + route protection (redirects to `/login` if no session)
- `lib/auth/actions.ts` — Server actions: `signInWithEmail`, `signUpWithEmail`, `signInWithGoogle`, `signInWithApple`, `signOut`
- `lib/auth/auth-context.tsx` — Client-side `AuthProvider` + `useAuth()` hook (wraps `onAuthStateChange`)
- `lib/auth/profile.ts` — `getProfile()` server helper
- `app/auth/callback/route.ts` — OAuth code → session exchange
- `app/(authenticated)/layout.tsx` — Wraps children with `AuthProvider`

**Providers:** Google (OAuth redirect), Apple (OAuth redirect), Email/Password

**Usage in screens:**
```tsx
// Client components
const { user, session } = useAuth();

// Server components / Server Actions
const supabase = await createClient();
const { data: { user } } = await supabase.auth.getUser();
```

---

## Screens / Routes

- `/login` — Login screen (`app/(auth)/login/page.tsx`)
- `/` — Home / Component showcase (`app/(authenticated)/page.tsx`)

_Add new routes here as features are added via `/cross-platform-feature` or `/new-screen`._
