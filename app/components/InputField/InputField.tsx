"use client";

/**
 * InputField / TextField — Figma: bubbles-kit › node 90:3753 "_InputField" 90:3525
 *
 * Axes: State × Type = 11 combinations
 *   State: default | success | warning | error  (+ disabled via prop)
 *   Type:  InputField (single-line) | TextField (multiline)
 *
 * Figma primitive slots (left→right):
 *   [leadingLabel?] [leadingPicker?] [leadingSeparator?] [input text area] [trailingSeparator?] [trailingPicker?] [trailingLabel?]
 *
 * Usage:
 *   <InputField label="Email" placeholder="you@example.com" />
 *   <InputField state="error" hint="Invalid email" trailingLabel={<Label label="Clear" trailingIcon={<Icon name="X" />} />} />
 *   <InputField leadingLabel={<Label label="USD" />} leadingSeparator />
 *   <TextField label="Bio" placeholder="Tell us about yourself…" />
 *   // With picker:
 *   <InputField label="Amount" placeholder="0.00"
 *     leadingPicker={<AppNativePicker label="Currency" value={cur} onChange={setCur} options={currencies} embedded />}
 *     leadingSeparator />
 */

import {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  useId,
  useState,
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
  /**
   * Left picker slot — pass <AppNativePicker embedded ... />.
   * Renders after leadingLabel and before the text area.
   */
  leadingPicker?: ReactNode;
  /**
   * Right picker slot — pass <AppNativePicker embedded ... />.
   * Renders after the text area and before trailingLabel.
   * When set, suppresses the automatic trailing state icon.
   */
  trailingPicker?: ReactNode;
  /** Simple leading icon (no label) */
  leadingIcon?: ReactNode;
  /** Simple trailing icon */
  trailingIcon?: ReactNode;
  /** 1px separator between leading content (label or picker) and the text area */
  leadingSeparator?: boolean;
  /** 1px separator between the text area and trailing content (label or picker) */
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

// Figma: bg=surfaces/baselowcontrast, px=16px, py=14px, radius=12px (fixed, non-responsive)
// border is applied via state spec (transparent at rest for default, coloured for validation states)
const WRAPPER_BASE =
  "flex items-stretch gap-2 w-full px-4 py-3.5 rounded-[12px] bg-[var(--surfaces-base-low-contrast)] transition-colors duration-150";

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
      leadingPicker,
      trailingPicker,
      leadingIcon,
      trailingIcon,
      leadingSeparator = false,
      trailingSeparator = false,
      disabled,
      className = "",
      id: propId,
      onFocus: propOnFocus,
      onBlur: propOnBlur,
      onChange: propOnChange,
      ...rest
    },
    ref
  ) {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const spec = STATE_SPEC[state];

    // ── Focus + fill tracking for default-state icon color ──
    const [isFocused, setIsFocused] = useState(false);
    const [hasValue, setHasValue] = useState(() => Boolean(rest.value ?? rest.defaultValue));

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      propOnFocus?.(e);
    };
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      propOnBlur?.(e);
    };
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setHasValue(Boolean(e.target.value));
      propOnChange?.(e);
    };

    // Default state: muted at rest → primary when focused or filled
    const iconColor =
      state === "default"
        ? isFocused || hasValue
          ? "text-[var(--icons-primary)]"
          : "text-[var(--icons-muted)]"
        : spec.iconColor;

    // Auto-inject state icon into trailing slot when state !== default
    // and no explicit trailingIcon/trailingLabel/trailingPicker is provided
    const stateIconEl =
      spec.stateIcon && !trailingIcon && !trailingLabel && !trailingPicker ? (
        <span className={`w-5 h-5 flex-shrink-0 self-center ${spec.iconColor}`} aria-hidden="true">
          <Icon name={spec.stateIcon} size="md" />
        </span>
      ) : null;

    // Separator shows when prop is true AND there is content on that side
    const showLeadingSep = leadingSeparator && (leadingLabel || leadingPicker);
    const showTrailingSep = trailingSeparator && (trailingLabel || trailingPicker);

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

          {/* Leading picker slot — use <AppNativePicker embedded ... /> */}
          {leadingPicker && (
            <span className="flex-shrink-0 self-center">{leadingPicker}</span>
          )}

          {/* Leading separator */}
          {showLeadingSep && <div className={SEPARATOR} />}

          {/* Leading icon (simple, no label) */}
          {leadingIcon && (
            <span className={`w-5 h-5 flex-shrink-0 self-center ${iconColor}`} aria-hidden="true">
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
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            {...rest}
          />

          {/* Trailing icon (simple) */}
          {trailingIcon && (
            <span className={`w-5 h-5 flex-shrink-0 self-center ${iconColor}`} aria-hidden="true">
              {trailingIcon}
            </span>
          )}

          {/* Auto state icon */}
          {stateIconEl}

          {/* Trailing separator */}
          {showTrailingSep && <div className={SEPARATOR} />}

          {/* Trailing picker slot — use <AppNativePicker embedded ... /> */}
          {trailingPicker && (
            <span className="flex-shrink-0 self-center">{trailingPicker}</span>
          )}

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
            "rounded-[12px]",
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
