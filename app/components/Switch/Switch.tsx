"use client";

/**
 * Switch -- toggle switch for binary on/off settings.
 *
 * Renders a track-and-thumb toggle using a <button role="switch">.
 * Uses brand-interactive color when on, base-low-contrast when off.
 *
 * @prop checked  -- controlled on/off state (default: false)
 * @prop onChange -- called with the new boolean value on toggle
 * @prop label   -- optional text beside the switch (clickable)
 *
 * Implementation: Uses a native <button> with role="switch" and aria-checked
 * instead of a hidden <input type="checkbox"> for simpler DOM structure.
 * The thumb slides via translate-x transition (translate-x-0 off, translate-x-5 on).
 */

import { ButtonHTMLAttributes, useId } from "react";

// --- Types -------------------------------------------------------------------

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> {
  /** Whether the switch is on */
  checked?: boolean;
  /** Called when toggled */
  onChange?: (checked: boolean) => void;
  /** Optional text label rendered beside the switch */
  label?: string;
}

// --- Switch ------------------------------------------------------------------

export function Switch({
  checked = false,
  onChange,
  label,
  disabled,
  className = "",
  id,
  ...rest
}: SwitchProps) {
  // Generate a stable id for aria-labelledby linkage between switch and label
  const autoId = useId();
  const switchId = id ?? autoId;
  const labelId = label ? `${switchId}-label` : undefined;
  const isDisabled = !!disabled;

  function handleClick() {
    if (isDisabled) return;
    onChange?.(!checked);
  }

  return (
    <div
      className={[
        "inline-flex items-center gap-[var(--space-2)]",
        isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
        className,
      ].join(" ")}
    >
      {/* Switch track -- brand color when checked, low-contrast when off */}
      <button
        {...rest}
        id={switchId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        disabled={isDisabled}
        onClick={handleClick}
        className={[
          "relative inline-flex flex-shrink-0 h-6 w-11 rounded-full border-2 border-transparent",
          "transition-colors duration-200 ease-in-out cursor-[inherit]",
          checked
            ? "bg-[var(--surfaces-brand-interactive)]"
            : "bg-[var(--surfaces-base-low-contrast)]",
          !isDisabled && !checked ? "hover:bg-[var(--surfaces-base-low-contrast-hover)]" : "",
          !isDisabled && checked ? "hover:bg-[var(--surfaces-brand-interactive-hover)]" : "",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[var(--surfaces-brand-interactive)]",
        ].join(" ")}
      >
        {/* Thumb -- slides via translate-x (0 = off, 5 = on) with eased transition */}
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-[var(--surfaces-base-primary)]",
            "shadow-sm transform transition-transform duration-200 ease-in-out",
            checked ? "translate-x-5" : "translate-x-0",
          ].join(" ")}
        />
      </button>

      {/* Optional text label */}
      {label && (
        <span
          id={labelId}
          className="text-[length:var(--typography-body-md-size)] leading-[var(--typography-body-md-leading)] text-[var(--typography-primary)]"
          onClick={handleClick}
        >
          {label}
        </span>
      )}
    </div>
  );
}
