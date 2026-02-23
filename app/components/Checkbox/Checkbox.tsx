"use client";

import { InputHTMLAttributes, useId } from "react";

// --- Types -------------------------------------------------------------------

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  /** Whether the checkbox is checked */
  checked?: boolean;
  /** Called when checked state changes */
  onChange?: (checked: boolean) => void;
  /** Optional text label rendered beside the checkbox */
  label?: string;
  /** Shows a horizontal dash instead of a checkmark (partial selection) */
  indeterminate?: boolean;
}

// --- Checkbox ----------------------------------------------------------------

/** Standalone checkbox with optional label. Supports checked, unchecked, and indeterminate states. */
export function Checkbox({
  checked = false,
  onChange,
  label,
  indeterminate = false,
  disabled,
  className = "",
  id,
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const isDisabled = !!disabled;

  function handleChange() {
    if (isDisabled) return;
    onChange?.(!checked);
  }

  return (
    <label
      htmlFor={inputId}
      className={[
        "inline-flex items-center gap-[var(--space-2)] cursor-pointer select-none",
        isDisabled ? "opacity-50 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {/* Hidden native input for accessibility */}
      <input
        {...rest}
        id={inputId}
        type="checkbox"
        checked={checked}
        disabled={isDisabled}
        onChange={handleChange}
        aria-checked={indeterminate ? "mixed" : checked}
        className="sr-only peer"
        ref={(el) => {
          if (el) el.indeterminate = indeterminate;
        }}
      />

      {/* Custom checkbox square */}
      <span
        aria-hidden="true"
        className={[
          "relative flex-shrink-0 w-5 h-5 rounded-[var(--radius-xs)] border-2 transition-colors duration-150",
          "flex items-center justify-center",
          checked || indeterminate
            ? "border-[var(--surfaces-brand-interactive)] bg-[var(--surfaces-brand-interactive)]"
            : "border-[var(--border-default)] bg-transparent",
          !isDisabled && !checked && !indeterminate
            ? "peer-hover:border-[var(--border-brand)]"
            : "",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--surfaces-brand-interactive)]",
        ].join(" ")}
      >
        {/* Checkmark icon */}
        {checked && !indeterminate && (
          <svg
            className="w-3 h-3 text-[var(--typography-on-brand-primary)]"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 6L5 9L10 3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}

        {/* Indeterminate dash */}
        {indeterminate && (
          <svg
            className="w-3 h-3 text-[var(--typography-on-brand-primary)]"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2.5 6H9.5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        )}
      </span>

      {/* Optional text label */}
      {label && (
        <span className="text-[length:var(--typography-body-md-size)] leading-[var(--typography-body-md-leading)] text-[var(--typography-primary)]">
          {label}
        </span>
      )}
    </label>
  );
}
