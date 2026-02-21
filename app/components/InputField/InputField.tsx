"use client";

/**
 * InputField / TextField — Figma: bubbles-kit › node 90:3753 "_InputField" 90:3525
 *
 * Axes: State × Type = 11 combinations
 *   State: default | success | warning | error  (+ disabled via prop)
 *   Type:  InputField (single-line) | TextField (multiline)
 *
 * Figma primitive slots (left→right):
 *   [leadingLabel?] [leadingSeparator?] [input text area] [trailingSeparator?] [trailingLabel?]
 *
 * Usage:
 *   <InputField label="Email" placeholder="you@example.com" />
 *   <InputField state="error" hint="Invalid email" trailingLabel={<Label label="Clear" trailingIcon={<Icon name="X" />} />} />
 *   <InputField leadingLabel={<Label label="USD" />} leadingSeparator />
 *   <TextField label="Bio" placeholder="Tell us about yourself…" />
 */

import {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  useId,
} from "react";
import { Icon } from "@/app/components/icons";

// ─── Types ────────────────────────────────────────────────────────────────────

export type InputFieldState = "default" | "success" | "warning" | "error";
// kept for back-compat
export type InputFieldType = "default" | "textField";

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Floating label rendered above the input */
  label?: string;
  /** Helper / validation text below the input */
  hint?: string;
  /** Validation state */
  state?: InputFieldState;
  /** Left slot — pass a <Label> component (icon + text badge) */
  leadingLabel?: ReactNode;
  /** Right slot — pass a <Label> component */
  trailingLabel?: ReactNode;
  /** Simple leading icon (no label) */
  leadingIcon?: ReactNode;
  /** Simple trailing icon */
  trailingIcon?: ReactNode;
  /** 1px separator between leadingLabel and the text area */
  leadingSeparator?: boolean;
  /** 1px separator between the text area and trailingLabel */
  trailingSeparator?: boolean;
  className?: string;
}

export interface TextFieldProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> {
  label?: string;
  hint?: string;
  state?: InputFieldState;
  rows?: number;
  className?: string;
}

// ─── State visual spec ────────────────────────────────────────────────────────

interface StateSpec {
  border: string;
  hint: string;
  iconColor: string;
  /** Phosphor icon name for trailing state indicator, null = no icon */
  stateIcon: "CheckCircle" | "Warning" | "WarningCircle" | null;
}

const STATE_SPEC: Record<InputFieldState, StateSpec> = {
  // Default: no border at rest, active border on focus only
  default: {
    border: "border border-transparent focus-within:border-[var(--border-active)]",
    hint: "text-[var(--typography-muted)]",
    iconColor: "text-[var(--icons-muted)]",
    stateIcon: null,
  },
  // Validation states always show their border
  success: {
    border: "border border-[var(--border-success)]",
    hint: "text-[var(--typography-success)]",
    iconColor: "text-[var(--icons-success)]",
    stateIcon: "CheckCircle",
  },
  warning: {
    border: "border border-[var(--border-warning)]",
    hint: "text-[var(--typography-warning)]",
    iconColor: "text-[var(--icons-warning)]",
    stateIcon: "Warning",
  },
  error: {
    border: "border border-[var(--border-error)]",
    hint: "text-[var(--typography-error)]",
    iconColor: "text-[var(--icons-error)]",
    stateIcon: "WarningCircle",
  },
};

// ─── Shared class fragments ───────────────────────────────────────────────────

// Figma: bg=surfaces/baselowcontrast, px=16px, py=14px, radius=lg (16px mobile / 24px desktop)
// border is applied via state spec (transparent at rest for default, coloured for validation states)
const WRAPPER_BASE =
  "flex items-stretch gap-2 w-full px-4 py-3.5 rounded-[var(--radius-lg)] bg-[var(--surfaces-base-low-contrast)] transition-colors duration-150";

const INPUT_BASE = [
  "flex-1 min-w-0 bg-transparent outline-none self-center",
  "text-[length:var(--typography-body-md-size)] leading-[var(--typography-body-md-leading)] font-[var(--typography-body-md-weight)]",
  "text-[var(--typography-primary)]",
  "placeholder:text-[var(--typography-muted)]",
  // Caret colour = brand interactive primary
  "caret-[var(--surfaces-brand-interactive)]",
  "disabled:cursor-not-allowed",
].join(" ");

const LABEL_STYLE =
  "text-[length:var(--typography-body-sm-em-size)] leading-[var(--typography-body-sm-em-leading)] font-[var(--typography-body-sm-em-weight)] text-[var(--typography-secondary)]";

