"use client";

/**
 * Checkbox -- binary toggle control from the bubbles-kit design system.
 *
 * Renders a custom-styled checkbox with a hidden native <input> for
 * accessibility. Supports checked, unchecked, and indeterminate (mixed)
 * visual states.
 *
 * @prop checked       -- controlled checked state
 * @prop onChange      -- called with the new boolean value on toggle
 * @prop label        -- optional text rendered beside the checkbox
 * @prop indeterminate -- shows a horizontal dash instead of a checkmark
 *
 * Implementation: The native checkbox is visually hidden (sr-only) but remains
 * in the DOM for screen reader and keyboard access. The custom square is
 * rendered as a sibling <span> styled via peer-* Tailwind utilities.
 */

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
      {/* Hidden native input -- sr-only keeps it in the a11y tree while the
          custom square handles visuals. The ref sets the DOM indeterminate property
          which cannot be set via HTML attributes alone. */}
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

      {/* Custom checkbox square -- uses peer-* utilities to react to the hidden input's
          hover and focus-visible states. Checked/indeterminate fills with brand color. */}
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
