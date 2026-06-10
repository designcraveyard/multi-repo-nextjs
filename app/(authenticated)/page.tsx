import Link from "next/link";
import { ListItem } from "@/app/components/patterns/ListItem";

// --- Home — Template baseline landing ---
// Neutral entry point for the scaffolded app. Links to the bundled demo
// surfaces; replace this page with your app's real home screen.
// responsive: single column, token-driven spacing handles all widths.

const DEMOS: { href: string; title: string; subtitle: string }[] = [
  {
    href: "/chat",
    title: "Agent Chat — Pokémon demo",
    subtitle: "Multi-agent OpenAI Agents SDK graph with SSE streaming and inline cards",
  },
  {
    href: "/components-showcase",
    title: "Component Showcase",
    subtitle: "The design-system components available on web, iOS, and Android",
  },
  {
    href: "/editor-demo",
    title: "Markdown Editor",
    subtitle: "Rich text editing with the cross-platform MarkdownEditor component",
  },
  {
    href: "/input-demo",
    title: "Inputs & Form Elements",
    subtitle: "Label, InputField states and slots, pickers, sliders, and sheets",
  },
  {
    href: "/ai-demo",
    title: "AI Transform & Transcribe",
    subtitle: "Edge-function backed text transformation and voice transcription",
  },
  {
    href: "/admin",
    title: "Agent Admin",
    subtitle: "Configure agents, tools, handoffs, and versions (admin role required)",
  },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-12 md:px-10">
      <h1 className="text-[length:var(--typography-heading-lg-size)] font-[var(--typography-heading-lg-weight)] leading-[var(--typography-heading-lg-leading)] text-[var(--typography-primary)]">
        Multi-Repo Starter
      </h1>
      <p className="mt-[var(--space-2)] mb-[var(--space-8)] text-[length:var(--typography-body-md-size)] leading-[var(--typography-body-md-leading)] text-[var(--typography-secondary)]">
        Cross-platform template baseline. Explore the bundled demos below, or
        replace this page with your app&apos;s home screen.
      </p>

      <div className="flex flex-col">
        {DEMOS.map((demo, i) => (
          <Link key={demo.href} href={demo.href}>
            <ListItem title={demo.title} subtitle={demo.subtitle} divider={i < DEMOS.length - 1} />
          </Link>
        ))}
      </div>
    </main>
  );
}
