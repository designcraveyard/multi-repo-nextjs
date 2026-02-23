"use client";

import { InputHTMLAttributes, createContext, useContext, useId } from "react";

// --- Types -------------------------------------------------------------------

export interface RadioButtonProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  /** Whether this radio is currently selected */
  checked?: boolean;
  /** Called when selection changes */
  onChange?: (checked: boolean) => void;
  /** Optional text label rendered beside the radio */
  label?: string;
  /** Value associated with this radio (used by RadioGroup) */
  value?: string;
}

export interface RadioGroupProps {
  /** Currently selected value */
  value: string;
  /** Called when the selected value changes */
  onChange: (value: string) => void;
  /** Shared name attribute for all radios in the group */
  name?: string;
  /** Disables all radios in the group */
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

// --- RadioGroup context ------------------------------------------------------

interface RadioGroupContextValue {
  name: string;
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

// --- RadioButton -------------------------------------------------------------

/** Standalone radio button with optional label. Use inside RadioGroup for single-selection. */
export function RadioButton({
  checked,
  onChange,
  label,
  value,
  disabled,
  className = "",
  name,
  id,
  ...rest
}: RadioButtonProps) {
  const group = useContext(RadioGroupContext);
  const autoId = useId();
  const inputId = id ?? autoId;

  // Resolve props from group context when available
  const isChecked = group ? group.value === value : !!checked;
  const isDisabled = group ? group.disabled || !!disabled : !!disabled;
  const inputName = group ? group.name : name;

  function handleChange() {
    if (isDisabled) return;
    if (group && value !== undefined) {
      group.onChange(value);
    } else {
      onChange?.(!isChecked);
    }
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
        type="radio"
        name={inputName}
        value={value}
        checked={isChecked}
        disabled={isDisabled}
        onChange={handleChange}
        className="sr-only peer"
      />

      {/* Custom radio circle */}
      <span
        aria-hidden="true"
        className={[
          "relative flex-shrink-0 w-5 h-5 rounded-full border-2 transition-colors duration-150",
          "flex items-center justify-center",
          isChecked
            ? "border-[var(--surfaces-brand-interactive)] bg-[var(--surfaces-brand-interactive)]"
            : "border-[var(--border-default)] bg-transparent",
          !isDisabled && !isChecked ? "peer-hover:border-[var(--border-brand)]" : "",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-[var(--surfaces-brand-interactive)]",
        ].join(" ")}
      >
        {/* Inner dot when checked */}
        {isChecked && (
          <span className="w-2 h-2 rounded-full bg-[var(--typography-on-brand-primary)]" />
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

// --- RadioGroup --------------------------------------------------------------

/** Manages single-selection state across a group of RadioButton children. */
export function RadioGroup({
  value,
  onChange,
  name,
  disabled = false,
  children,
  className = "",
}: RadioGroupProps) {
  const autoName = useId();

  return (
    <RadioGroupContext.Provider
      value={{ name: name ?? autoName, value, disabled, onChange }}
    >
      <div role="radiogroup" className={["flex flex-col gap-[var(--space-3)]", className].join(" ")}>
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}
