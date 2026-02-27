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
    // Trigger: chip-tab inactive appearance (surfaces-base-low-contrast bg, secondary text)
    triggerBg:        "var(--surfaces-base-low-contrast)",
    triggerHoverBg:   "var(--surfaces-base-low-contrast-hover)",
    triggerPressedBg: "var(--surfaces-base-low-contrast-pressed)",
    // Trigger text — primary when a value is selected, muted for placeholder (set via SelectValue)
    triggerText:      "var(--typography-primary)",
    // Error-state border only — no border in normal state
    borderError:      "var(--border-error)",
    // filters variant border (non-error)
    borderDefault:    "var(--border-default)",
    // filters variant background
    triggerBgFilters: "var(--surfaces-base-primary)",
    // Dropdown menu panel background
    menuBg:           "var(--surfaces-base-primary)",
    // Unselected option hover background
    optionHoverBg:    "var(--surfaces-base-primary-hover)",
    // Unselected option text
    optionText:       "var(--typography-primary)",
    // Selected option: hover-surface bg + primary text (emphasized weight distinguishes from unselected)
    selectedBg:       "var(--surfaces-base-primary-hover)",
    selectedText:     "var(--typography-primary)",
    // Error message text below trigger
    errorText:        "var(--typography-error)",
    // Placeholder text when nothing is selected
    placeholder:      "var(--typography-muted)",
  },
  layout: {
    // Pill shape matching chip component (9999px = fully rounded capsule)
    radius:           "9999px",
    // Error border width
    errorBorderWidth: "1.5px",
  },
  typography: {
    // Selected item — medium weight (emphasized) to distinguish from unselected in dropdown
    selectedWeight: "500",
    // Helper / error text below trigger
    helper:         "var(--typography-caption-md-size)",
  },
  // Form label above trigger (non-embedded mode)
  formLabel: {
    size:    "var(--typography-body-sm-em-size)",
    leading: "var(--typography-body-sm-em-leading)",
    weight:  "var(--typography-body-sm-em-weight)",
    color:   "var(--typography-secondary)",
  },
} as const;

// ─── Chip size spec ───────────────────────────────────────────────────────────
// Mirrors AppChipSize trigger dimensions (sm/md/lg).
// Embedded mode always uses sm. Standalone uses the size prop.

