"use client";

import { useState } from "react";
import { MarkdownEditor } from "@/app/components/MarkdownEditor";

// responsive: N/A — demo/showcase page, single-column layout

export default function EditorDemoPage() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);
  const [markdown2, setMarkdown2] = useState("");

  return (
    <div className="min-h-screen bg-[var(--surfaces-base-primary)] px-6 py-12">
      <div className="mx-auto max-w-2xl flex flex-col gap-10">
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[var(--typography-brand)]">
            Markdown Editor Demo
          </h1>
          <p className="text-[var(--typography-muted)] text-sm">
            Real-time inline WYSIWYG markdown editor. Type markdown syntax and
            it renders as formatted content in-place.
          </p>
        </div>

        {/* --- Editor with sample content --- */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[length:var(--typography-label-sm-size)] font-[var(--typography-label-sm-weight)] uppercase tracking-widest text-[var(--typography-muted)]">
            Pre-filled Editor
          </h2>
          <MarkdownEditor
            value={markdown}
            onChange={setMarkdown}
            label="Notes"
            hint="Try editing the content — all markdown syntax is supported."
            minHeight={320}
          />
        </section>

        {/* --- Empty editor --- */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[length:var(--typography-label-sm-size)] font-[var(--typography-label-sm-weight)] uppercase tracking-widest text-[var(--typography-muted)]">
            Empty Editor
          </h2>
          <MarkdownEditor
            value={markdown2}
            onChange={setMarkdown2}
            label="Description"
            placeholder="Start typing markdown… try ## Heading, - list item, **bold**, or ```code```"
            minHeight={200}
          />
        </section>

        {/* --- Raw markdown output --- */}
        <section className="flex flex-col gap-3">
          <h2 className="text-[length:var(--typography-label-sm-size)] font-[var(--typography-label-sm-weight)] uppercase tracking-widest text-[var(--typography-muted)]">
            Raw Markdown Output
          </h2>
          <pre className="p-4 rounded-[var(--radius-md)] bg-[var(--surfaces-base-low-contrast)] text-[var(--typography-secondary)] text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-64 overflow-y-auto">
            {markdown || "(empty)"}
          </pre>
        </section>
      </div>
    </div>
  );
}

const SAMPLE_MARKDOWN = `## Welcome to the Markdown Editor

This is a **real-time inline** WYSIWYG editor. Everything you type renders *in-place*.

### Features

- **Bold**, *italic*, and ~~strikethrough~~ text
- Inline \`code\` snippets
- [Links](https://example.com) that auto-detect URLs

### Lists

- Bullet lists with nesting
  - Second level
    - Third level
- Back to first level

1. Numbered lists
2. With automatic numbering
   1. And nesting support

- [ ] Task lists
- [x] With checkboxes

### Code Blocks

\`\`\`
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

### Blockquotes

> This is a blockquote.
> It can span multiple lines.

### Tables

| Feature | Web | iOS |
|---------|-----|-----|
| Headings | Yes | Yes |
| Lists | Yes | Yes |
| Tables | Yes | Yes |

---

That's a horizontal rule above. Happy writing!
`;
