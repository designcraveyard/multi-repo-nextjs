"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppNativePicker everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Trigger button background
    triggerBg:      "var(--surfaces-base-primary)",
    // Trigger button text + chevron icon
    triggerText:    "var(--typography-primary)",
    // Default border around trigger
    border:         "var(--border-default)",
    // Border in error state
    borderError:    "var(--border-error)",
    // Dropdown menu panel background
    menuBg:         "var(--surfaces-base-low-contrast)",
    // Unselected option text
    optionText:     "var(--typography-primary)",
    // Selected option text (highlighted)
    selectedText:   "var(--typography-brand)",
    // Error message text below trigger
    errorText:      "var(--typography-error)",
    // Placeholder text when nothing is selected
    placeholder:    "var(--typography-muted)",
  },
  layout: {
    // Corner radius of trigger and dropdown panel
    radius:             "var(--radius-md)",
    // Vertical padding inside the trigger
    paddingY:           "var(--space-2)",
    // Horizontal padding inside the trigger
    paddingX:           "var(--space-4)",
    // Error border width
    errorBorderWidth:   "1.5px",
    // Default border width
    defaultBorderWidth: "1px",
  },
  typography: {
    // Trigger label + option row font size
    label:   "var(--typography-body-md-size)",
    leading: "var(--typography-body-md-leading)",
    weight:  "var(--typography-body-md-weight)",
    // Helper / error text below trigger
    helper:  "var(--typography-caption-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickerOption<T extends string = string> {
  label: string;
  value: T;
}

export interface AppNativePickerProps<T extends string = string> {
  /** Label shown above the trigger */
  label: string;
  /** Currently selected value */
  value: T;
  /** Called when the user selects a new option */
  onChange: (value: T) => void;
  /** The list of options to display */
  options: PickerOption<T>[];
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Renders at 0.5 opacity and blocks interaction */
  disabled?: boolean;
  /** When true, draws an error border and shows errorMessage below */
  showError?: boolean;
  /** Validation message shown below trigger when showError is true */
  errorMessage?: string;
  /** Additional CSS class for the wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppNativePicker<T extends string = string>({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  showError = false,
  errorMessage = "",
  className = "",
}: AppNativePickerProps<T>) {
  const borderColor = showError ? styling.colors.borderError : styling.colors.border;
  const borderWidth = showError ? styling.layout.errorBorderWidth : styling.layout.defaultBorderWidth;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Accessible label above the trigger */}
      <span
        style={{
          fontSize:   styling.typography.label,
          lineHeight: styling.typography.leading,
          fontWeight: styling.typography.weight,
          color:      styling.colors.triggerText,
        }}
      >
        {label}
      </span>

      <Select
        value={value}
        onValueChange={(v) => onChange(v as T)}
        disabled={disabled}
      >
        <SelectTrigger
          style={{
            backgroundColor: styling.colors.triggerBg,
            color:           styling.colors.triggerText,
            borderColor,
            borderWidth,
            borderStyle:     "solid",
            borderRadius:    styling.layout.radius,
            paddingTop:      styling.layout.paddingY,
            paddingBottom:   styling.layout.paddingY,
            paddingLeft:     styling.layout.paddingX,
            paddingRight:    styling.layout.paddingX,
            fontSize:        styling.typography.label,
            lineHeight:      styling.typography.leading,
            // Disabled: 0.5 opacity — design system convention
            opacity:         disabled ? 0.5 : 1,
          }}
          // Override shadcn focus ring with our brand token
          className="focus:ring-2 focus:ring-[var(--border-brand)] focus:ring-offset-2"
        >
          <SelectValue
            placeholder={
              <span style={{ color: styling.colors.placeholder }}>{placeholder}</span>
            }
          />
        </SelectTrigger>

        <SelectContent
          style={{
            backgroundColor: styling.colors.menuBg,
            borderRadius:    styling.layout.radius,
          }}
        >
          {options.map((opt) => (
            <SelectItem
              key={opt.value}
              value={opt.value}
              style={{
                // Highlight the currently selected option with brand text color
                color:      opt.value === value ? styling.colors.selectedText : styling.colors.optionText,
                fontSize:   styling.typography.label,
                lineHeight: styling.typography.leading,
              }}
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Validation error message */}
      {showError && errorMessage && (
        <span
          style={{
            color:    styling.colors.errorText,
            fontSize: styling.typography.helper,
          }}
        >
          {errorMessage}
        </span>
      )}
    </div>
  );
}
