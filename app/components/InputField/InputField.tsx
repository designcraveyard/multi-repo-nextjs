"use client";

import {
  forwardRef,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
  ReactNode,
  useState,
  useId,
} from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
//
// Figma: Input Field (node 90:3753)
// Axes: State(Default/Disabled/Focus/Filled/Success/Warning/Error) × Type(Default/TextField) = 11
//
// Default   — text input, single line
// TextField — multiline textarea

export type InputFieldType = "default" | "textField";
export type InputFieldState = "default" | "success" | "warning" | "error";

export interface InputFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  hint?: string;
  /** Validation state */
  state?: InputFieldState;
  /** Optional leading icon element */
  leadingIcon?: ReactNode;
  /** Optional trailing icon/action element */
  trailingIcon?: ReactNode;
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

// ─── Token Mapping ─────────────────────────────────────────────────────────────
//
// Default:  border-default → focus: border-active
// Success:  border-success (always)
// Warning:  border-warning (always)
// Error:    border-error   (always)

const stateStyles: Record<InputFieldState, { border: string; hint: string; icon: string }> = {
  default: {
    border: [
      "border-[var(--border-default)]",
      "focus-within:border-[var(--border-active)]",
    ].join(" "),
    hint: "text-[var(--typography-muted)]",
    icon: "text-[var(--icons-muted)]",
  },
  success: {
    border: "border-[var(--border-success)]",
    hint: "text-[var(--typography-success)]",
    icon: "text-[var(--icons-success)]",
  },
  warning: {
    border: "border-[var(--border-warning)]",
    hint: "text-[var(--typography-warning)]",
    icon: "text-[var(--icons-warning)]",
  },
  error: {
    border: "border-[var(--border-error)]",
    hint: "text-[var(--typography-error)]",
    icon: "text-[var(--icons-error)]",
  },
};

// ─── Shared wrapper classes ────────────────────────────────────────────────────

const wrapperBase = [
  "flex items-center gap-2",
  "w-full px-4 py-3.5",
  "rounded-2xl",
  "bg-[var(--surfaces-base-low-contrast)]",
  "border transition-colors duration-150",
  "disabled:opacity-50",
].join(" ");

const inputBase = [
  "flex-1 min-w-0 bg-transparent outline-none",
  "text-[length:var(--typography-body-md-size)] leading-[var(--typography-body-md-leading)] font-[var(--typography-body-md-weight)]",
  "text-[var(--typography-primary)]",
  "placeholder:text-[var(--typography-muted)]",
  "disabled:cursor-not-allowed",
].join(" ");

// ─── InputField (single line) ─────────────────────────────────────────────────

export const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  function InputField(
    {
      label,
      hint,
      state = "default",
      leadingIcon,
      trailingIcon,
      disabled,
      className = "",
      id: propId,
      ...rest
    },
    ref
  ) {
    const generatedId = useId();
    const id = propId ?? generatedId;
    const s = stateStyles[state];

    return (
      <div className={["flex flex-col gap-1", className].join(" ")}>
        {label && (
          <label
            htmlFor={id}
            className="text-[length:var(--typography-body-sm-em-size)] leading-[var(--typography-body-sm-em-leading)] font-[var(--typography-body-sm-em-weight)] text-[var(--typography-secondary)]"
          >
            {label}
          </label>
        )}

        <div
          className={[
            wrapperBase,
            s.border,
            disabled ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {leadingIcon && (
            <span className={`w-4 h-4 flex-shrink-0 ${s.icon}`} aria-hidden="true">
              {leadingIcon}
            </span>
          )}

          <input
            id={id}
            ref={ref}
            disabled={disabled}
            aria-describedby={hint ? `${id}-hint` : undefined}
            aria-invalid={state === "error" ? "true" : undefined}
            className={inputBase}
            {...rest}
          />

          {trailingIcon && (
            <span className={`w-4 h-4 flex-shrink-0 ${s.icon}`} aria-hidden="true">
              {trailingIcon}
            </span>
          )}
        </div>

        {hint && (
          <p
            id={`${id}-hint`}
            className={[
              "text-[length:var(--typography-caption-md-size)] leading-[var(--typography-caption-md-leading)] font-[var(--typography-caption-md-weight)]",
              s.hint,
            ].join(" ")}
          >
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
    const s = stateStyles[state];

    return (
      <div className={["flex flex-col gap-1", className].join(" ")}>
        {label && (
          <label
            htmlFor={id}
            className="text-[length:var(--typography-body-sm-em-size)] leading-[var(--typography-body-sm-em-leading)] font-[var(--typography-body-sm-em-weight)] text-[var(--typography-secondary)]"
          >
            {label}
          </label>
        )}

        <div
          className={[
            "w-full px-4 py-3.5",
            "rounded-2xl",
            "bg-[var(--surfaces-base-low-contrast)]",
            "border transition-colors duration-150",
            s.border,
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
              "disabled:cursor-not-allowed",
            ].join(" ")}
            {...rest}
          />
        </div>

        {hint && (
          <p
            id={`${id}-hint`}
            className={[
              "text-[length:var(--typography-caption-md-size)] leading-[var(--typography-caption-md-leading)] font-[var(--typography-caption-md-weight)]",
              s.hint,
            ].join(" ")}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);
