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
import { AppContextMenu, type AppContextMenuItem } from "@/app/components/Native/AppContextMenu";

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
  /** Where the toolbar sits relative to the editor content */
  position?: "top" | "bottom";
  /** Called when the AI Transcribe (mic) button is tapped */
  onTranscribe?: () => void;
  /** Called when an AI Transform option is selected — passes the config ID */
  onTransform?: (configId: string, customPrompt?: string) => void;
  /** Whether AI transcription is currently recording */
  isRecording?: boolean;
  /** Whether AI transform is currently streaming */
  isTransforming?: boolean;
  className?: string;
}

// ─── Toolbar Buttons ──────────────────────────────────────────────────────────
// Static button definitions for the main formatting toolbar. Each entry maps a
// Phosphor icon to a Tiptap editor chain command. Buttons are grouped by
// function with optional `divider` flags to insert visual separators.

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

/** Returns Tailwind classes for the toolbar container, varying the border
 *  position (top or bottom) based on where the toolbar sits relative to
 *  the editor content area. */
function toolbarBaseClasses(position: "top" | "bottom") {
  return [
    "flex items-center gap-0.5 overflow-x-auto",
    "px-2 py-1.5",
    position === "top"
      ? "border-b border-[var(--border-muted)]"
      : "border-t border-[var(--border-muted)]",
    "bg-[var(--surfaces-base-primary)]",
    "scrollbar-none",
  ].join(" ");
}

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

/**
 * Fixed formatting toolbar for the MarkdownEditor.
 *
 * Renders a horizontally scrollable row of formatting buttons organized into
 * groups: text formatting, headings, lists, block elements, table insert,
 * and link toggle. Each button toggles a Tiptap command via `onMouseDown`
 * (not `onClick`) to prevent the editor from losing focus.
 *
 * Optionally appends AI tool buttons at the end:
 * - **Transcribe (mic):** toggles audio recording on/off.
 * - **Transform (sparkles):** opens an `AppContextMenu` dropdown with
 *   predefined AI transform options (summarise, key pointers, action items,
 *   custom prompt).
 *
 * Rendered twice in MarkdownEditor: at the top on desktop (hidden on mobile)
 * and at the bottom on mobile (hidden on desktop).
 */
export function MarkdownToolbar({
  editor,
  position = "bottom",
  onTranscribe,
  onTransform,
  isRecording = false,
  isTransforming = false,
  className = "",
}: MarkdownToolbarProps) {
  if (!editor) return null;

  return (
    <div className={[toolbarBaseClasses(position), className].join(" ")} role="toolbar" aria-label="Formatting options">
      {TOOLBAR_BUTTONS.map((btn) => (
        <span key={btn.label} className="contents">
          <button
            type="button"
            title={btn.label}
            aria-label={btn.label}
            aria-pressed={btn.isActive?.(editor) ?? false}
            className={[BTN_BASE, btn.isActive?.(editor) ? BTN_ACTIVE : ""].join(" ")}
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

      {/* AI Tools — transcribe + transform (matches iOS keyboard toolbar Group 7) */}
      {(onTranscribe || onTransform) && (
        <>
          <div className={DIVIDER} aria-hidden="true" />

          {/* Transcribe (mic) button */}
          {onTranscribe && (
            <button
              type="button"
              title={isRecording ? "Stop recording" : "Voice transcribe"}
              aria-label={isRecording ? "Stop recording" : "Voice transcribe"}
              className={[BTN_BASE, isRecording ? "text-[var(--icons-error)]" : ""].join(" ")}
              onMouseDown={(e) => {
                e.preventDefault();
                onTranscribe();
              }}
            >
              <Icon name={isRecording ? "StopCircle" : "Microphone"} size="sm" weight="fill" />
            </button>
          )}

          {/* Transform (sparkles) button with context menu dropdown */}
          {onTransform && (
            <AppContextMenu
              mode="dropdown"
              items={TRANSFORM_OPTIONS.map((opt): AppContextMenuItem => ({
                label: opt.label,
                icon: <Icon name={opt.icon} size="sm" />,
                onPress: () => {
                  if (opt.configId === "md-custom") {
                    const instruction = window.prompt("Enter your instruction:");
                    if (instruction) onTransform(opt.configId, instruction);
                  } else {
                    onTransform(opt.configId);
                  }
                },
              }))}
            >
              <button
                type="button"
                title="AI Transform"
                aria-label="AI Transform"
                className={[BTN_BASE, isTransforming ? BTN_ACTIVE : ""].join(" ")}
              >
                {isTransforming ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Icon name="Sparkle" size="sm" weight="fill" />
                )}
              </button>
            </AppContextMenu>
          )}
        </>
      )}
    </div>
  );
}

// Predefined AI transform options shown in the sparkles dropdown menu.
// Each configId maps to a server-side transform pipeline. "md-custom" prompts
// the user for a freeform instruction before sending.
const TRANSFORM_OPTIONS: { configId: string; label: string; icon: IconName }[] = [
  { configId: "md-summarise", label: "Summarise", icon: "TextAlignLeft" },
  { configId: "md-key-pointers", label: "Key Pointers", icon: "ListBullets" },
  { configId: "md-action-items", label: "List Actions", icon: "CheckSquare" },
  { configId: "md-custom", label: "Custom...", icon: "Sparkle" },
];

// ─── Table Actions Toolbar (shown when cursor is inside a table) ─────────────

interface TableToolbarProps {
  editor: Editor;
}

// Table-specific actions: add/remove rows and columns, delete the entire table.
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

/**
 * A contextual toolbar that appears when the cursor is inside a Tiptap table.
 * Provides row/column add/remove actions and a delete-table button.
 * Rendered on a low-contrast background to visually distinguish it from
 * the main formatting toolbar.
 */
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