const CHIP_SIZE_SPEC = {
  sm: {
    paddingX:   "var(--space-3)",  // 12px
    paddingY:   "var(--space-1)",  // 4px
    fontSize:   "var(--typography-cta-sm-size)",
    lineHeight: "var(--typography-cta-sm-leading)",
    fontWeight: "var(--typography-cta-sm-weight)",
  },
  md: {
    paddingX:   "var(--space-4)",  // 16px
    paddingY:   "var(--space-2)",  // 8px
    fontSize:   "var(--typography-cta-sm-size)",
    lineHeight: "var(--typography-cta-sm-leading)",
    fontWeight: "var(--typography-cta-sm-weight)",
  },
  lg: {
    paddingX:   "var(--space-5)",  // 20px
    paddingY:   "var(--space-3)",  // 12px
    fontSize:   "var(--typography-cta-md-size)",
    lineHeight: "var(--typography-cta-md-leading)",
    fontWeight: "var(--typography-cta-md-weight)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PickerOption<T extends string = string> {
  label: string;
  value: T;
}

export interface AppNativePickerProps<T extends string = string> {
  /** Label shown above the trigger (standalone mode) or as aria-label (embedded mode) */
  label?: string;
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
  /**
   * When true, renders only the chip trigger — no label above, no error text below.
   * Use this when embedding inside InputField's leadingPicker or trailingPicker slot.
   * Embedded mode always uses sm size and chipTabs variant, and removes the focus ring.
   * @example
   *   <InputField
   *     label="Amount"
   *     leadingPicker={<AppNativePicker label="Currency" value={currency} onChange={setCurrency} options={currencies} embedded />}
   *     leadingSeparator
   *   />
   */
  embedded?: boolean;
  /**
   * Chip size for standalone mode: sm | md | lg.
   * Ignored when embedded (always sm).
   */
  size?: "sm" | "md" | "lg";
  /**
   * Chip variant for standalone mode: chipTabs | filters.
   * chipTabs: surfaces-base-low-contrast bg, no border.
   * filters: surfaces-base-primary bg, border-default border.
   * Ignored when embedded (always chipTabs).
   */
  variant?: "chipTabs" | "filters";
  /** Additional CSS class for the wrapper (ignored in embedded mode) */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A chip-styled select dropdown backed by shadcn Select (Radix).
 *
 * Supports two rendering modes:
 * - **Standalone** (default): form label above, chip trigger, optional error text below.
 * - **Embedded** (`embedded={true}`): bare chip trigger only, designed for use inside
 *   InputField's `leadingPicker` / `trailingPicker` slots. Embedded mode forces `sm`
 *   size and `chipTabs` variant, and removes the focus ring (the parent handles focus).
 *
 * Two visual variants:
 * - `"chipTabs"`: low-contrast surface background, no border (default).
 * - `"filters"`: primary surface background with a `--border-default` border.
 *
 * The trigger dimensions follow the chip size spec (sm / md / lg) to match `AppChip`.
 *
 * Cross-platform counterpart: `AppNativePicker` on iOS (wraps SwiftUI `Picker`).
 */
export function AppNativePicker<T extends string = string>({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  showError = false,
  errorMessage = "",
  embedded = false,
  size = "sm",
  variant = "chipTabs",
  className = "",
}: AppNativePickerProps<T>) {
  // Embedded mode always uses sm/chipTabs; standalone respects props
  const effectiveSize    = embedded ? "sm" : size;
  const effectiveVariant = embedded ? "chipTabs" : variant;
  const sizeSpec         = CHIP_SIZE_SPEC[effectiveSize];
  const isFilters        = effectiveVariant === "filters";

  // ── Shared dropdown content (same in both modes) ──
  const dropdownContent = (
    <>
      <SelectTrigger
        aria-label={label}
        style={{
          backgroundColor: isFilters ? styling.colors.triggerBgFilters : styling.colors.triggerBg,
          color:           styling.colors.triggerText,
          border:          showError
            ? `${styling.layout.errorBorderWidth} solid ${styling.colors.borderError}`
            : isFilters
              ? `1px solid ${styling.colors.borderDefault}`
              : "none",
          borderRadius:    styling.layout.radius,
          paddingTop:      sizeSpec.paddingY,
          paddingBottom:   sizeSpec.paddingY,
          paddingLeft:     sizeSpec.paddingX,
          paddingRight:    sizeSpec.paddingX,
          fontSize:        sizeSpec.fontSize,
          lineHeight:      sizeSpec.lineHeight,
          fontWeight:      sizeSpec.fontWeight,
          cursor:          disabled ? "not-allowed" : "pointer",
          opacity:         disabled ? 0.5 : 1,
          height:          "auto",
        }}
        // Remove focus ring in embedded mode — the parent InputField handles focus styling
        className={
          embedded
            ? "focus:ring-0 focus-visible:ring-0 focus:outline-none"
            : "focus:ring-2 focus:ring-[var(--border-brand)] focus:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--border-brand)]"
        }
      >
        <SelectValue
          placeholder={
            <span style={{ color: styling.colors.placeholder }}>{placeholder}</span>
          }
        />
      </SelectTrigger>

      {/*
        border-none: strip shadcn border default on the outer panel
        viewportClassName passes classes directly into cn() on SelectPrimitive.Viewport —
          avoids all child-selector parsing issues (nested brackets in [&>[...]] break
          Tailwind v4's class parser regardless of attribute format)
        p-1: 4px breathing room on all four sides between items and panel edges
        overflow-hidden + rounded-[...]: Viewport is the DIRECT parent of SelectItems so
          clipping here fixes first/last item corner bleed at both panel and viewport level
      */}
      <SelectContent
        position="popper"
        align="start"
        className="border-none"
        viewportClassName="p-1 overflow-hidden rounded-[var(--radius-md)]"
        style={{
          backgroundColor: styling.colors.menuBg,
          borderRadius:    "var(--radius-md)",
          overflow:        "hidden",
          minWidth:        "140px",
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
                fontSize:        sizeSpec.fontSize,
                lineHeight:      sizeSpec.lineHeight,
                color:           styling.colors.optionText,
                backgroundColor: isSelected ? styling.colors.selectedBg : undefined,
                fontWeight:      isSelected ? styling.typography.selectedWeight : sizeSpec.fontWeight,
              }}
            >
              {opt.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </>
  );

  // ── Embedded mode: chip trigger only, no wrapper or form label ──
  if (embedded) {
    return (
      <Select
        value={value}
        onValueChange={(v) => onChange(v as T)}
        disabled={disabled}
      >
        {dropdownContent}
      </Select>
    );
  }

  // ── Standalone mode: form label above + chip trigger + optional error text ──
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span
          style={{
            fontSize:   styling.formLabel.size,
            lineHeight: styling.formLabel.leading,
            fontWeight: styling.formLabel.weight,
            color:      styling.formLabel.color,
          }}
        >
          {label}
        </span>
      )}

      <Select
        value={value}
        onValueChange={(v) => onChange(v as T)}
        disabled={disabled}
      >
        {dropdownContent}
      </Select>

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
