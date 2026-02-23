"use client";

/**
 * MarkdownEditor — Real-time inline WYSIWYG markdown editor.
 *
 * Type markdown syntax (## , - , **text**, etc.) and it renders as
 * formatted content in-place. Powered by Tiptap (ProseMirror).
 *
 * API: value/onChange with raw markdown strings.
 * Toolbars: floating BubbleMenu on selection + fixed bottom toolbar.
 *
 * Usage:
 *   <MarkdownEditor value={md} onChange={setMd} label="Description" />
 *   <MarkdownEditor value={md} onChange={setMd} placeholder="Write something..." />
 *   <MarkdownEditor value={md} onChange={setMd} state="error" hint="Content is required" />
 */

import { useEffect, useRef, useCallback, useId, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import { StarterKit } from "@tiptap/starter-kit";
import { TaskList } from "@tiptap/extension-task-list";
import { TaskItem } from "@tiptap/extension-task-item";
import { Table, TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { Link } from "@tiptap/extension-link";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { Icon } from "@/app/components/icons";
import { type InputFieldState } from "@/app/components/InputField";
import { MarkdownToolbar, TableToolbar } from "./MarkdownToolbar";
import "./markdown-editor.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Extract markdown string from tiptap-markdown's editor storage. */
function getMarkdownFromEditor(editor: { storage: unknown }): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (editor.storage as any).markdown.getMarkdown();
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarkdownEditorProps {
  /** Raw markdown string */
  value: string;
  /** Called with raw markdown on every change */
  onChange: (markdown: string) => void;
  /** Label rendered above the editor */
  label?: string;
  /** Helper / validation text below the editor */
  hint?: string;
  /** Validation state — controls border and hint color */
  state?: InputFieldState;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Minimum height in pixels (default 200) */
  minHeight?: number;
  /** Maximum height in pixels — enables scrolling */
  maxHeight?: number;
  /** Disables the editor */
  disabled?: boolean;
  /** Auto-focus the editor on mount */
  autoFocus?: boolean;
  /** Additional CSS class on the outer wrapper */
  className?: string;
}

// ─── State visual spec (reuses InputField pattern) ────────────────────────────

interface StateSpec {
  border: string;
  hint: string;
}

const STATE_SPEC: Record<InputFieldState, StateSpec> = {
  default: {
    border: "border border-transparent focus-within:border-[var(--border-active)]",
    hint: "text-[var(--typography-muted)]",
  },
  success: {
    border: "border border-[var(--border-success)]",
    hint: "text-[var(--typography-success)]",
  },
  warning: {
    border: "border border-[var(--border-warning)]",
    hint: "text-[var(--typography-warning)]",
  },
  error: {
    border: "border border-[var(--border-error)]",
    hint: "text-[var(--typography-error)]",
  },
};

const LABEL_STYLE =
  "text-[length:var(--typography-body-sm-em-size)] leading-[var(--typography-body-sm-em-leading)] font-[var(--typography-body-sm-em-weight)] text-[var(--typography-secondary)]";

const HINT_STYLE =
  "text-[length:var(--typography-caption-md-size)] leading-[var(--typography-caption-md-leading)] font-[var(--typography-caption-md-weight)]";

// ─── Bubble menu button styles ────────────────────────────────────────────────

const BUBBLE_BTN = [
  "flex items-center justify-center w-8 h-8",
  "text-[var(--typography-on-brand-primary)]",
  "hover:bg-[var(--surfaces-inverse-high-contrast)]",
  "rounded-[var(--radius-sm)]",
  "transition-colors duration-100",
].join(" ");

const BUBBLE_BTN_ACTIVE = "bg-[var(--surfaces-inverse-high-contrast)]";

// ─── Component ────────────────────────────────────────────────────────────────

export function MarkdownEditor({
  value,
  onChange,
  label,
  hint,
  state = "default",
  placeholder = "",
  minHeight = 200,
  maxHeight,
  disabled = false,
  autoFocus = false,
  className = "",
}: MarkdownEditorProps) {
  const generatedId = useId();
  const spec = STATE_SPEC[state];
  const isInternalUpdate = useRef(false);
  const [isFocused, setIsFocused] = useState(false);

  // ── Tiptap editor ──
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3, 4, 5, 6] },
        codeBlock: { HTMLAttributes: { class: "markdown-code-block" } },
      }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      Link.configure({
        autolink: true,
        openOnClick: false,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Placeholder.configure({ placeholder }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    immediatelyRender: false,
    content: value,
    editable: !disabled,
    autofocus: autoFocus,
    onUpdate: ({ editor: ed }) => {
      isInternalUpdate.current = true;
      const md = getMarkdownFromEditor(ed);
      onChange(md);
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      attributes: {
        "aria-describedby": hint ? `${generatedId}-hint` : "",
        "aria-invalid": state === "error" ? "true" : "false",
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": label ?? "Markdown editor",
      },
    },
  });

  // ── Sync external value changes into the editor ──
  useEffect(() => {
    if (!editor) return;
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false;
      return;
    }
    const currentMd = getMarkdownFromEditor(editor);
    if (value !== currentMd) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // ── Toggle editable on disabled change ──
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  // ── Prompt for link URL ──
  const handleSetLink = useCallback(() => {
    if (!editor) return;
    if (editor.isActive("link")) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    const url = window.prompt("Enter URL:");
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  return (
    <div className={["flex flex-col gap-1", className].join(" ")}>
      {/* ── Label ── */}
      {label && (
        <label className={LABEL_STYLE}>
          {label}
        </label>
      )}

      {/* ── Editor container ── */}
      <div
        className={[
          "rounded-[var(--radius-md)]",
          "bg-[var(--surfaces-base-low-contrast)]",
          "transition-colors duration-150",
          "overflow-hidden",
          spec.border,
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        {/* ── Floating selection toolbar (BubbleMenu) ── */}
        {editor && (
          <BubbleMenu
            editor={editor}
            options={{ placement: "top" }}
            className={[
              "flex items-center gap-0.5 px-1 py-1",
              "rounded-[var(--radius-md)]",
              "bg-[var(--surfaces-inverse-primary)]",
              "shadow-lg",
            ].join(" ")}
          >
            <button
              type="button"
              title="Bold"
              className={[BUBBLE_BTN, editor.isActive("bold") ? BUBBLE_BTN_ACTIVE : ""].join(" ")}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleBold().run();
              }}
            >
              <Icon name="TextB" size="sm" />
            </button>
            <button
              type="button"
              title="Italic"
              className={[BUBBLE_BTN, editor.isActive("italic") ? BUBBLE_BTN_ACTIVE : ""].join(" ")}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleItalic().run();
              }}
            >
              <Icon name="TextItalic" size="sm" />
            </button>
            <button
              type="button"
              title="Strikethrough"
              className={[BUBBLE_BTN, editor.isActive("strike") ? BUBBLE_BTN_ACTIVE : ""].join(" ")}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleStrike().run();
              }}
            >
              <Icon name="TextStrikethrough" size="sm" />
            </button>
            <button
              type="button"
              title="Inline code"
              className={[BUBBLE_BTN, editor.isActive("code") ? BUBBLE_BTN_ACTIVE : ""].join(" ")}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleCode().run();
              }}
            >
              <Icon name="Code" size="sm" />
            </button>
            <div className="self-stretch w-px mx-0.5 bg-[var(--surfaces-inverse-high-contrast)]" aria-hidden="true" />
            <button
              type="button"
              title="Link"
              className={[BUBBLE_BTN, editor.isActive("link") ? BUBBLE_BTN_ACTIVE : ""].join(" ")}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSetLink();
              }}
            >
              <Icon name="Link" size="sm" />
            </button>
            <div className="self-stretch w-px mx-0.5 bg-[var(--surfaces-inverse-high-contrast)]" aria-hidden="true" />
            <button
              type="button"
              title="Heading 1"
              className={[BUBBLE_BTN, editor.isActive("heading", { level: 1 }) ? BUBBLE_BTN_ACTIVE : ""].join(" ")}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 1 }).run();
              }}
            >
              <Icon name="TextHOne" size="sm" />
            </button>
            <button
              type="button"
              title="Heading 2"
              className={[BUBBLE_BTN, editor.isActive("heading", { level: 2 }) ? BUBBLE_BTN_ACTIVE : ""].join(" ")}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 2 }).run();
              }}
            >
              <Icon name="TextHTwo" size="sm" />
            </button>
            <button
              type="button"
              title="Heading 3"
              className={[BUBBLE_BTN, editor.isActive("heading", { level: 3 }) ? BUBBLE_BTN_ACTIVE : ""].join(" ")}
              onMouseDown={(e) => {
                e.preventDefault();
                editor.chain().focus().toggleHeading({ level: 3 }).run();
              }}
            >
              <Icon name="TextHThree" size="sm" />
            </button>
          </BubbleMenu>
        )}

        {/* ── Editor content area ── */}
        <div
          className="markdown-editor px-4 py-3.5 overflow-y-auto"
          style={{
            minHeight: `${minHeight}px`,
            ...(maxHeight ? { maxHeight: `${maxHeight}px` } : {}),
          }}
        >
          <EditorContent editor={editor} />
        </div>

        {/* ── Table toolbar (visible when cursor in table) ── */}
        {editor && <TableToolbar editor={editor} />}

        {/* ── Bottom formatting toolbar ── */}
        {isFocused && <MarkdownToolbar editor={editor} />}
      </div>

      {/* ── Hint ── */}
      {hint && (
        <p id={`${generatedId}-hint`} className={[HINT_STYLE, spec.hint].join(" ")}>
          {hint}
        </p>
      )}
    </div>
  );
}
