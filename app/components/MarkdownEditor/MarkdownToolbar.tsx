"use client";

/**
 * MarkdownToolbar — Fixed formatting toolbar for the MarkdownEditor.
 *
 * Renders a horizontally scrollable row of formatting buttons.
 * On mobile: sits below the editor, always visible when focused.
 * On desktop: rendered at the bottom of the editor container.
 */

import { type ComponentProps } from "react";
import { type Editor } from "@tiptap/react";
import { Icon } from "@/app/components/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

type IconName = ComponentProps<typeof Icon>["name"];

interface ToolbarButton {
  icon: IconName;
  label: string;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  /** Group separator rendered after this button */
  divider?: boolean;
}

interface MarkdownToolbarProps {
  editor: Editor | null;
  className?: string;
}

// ─── Toolbar Buttons ──────────────────────────────────────────────────────────

const TOOLBAR_BUTTONS: ToolbarButton[] = [
  // --- Text formatting ---
  {
    icon: "TextB",
    label: "Bold",
    action: (e) => e.chain().focus().toggleBold().run(),
    isActive: (e) => e.isActive("bold"),
  },
  {
    icon: "TextItalic",
    label: "Italic",
    action: (e) => e.chain().focus().toggleItalic().run(),
    isActive: (e) => e.isActive("italic"),
  },
  {
    icon: "TextStrikethrough",
    label: "Strikethrough",
    action: (e) => e.chain().focus().toggleStrike().run(),
    isActive: (e) => e.isActive("strike"),
  },
  {
    icon: "Code",
    label: "Inline code",
    action: (e) => e.chain().focus().toggleCode().run(),
    isActive: (e) => e.isActive("code"),
    divider: true,
  },
  // --- Headings ---
  {
    icon: "TextHOne",
    label: "Heading 1",
    action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
    isActive: (e) => e.isActive("heading", { level: 1 }),
  },
  {
    icon: "TextHTwo",
    label: "Heading 2",
    action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    isActive: (e) => e.isActive("heading", { level: 2 }),
  },
  {
    icon: "TextHThree",
    label: "Heading 3",
    action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    isActive: (e) => e.isActive("heading", { level: 3 }),
    divider: true,
  },
  // --- Lists ---
  {
    icon: "ListBullets",
    label: "Bullet list",
    action: (e) => e.chain().focus().toggleBulletList().run(),
    isActive: (e) => e.isActive("bulletList"),
  },
  {
    icon: "ListNumbers",
    label: "Numbered list",
    action: (e) => e.chain().focus().toggleOrderedList().run(),
    isActive: (e) => e.isActive("orderedList"),
  },
  {
    icon: "CheckSquare",
    label: "Task list",
    action: (e) => e.chain().focus().toggleTaskList().run(),
    isActive: (e) => e.isActive("taskList"),
    divider: true,
  },
  // --- Block elements ---
  {
    icon: "Quotes",
    label: "Blockquote",
    action: (e) => e.chain().focus().toggleBlockquote().run(),
    isActive: (e) => e.isActive("blockquote"),
  },
  {
    icon: "CodeBlock",
    label: "Code block",
    action: (e) => e.chain().focus().toggleCodeBlock().run(),
    isActive: (e) => e.isActive("codeBlock"),
  },
  {
    icon: "Minus",
    label: "Horizontal rule",
    action: (e) => e.chain().focus().setHorizontalRule().run(),
    divider: true,
  },
  // --- Table ---
  {
    icon: "Table",
    label: "Insert table",
    action: (e) =>
      e
        .chain()
        .focus()
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run(),
  },
  // --- Link ---
  {
    icon: "Link",
    label: "Link",
    action: (e) => {
      if (e.isActive("link")) {
        e.chain().focus().unsetLink().run();
        return;
      }
      const url = window.prompt("Enter URL:");
      if (url) {
        e.chain().focus().setLink({ href: url }).run();
      }
    },
    isActive: (e) => e.isActive("link"),
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────

const TOOLBAR_BASE = [
  "flex items-center gap-0.5 overflow-x-auto",
  "px-2 py-1.5",
  "border-t border-[var(--border-muted)]",
  "bg-[var(--surfaces-base-primary)]",
  "rounded-b-[var(--radius-md)]",
  "scrollbar-none",
].join(" ");

const BTN_BASE = [
  "flex-shrink-0 flex items-center justify-center",
  "w-8 h-8 rounded-[var(--radius-sm)]",
  "text-[var(--icons-secondary)]",
  "hover:bg-[var(--surfaces-base-low-contrast)]",
  "hover:text-[var(--icons-primary)]",
  "transition-colors duration-100",
].join(" ");

const BTN_ACTIVE = "bg-[var(--surfaces-brand-interactive-low-contrast)] text-[var(--icons-brand)]";

const DIVIDER = "self-stretch w-px mx-0.5 bg-[var(--border-muted)]";

// ─── Component ────────────────────────────────────────────────────────────────

export function MarkdownToolbar({ editor, className = "" }: MarkdownToolbarProps) {
  if (!editor) return null;

  return (
    <div className={[TOOLBAR_BASE, className].join(" ")} role="toolbar" aria-label="Formatting options">
      {TOOLBAR_BUTTONS.map((btn) => (
        <span key={btn.label} className="contents">
          <button
            type="button"
            title={btn.label}
            aria-label={btn.label}
            aria-pressed={btn.isActive?.(editor) ?? false}
            className={[BTN_BASE, btn.isActive?.(editor) ? BTN_ACTIVE : ""].join(" ")}
            onMouseDown={(e) => {
              e.preventDefault(); // Prevent editor blur
              btn.action(editor);
            }}
          >
            <Icon name={btn.icon} size="sm" />
          </button>
          {btn.divider && <div className={DIVIDER} aria-hidden="true" />}
        </span>
      ))}
    </div>
  );
}

// ─── Table Actions Toolbar (shown when cursor is inside a table) ──────────── */

interface TableToolbarProps {
  editor: Editor;
}

const TABLE_ACTIONS: ToolbarButton[] = [
  {
    icon: "ArrowLineDown",
    label: "Add row below",
    action: (e) => e.chain().focus().addRowAfter().run(),
  },
  {
    icon: "ArrowLineUp",
    label: "Add row above",
    action: (e) => e.chain().focus().addRowBefore().run(),
  },
  {
    icon: "ArrowLineRight",
    label: "Add column after",
    action: (e) => e.chain().focus().addColumnAfter().run(),
  },
  {
    icon: "ArrowLineLeft",
    label: "Add column before",
    action: (e) => e.chain().focus().addColumnBefore().run(),
  },
  {
    icon: "Trash",
    label: "Delete row",
    action: (e) => e.chain().focus().deleteRow().run(),
    divider: true,
  },
  {
    icon: "Trash",
    label: "Delete column",
    action: (e) => e.chain().focus().deleteColumn().run(),
  },
  {
    icon: "X",
    label: "Delete table",
    action: (e) => e.chain().focus().deleteTable().run(),
  },
];

export function TableToolbar({ editor }: TableToolbarProps) {
  if (!editor.isActive("table")) return null;

  return (
    <div
      className={[
        "flex items-center gap-0.5 overflow-x-auto px-2 py-1",
        "border-t border-[var(--border-muted)]",
        "bg-[var(--surfaces-base-low-contrast)]",
        "scrollbar-none",
      ].join(" ")}
      role="toolbar"
      aria-label="Table actions"
    >
      <span className="text-[length:var(--typography-caption-md-size)] text-[var(--typography-muted)] mr-1 flex-shrink-0">
        Table:
      </span>
      {TABLE_ACTIONS.map((btn) => (
        <span key={btn.label} className="contents">
          <button
            type="button"
            title={btn.label}
            aria-label={btn.label}
            className={BTN_BASE}
            onMouseDown={(e) => {
              e.preventDefault();
              btn.action(editor);
            }}
          >
            <Icon name={btn.icon} size="sm" />
          </button>
          {btn.divider && <div className={DIVIDER} aria-hidden="true" />}
        </span>
      ))}
    </div>
  );
}
