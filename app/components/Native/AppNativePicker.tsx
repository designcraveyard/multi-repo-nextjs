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
    // Trigger button background and hover/pressed states
    triggerBg:        "var(--surfaces-base-primary)",
    triggerHoverBg:   "var(--surfaces-base-primary-hover)",
    triggerPressedBg: "var(--surfaces-base-primary-pressed)",
    // Trigger button text + chevron icon
    triggerText:      "var(--typography-primary)",
    // Error-state border only — no border in normal state
    borderError:      "var(--border-error)",
    // Dropdown menu panel background
    menuBg:           "var(--surfaces-base-primary)",
    // Unselected option hover background
    optionHoverBg:    "var(--surfaces-base-primary-hover)",
    // Unselected option text
    optionText:       "var(--typography-primary)",
    // Selected option: hover surface + primary text (emphasized weight distinguishes from unselected)
    selectedBg:       "var(--surfaces-base-primary-hover)",
    selectedText:     "var(--typography-primary)",
    // Error message text below trigger
    errorText:        "var(--typography-error)",
    // Placeholder text when nothing is selected
    placeholder:      "var(--typography-muted)",
  },
  layout: {
    // Corner radius of trigger and dropdown panel
    radius:           "var(--radius-md)",
    // Vertical padding inside the trigger
    paddingY:         "var(--space-2)",
    // Horizontal padding inside the trigger
    paddingX:         "var(--space-4)",
    // Error border width
    errorBorderWidth: "1.5px",
  },
  typography: {
    // Trigger label + option row font size
    label:          "var(--typography-body-md-size)",
    leading:        "var(--typography-body-md-leading)",
    weight:         "var(--typography-body-md-weight)",
    // Selected item — medium weight (emphasized) to distinguish from unselected
    selectedWeight: "500",
    // Helper / error text below trigger
    helper:         "var(--typography-caption-md-size)",
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
            // No border in normal state; error border only when showError
            border:          showError
              ? `${styling.layout.errorBorderWidth} solid ${styling.colors.borderError}`
              : "none",
            borderRadius:    styling.layout.radius,
            paddingTop:      styling.layout.paddingY,
            paddingBottom:   styling.layout.paddingY,
            paddingLeft:     styling.layout.paddingX,
            paddingRight:    styling.layout.paddingX,
            fontSize:        styling.typography.label,
            lineHeight:      styling.typography.leading,
            cursor:          disabled ? "not-allowed" : "pointer",
            // Disabled: 0.5 opacity — design system convention
            opacity:         disabled ? 0.5 : 1,
          }}
          // Override shadcn focus ring with our brand token; suppress default ring
          className="focus:ring-2 focus:ring-[var(--border-brand)] focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
        >
          <SelectValue
            placeholder={
              <span style={{ color: styling.colors.placeholder }}>{placeholder}</span>
            }
          />
        </SelectTrigger>

        {/*
          border-none p-0: strip shadcn defaults
          overflow inline style (not class): beats Radix Portal stacking context — ensures
            the panel clips children to its border-radius reliably
          [&>[role=listbox]]:p-0: zero out shadcn Viewport's p-1 so items sit flush at edges
          [&>[role=listbox]]:overflow-hidden + [&>[role=listbox]]:rounded-*: the Viewport is
            the DIRECT parent of SelectItems — giving it matching overflow+radius means
            items are clipped at both the outer panel AND at the viewport level, fixing
            first/last item corner bleed in all browsers
        */}
        <SelectContent
          className="border-none p-0 [&>[role=listbox]]:p-0 [&>[role=listbox]]:overflow-hidden [&>[role=listbox]]:rounded-[var(--radius-md)]"
          style={{
            backgroundColor: styling.colors.menuBg,
            borderRadius:    styling.layout.radius,
            overflow:        "hidden",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <SelectItem
                key={opt.value}
                value={opt.value}
                // rounded-none: no per-item radius (panel radius clips corners)
                // [&>span:first-child]:hidden: remove shadcn's absolute checkmark
                //   indicator span so there is no invisible left indent
                // pl/pr/py: compact uniform padding matching AppContextMenu rows
                // data-[highlighted]: hover bg, no radius (flat rows)
                // data-[state=checked]: hover-surface bg + emphasized weight via style
                className="rounded-none cursor-pointer [&>span:first-child]:hidden pl-[var(--space-4)] pr-[var(--space-4)] py-[var(--space-3)] data-[highlighted]:bg-[var(--surfaces-base-primary-hover)] data-[highlighted]:text-[var(--typography-primary)] data-[state=checked]:bg-[var(--surfaces-base-primary-hover)] data-[state=checked]:text-[var(--typography-primary)]"
                style={{
                  fontSize:        styling.typography.label,
                  lineHeight:      styling.typography.leading,
                  color:           styling.colors.optionText,
                  backgroundColor: isSelected ? styling.colors.selectedBg : undefined,
                  fontWeight:      isSelected ? styling.typography.selectedWeight : styling.typography.weight,
                }}
              >
                {opt.label}
              </SelectItem>
            );
          })}
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