const HINT_STYLE =
  "text-[length:var(--typography-caption-md-size)] leading-[var(--typography-caption-md-leading)] font-[var(--typography-caption-md-weight)]";

// Separator — 1px divider, surfaces/basehighcontrast
const SEPARATOR = "self-stretch w-px shrink-0 bg-[var(--surfaces-base-high-contrast)]";

// ─── InputField (single line) ─────────────────────────────────────────────────

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    {
      label,
      hint,
      state = "default",
      leadingLabel,
      trailingLabel,
      leadingIcon,
      trailingIcon,
      leadingSeparator = false,
      trailingSeparator = false,
      disabled,
      className = "",
      id: propId,
      ...rest
    },
    ref
  ) {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const spec = STATE_SPEC[state];

    // Auto-inject state icon into trailing slot when state !== default
    // and no explicit trailingIcon/trailingLabel is provided
    const stateIconEl =
      spec.stateIcon && !trailingIcon && !trailingLabel ? (
        <span className={`w-5 h-5 flex-shrink-0 self-center ${spec.iconColor}`} aria-hidden="true">
          <Icon name={spec.stateIcon} size="md" />
        </span>
      ) : null;

    return (
      <div className={["flex flex-col gap-1", className].join(" ")}>
        {label && (
          <label htmlFor={id} className={LABEL_STYLE}>
            {label}
          </label>
        )}

        <div
          className={[
            WRAPPER_BASE,
            spec.border,
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {/* Leading label slot (e.g. currency badge, unit) */}
          {leadingLabel && (
            <span className="flex-shrink-0 self-center">{leadingLabel}</span>
          )}

          {/* Leading separator */}
          {leadingSeparator && leadingLabel && <div className={SEPARATOR} />}

          {/* Leading icon (simple, no label) */}
          {leadingIcon && (
            <span className={`w-5 h-5 flex-shrink-0 self-center ${spec.iconColor}`} aria-hidden="true">
              {leadingIcon}
            </span>
          )}

          <input
            id={id}
            ref={ref}
            disabled={disabled}
            aria-describedby={hint ? `${id}-hint` : undefined}
            aria-invalid={state === "error" ? "true" : undefined}
            className={INPUT_BASE}
            {...rest}
          />

          {/* Trailing icon (simple) */}
          {trailingIcon && (
            <span className={`w-5 h-5 flex-shrink-0 self-center ${spec.iconColor}`} aria-hidden="true">
              {trailingIcon}
            </span>
          )}

          {/* Auto state icon */}
          {stateIconEl}

          {/* Trailing separator */}
          {trailingSeparator && trailingLabel && <div className={SEPARATOR} />}

          {/* Trailing label slot */}
          {trailingLabel && (
            <span className="flex-shrink-0 self-center">{trailingLabel}</span>
          )}
        </div>

        {hint && (
          <p id={`${id}-hint`} className={[HINT_STYLE, spec.hint].join(" ")}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);

// ─── TextField (multiline) ────────────────────────────────────────────────────

export const TextField = forwardRef<HTMLTextAreaElement, TextFieldProps>(
  function TextField(
    {
      label,
      hint,
      state = "default",
      rows = 4,
      disabled,
      className = "",
      id: propId,
      ...rest
    },
    ref
  ) {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const spec = STATE_SPEC[state];

    return (
      <div className={["flex flex-col gap-1", className].join(" ")}>
        {label && (
          <label htmlFor={id} className={LABEL_STYLE}>
            {label}
          </label>
        )}

        <div
          className={[
            "w-full px-4 py-3.5",
            "rounded-[var(--radius-lg)]",
            "bg-[var(--surfaces-base-low-contrast)]",
            "transition-colors duration-150",
            spec.border,
            disabled ? "opacity-50" : "",
          ].join(" ")}
        >
          <textarea
            id={id}
            ref={ref}
            rows={rows}
            disabled={disabled}
            aria-describedby={hint ? `${id}-hint` : undefined}
            aria-invalid={state === "error" ? "true" : undefined}
            className={[
              "w-full bg-transparent outline-none resize-none",
              "text-[length:var(--typography-body-md-size)] leading-[var(--typography-body-md-leading)] font-[var(--typography-body-md-weight)]",
              "text-[var(--typography-primary)]",
              "placeholder:text-[var(--typography-muted)]",
              "caret-[var(--surfaces-brand-interactive)]",
              "disabled:cursor-not-allowed",
            ].join(" ")}
            {...rest}
          />
        </div>

        {hint && (
          <p id={`${id}-hint`} className={[HINT_STYLE, spec.hint].join(" ")}>
            {hint}
          </p>
        )}
      </div>
    );
  }
);
