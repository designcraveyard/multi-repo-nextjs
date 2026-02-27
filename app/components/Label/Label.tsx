"use client";

/**
 * Label — Figma: bubbles-kit › node 82:1401
 *
 * A pill-shaped inline label with optional leading/trailing icons.
 * Used standalone and as a slot inside InputField.
 *
 * Axes: Size (sm | md | lg) × Type (secondaryAction | primaryAction | brandInteractive | information)
 *
 * Usage:
 *   <Label label="Tag" />
 *   <Label size="lg" type="primaryAction" leadingIcon={<Icon name="CheckCircle" />} label="Verified" />
 *   <Label size="sm" type="information" label="Draft" showTrailingIcon={false} />
 */

import { ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type LabelSize = "sm" | "md" | "lg";
export type LabelType =
  | "secondaryAction"
  | "primaryAction"
  | "brandInteractive"
  | "information";

export interface LabelProps {
  /** Display text */
  label?: string;
  /** Size — maps to Figma Size axis */
  size?: LabelSize;
  /** Semantic color type — maps to Figma Type axis */
  type?: LabelType;
  /** Leading icon slot. Pass any ReactNode (use <Icon name="..." />) */
  leadingIcon?: ReactNode;
  /** Trailing icon slot */
  trailingIcon?: ReactNode;
  /** Whether to render the leading icon slot. Default true */
  showLeadingIcon?: boolean;
  /** Whether to render the trailing icon slot. Default true */
  showTrailingIcon?: boolean;
  className?: string;
}

// ─── Token maps ───────────────────────────────────────────────────────────────

// Figma: Small gap=2px (micro), Medium gap=8px (small), Large gap=12px (medium)
const GAP: Record<LabelSize, string> = {
  sm: "gap-0.5",  // 2px
  md: "gap-2",    // 8px
  lg: "gap-3",    // 12px
};

// Typography — Body Emphasized (medium weight)
const TEXT: Record<LabelSize, string> = {
  sm: [
    "text-[length:var(--typography-body-sm-em-size)]",
    "leading-[var(--typography-body-sm-em-leading)]",
    "font-[var(--typography-body-sm-em-weight)]",
  ].join(" "),
  md: [
    "text-[length:var(--typography-body-md-em-size)]",
    "leading-[var(--typography-body-md-em-leading)]",
    "font-[var(--typography-body-md-em-weight)]",
  ].join(" "),
  lg: [
    "text-[length:var(--typography-body-lg-em-size)]",
    "leading-[var(--typography-body-lg-em-leading)]",
    "font-[var(--typography-body-lg-em-weight)]",
  ].join(" "),
};

// Figma icon size: 24px at sm+md+lg (Label uses lg icon slots in Figma)
const ICON_SIZE: Record<LabelSize, string> = {
  sm: "w-4 h-4",   // 16px
  md: "w-6 h-6",   // 24px
  lg: "w-6 h-6",   // 24px
};

const COLOR: Record<LabelType, string> = {
  secondaryAction:  "text-[var(--typography-secondary)]",
  primaryAction:    "text-[var(--typography-primary)]",
  brandInteractive: "text-[var(--typography-brand)]",
  information:      "text-[var(--typography-muted)]",
};

// ─── Component ────────────────────────────────────────────────────────────────

// --- Props
// Destructured with defaults: label="Label", size="md", type="secondaryAction".
// Icon visibility is controlled by showLeadingIcon/showTrailingIcon booleans.

export function Label({
  label = "Label",
  size = "md",
  type = "secondaryAction",
  leadingIcon,
  trailingIcon,
  showLeadingIcon = true,
  showTrailingIcon = true,
  className = "",
}: LabelProps) {
  const color = COLOR[type];
  const iconSize = ICON_SIZE[size];

  return (
    <div
      className={[
        "inline-flex items-center justify-center",
        "rounded-full shrink-0",
        GAP[size],
        color,
        className,
      ].join(" ")}
    >
      {showLeadingIcon && leadingIcon && (
        <span className={`flex-shrink-0 ${iconSize}`} aria-hidden="true">
          {leadingIcon}
        </span>
      )}

      {label && (
        <span className={`shrink-0 not-italic ${TEXT[size]}`}>
          {label}
        </span>
      )}

      {showTrailingIcon && trailingIcon && (
        <span className={`flex-shrink-0 ${iconSize}`} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </div>
  );
}
