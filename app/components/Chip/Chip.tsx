"use client";

/**
 * Chip -- toggleable pill button from the bubbles-kit design system.
 *
 * Used for tab rows, filter toggles, and segment controls. Renders as a
 * button with active/inactive visual states and optional leading/trailing icons.
 *
 * @variant "chipTabs"       -- tab-style chip, pill shape with pressed bg when active
 * @variant "filters"        -- filter toggle with border; active state uses border-active
 * @variant "segmentControl" -- segment inside SegmentControlBar (no border, shadow when active)
 *
 * @size "sm" -- 24px height, compact
 * @size "md" -- 36px height, standard (default)
 * @size "lg" -- 48px height, large touch target
 *
 * @prop label        -- chip text (required)
 * @prop isActive     -- toggles active/inactive visual state
 * @prop leadingIcon  -- icon before the label
 * @prop trailingIcon -- icon after the label
 *
 * ARIA: chipTabs variant uses role="tab" + aria-selected;
 *       filters variant uses role="button" + aria-pressed.
 *
 * Figma source: bubbles-kit node 76:460 (Chips component set)
 */

import { ReactNode, ButtonHTMLAttributes } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
//
// Figma: Chips component set (node 76:460)
// Axes: Type(ChipTabs/Filters/SegmentControl) × Size(Small/Medium/Large) × Active(Off/On) = 18
//
// ChipTabs     — tab-style chip, pill shape, used in tab rows
//                OFF: surfaces-base-low-contrast bg; ON: surfaces-base-low-contrast-pressed + border-active
// Filters      — filter toggle chip; OFF: surfaces-base-primary bg + border-default; ON: same bg + border-active
// SegmentControl — segment inside a SegmentControlBar (no border, surfaces-base-primary when active + shadow)

export type ChipVariant = "chipTabs" | "filters" | "segmentControl";
export type ChipSize = "sm" | "md" | "lg";

export interface ChipProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ChipVariant;
  size?: ChipSize;
  label: string;
  isActive?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
}

// ─── Size Config ──────────────────────────────────────────────────────────────
//
// Small  → h-6 (24px), px-3 (12px), py-1 (4px),  gap-1 (4px)
// Medium → h-9 (36px), px-4 (16px), py-2 (8px),  gap-2 (8px)
// Large  → h-12 (48px), px-5 (20px), py-3 (12px), gap-2 (8px)

const chipSizeStyles: Record<ChipSize, string> = {
  sm: "px-3 py-1 gap-1 text-[length:var(--typography-cta-sm-size)] leading-[var(--typography-cta-sm-leading)] font-[var(--typography-cta-sm-weight)]",
  md: "px-4 py-2 gap-2 text-[length:var(--typography-cta-sm-size)] leading-[var(--typography-cta-sm-leading)] font-[var(--typography-cta-sm-weight)]",
  lg: "px-5 py-3 gap-2 text-[length:var(--typography-cta-md-size)] leading-[var(--typography-cta-md-leading)] font-[var(--typography-cta-md-weight)]",
};

// ─── Variant Config ───────────────────────────────────────────────────────────

type ChipVariantStyle = {
  base: string;
  inactive: string;
  active: string;
};

const variantStyles: Record<ChipVariant, ChipVariantStyle> = {
  chipTabs: {
    base: "rounded-full transition-colors duration-150",
    inactive: [
      "bg-[var(--surfaces-base-low-contrast)] text-[var(--typography-secondary)]",
      "hover:bg-[var(--surfaces-base-low-contrast-hover)]",
      "active:bg-[var(--surfaces-base-low-contrast-pressed)]",
    ].join(" "),
    active: [
      "bg-[var(--surfaces-base-low-contrast-pressed)] text-[var(--typography-primary)]",
      "ring-1 ring-[var(--border-active)]",
    ].join(" "),
  },
  filters: {
    base: "rounded-full border transition-colors duration-150",
    inactive: [
      "bg-[var(--surfaces-base-primary)] text-[var(--typography-secondary)] border-[var(--border-default)]",
      "hover:bg-[var(--surfaces-base-primary-hover)]",
      "active:bg-[var(--surfaces-base-primary-pressed)]",
    ].join(" "),
    active: [
      "bg-[var(--surfaces-base-primary)] text-[var(--typography-primary)] border-[var(--border-active)]",
      "hover:bg-[var(--surfaces-base-primary-hover)]",
    ].join(" "),
  },
  segmentControl: {
    // Used inside SegmentControlBar — container bg managed by parent
    base: "rounded-[var(--radius-sm)] transition-colors duration-150",
    inactive: [
      "bg-transparent text-[var(--typography-secondary)]",
      "hover:bg-[var(--surfaces-base-low-contrast)]",
    ].join(" "),
    active: [
      "bg-[var(--surfaces-base-primary)] text-[var(--typography-primary)]",
      "shadow-sm",
    ].join(" "),
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Chip({
  variant = "chipTabs",
  size = "md",
  label,
  isActive = false,
  leadingIcon,
  trailingIcon,
  disabled,
  className = "",
  ...rest
}: ChipProps) {
  const v = variantStyles[variant];
  const s = chipSizeStyles[size];

  // --- Render
  // ARIA role depends on variant: chipTabs acts as a tab, filters acts as a toggle button.
  // segmentControl chips are typically managed by SegmentControlBar parent.
  return (
    <button
      role={variant === "chipTabs" ? "tab" : "button"}
      aria-selected={variant === "chipTabs" ? isActive : undefined}
      aria-pressed={variant === "filters" ? isActive : undefined}
      disabled={disabled}
      aria-disabled={disabled}
      className={[
        "inline-flex items-center",
        "select-none whitespace-nowrap cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)] focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        v.base,
        s,
        isActive ? v.active : v.inactive,
        className,
      ].join(" ")}
      {...rest}
    >
      {leadingIcon && (
        <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      <span>{label}</span>
      {trailingIcon && (
        <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  );
}
