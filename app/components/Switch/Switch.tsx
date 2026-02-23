"use client";

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

/** Toggle switch for binary on/off settings. */
export function Switch({
  checked = false,
  onChange,
  label,
  disabled,
  className = "",
  id,
  ...rest
}: SwitchProps) {
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
      {/* Switch track + thumb */}
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
        {/* Thumb */}
        <span
          aria-hidden="true"
          className={[
            "pointer-events-none inline-block h-5 w-5 rounded-full bg-white",
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
