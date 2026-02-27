"use client";

/**
 * Icon — typed wrapper around @phosphor-icons/react
 *
 * Enforces token-aligned sizes and weights. Use this instead of importing
 * Phosphor icons directly so icon usage stays consistent cross-platform.
 *
 * Usage:
 *   import { Icon } from "@/app/components/icons/Icon";
 *   <Icon name="House" />
 *   <Icon name="Heart" weight="fill" size="md" color="var(--icon-error)" />
 *   <Icon name="ArrowRight" size={20} />           // raw px also accepted
 *
 * Size tokens (match Figma Dimensions grid):
 *   xs  = 12px   sm  = 16px   md  = 20px (default)   lg  = 24px   xl  = 32px
 *
 * Weight tokens (all Phosphor weights):
 *   thin | light | regular (default) | bold | fill | duotone
 */

import * as PhosphorIcons from "@phosphor-icons/react";
import type { Icon as PhosphorIconType, IconWeight } from "@phosphor-icons/react";

// ─── Size token map ───────────────────────────────────────────────────────────

export type IconSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<IconSize, number> = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// ─── Icon name type — keys of all exported Phosphor icons ────────────────────

// Conditional type that filters the Phosphor module exports to only those that
// are actual Icon components (excludes utility types, context, etc.)
type PhosphorIconName = {
  [K in keyof typeof PhosphorIcons]: (typeof PhosphorIcons)[K] extends PhosphorIconType
    ? K
    : never;
}[keyof typeof PhosphorIcons];

// ─── Props ────────────────────────────────────────────────────────────────────

export interface IconProps {
  /** Phosphor icon name (PascalCase, e.g. "House", "ArrowRight", "HeartFill") */
  name: PhosphorIconName;
  /** Token-based size alias or raw number in px. Default: "md" (20px) */
  size?: IconSize | number;
  /** Phosphor weight. Default: "regular" */
  weight?: IconWeight;
  /** CSS color value. Default: "currentColor" (inherits from parent) */
  color?: string;
  /** Flip horizontally (for RTL layouts) */
  mirrored?: boolean;
  /** Accessible label. If omitted, icon is aria-hidden */
  label?: string;
  /** Additional CSS class names */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Icon({
  name,
  size = "md",
  weight = "regular",
  color = "currentColor",
  mirrored = false,
  label,
  className,
}: IconProps) {
  // Dynamic lookup: resolve the PascalCase name to the actual Phosphor component
  const IconComponent = PhosphorIcons[name] as PhosphorIconType | undefined;

  // Guard against invalid names -- dev-only warning, renders nothing in production
  if (!IconComponent) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[Icon] Unknown icon name: "${name}"`);
    }
    return null;
  }

  // Accept either a token alias ("sm", "md", etc.) or a raw pixel number
  const resolvedSize = typeof size === "number" ? size : SIZE_MAP[size];

  return (
    <IconComponent
      size={resolvedSize}
      weight={weight}
      color={color}
      mirrored={mirrored}
      aria-hidden={!label}
      aria-label={label}
      className={className}
    />
  );
}
