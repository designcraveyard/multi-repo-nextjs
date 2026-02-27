"use client";

import { useId } from "react";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppColorPicker everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Label text rendered next to the color swatch
    label: "var(--typography-primary)",
  },
  layout: {
    // Width and height of the color swatch input element
    swatchSize: "32px",
    // Corner radius of the swatch
    radius:     "var(--radius-sm)",
    // Gap between the swatch and the label text
    gap:        "var(--space-3)",
  },
  typography: {
    size:    "var(--typography-body-md-size)",
    leading: "var(--typography-body-md-leading)",
    weight:  "var(--typography-body-md-weight)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppColorPickerProps {
  /** Hex color string (e.g., "#FF0000") */
  value: string;
  /** Called when the user picks a new color */
  onChange: (value: string) => void;
  /** Label shown next to the color swatch */
  label?: string;
  /** Renders at 0.5 opacity and blocks interaction */
  disabled?: boolean;
  /** Additional CSS class for the wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A color swatch input with an optional label, backed by the native
 * `<input type="color">` element.
 *
 * Uses `appearance: none` to strip default browser chrome so the swatch
 * fills the full element. A stable `useId()` links the `<label>` to the
 * `<input>` for accessibility.
 *
 * Cross-platform counterpart: `AppColorPicker` on iOS (wraps SwiftUI `ColorPicker`).
 */
export function AppColorPicker({
  value,
  onChange,
  label,
  disabled = false,
  className = "",
}: AppColorPickerProps) {
  // Stable id linking <label> to <input> for accessibility
  const id = useId();

  return (
    <div
      className={`flex items-center ${className}`}
      style={{ gap: styling.layout.gap, opacity: disabled ? 0.5 : 1 }}
    >
      {/* Native color input — the browser renders the swatch and color picker UI */}
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{
          width:           styling.layout.swatchSize,
          height:          styling.layout.swatchSize,
          borderRadius:    styling.layout.radius,
          // Strip the default browser padding and border around the swatch
          padding:         0,
          border:          "none",
          cursor:          disabled ? "not-allowed" : "pointer",
          // Let the color fill the full element without extra chrome
          appearance:      "none",
          backgroundColor: "transparent",
        }}
        // Announce the selected color to screen readers
        aria-label={label ?? "Color picker"}
      />

      {label && (
        <label
          htmlFor={id}
          style={{
            color:      styling.colors.label,
            fontSize:   styling.typography.size,
            lineHeight: styling.typography.leading,
            fontWeight: styling.typography.weight,
            cursor:     disabled ? "not-allowed" : "pointer",
          }}
        >
          {label}
        </label>
      )}
    </div>
  );
}
