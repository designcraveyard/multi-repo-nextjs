"use client";

import { useState } from "react";
import { MarkdownEditor } from "@/app/components/MarkdownEditor";

// responsive: N/A — full-screen editor page, single-column layout

export default function EditorDemoPage() {
  const [markdown, setMarkdown] = useState(SAMPLE_MARKDOWN);

  return (
    <div className="h-screen flex flex-col bg-[var(--surfaces-base-primary)]">
      <MarkdownEditor
        value={markdown}
        onChange={setMarkdown}
        placeholder="Start typing markdown…"
        autoFocus
        className="flex-1"
      />
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
