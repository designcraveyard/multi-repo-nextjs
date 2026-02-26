"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type IconButtonVariant =
  | "primary"      // solid brand bg  — icon --icons-on-brand-primary
  | "secondary"    // low-contrast bg — icon --icons-primary
  | "tertiary"     // white + border  — icon --icons-primary
  | "quarternary"  // transparent, no border — icon --icons-primary
  | "success"      // solid green bg  — icon --icons-on-brand-primary
  | "danger";      // solid red bg    — icon --icons-on-brand-primary

export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Phosphor icon (or any ReactNode) to render */
  icon: ReactNode;
  /** Visual style. Default: "primary" */
  variant?: IconButtonVariant;
  /** Size tier. Default: "lg" */
  size?: IconButtonSize;
  /** Accessible label — required for a11y */
  label: string;
  /** Puts the button into a non-interactive loading state */
  isLoading?: boolean;
}

// ─── Size Config ──────────────────────────────────────────────────────────────
//
// Figma node 76:208 (IconButton component set):
//   Large  → 48×48px container, icon-24px (lg)
//   Medium → 36×36px container, icon-20px (md)
//   Small  → 24×24px container, icon-16px (sm)
//
// Container is a perfect square with rounded-full (pill / circle shape).

const sizeStyles: Record<IconButtonSize, { container: string; iconSize: string }> = {
  lg: { container: "w-12 h-12", iconSize: "w-6 h-6" },   // 48px / 24px icon
  md: { container: "w-9 h-9",  iconSize: "w-5 h-5" },    // 36px / 20px icon
  sm: { container: "w-6 h-6",  iconSize: "w-4 h-4" },    // 24px / 16px icon
};

// ─── Variant Config ───────────────────────────────────────────────────────────
//
// Token mapping (Figma Semantic → CSS custom property):
//
// Primary:
//   bg      → Surfaces/BrandInteractive           → --surfaces-brand-interactive
//   hover   → Surfaces/BrandInteractiveHover      → --surfaces-brand-interactive-hover
//   pressed → Surfaces/BrandInteractivePressed    → --surfaces-brand-interactive-pressed
//   icon    → Icons/OnBrandPrimary                → --icons-on-brand-primary
//
// Secondary:
//   bg      → Surfaces/BrandInteractiveLowContrast       → --surfaces-brand-interactive-low-contrast
//   hover   → Surfaces/BrandInteractiveLowContrastHover  → --surfaces-brand-interactive-low-contrast-hover
//   pressed → Surfaces/BrandInteractiveLowContrastPres.  → --surfaces-brand-interactive-low-contrast-pressed
//   icon    → Icons/Primary                              → --icons-primary
//
// Tertiary:
//   bg      → Surfaces/BasePrimary          → --surfaces-base-primary
//   hover   → Surfaces/BasePrimaryHover     → --surfaces-base-primary-hover
//   pressed → Surfaces/BasePrimaryPressed   → --surfaces-base-primary-pressed
//   border  → Border/Brand                  → --border-brand
//   icon    → Icons/Primary                 → --icons-primary
//
// Quarternary:
//   bg      → transparent (no fill)
//   hover   → Surfaces/BasePrimaryHover     → --surfaces-base-primary-hover
//   pressed → Surfaces/BasePrimaryPressed   → --surfaces-base-primary-pressed
//   border  → none
//   icon    → Icons/Primary                 → --icons-primary
//
// Success:
//   bg      → Surfaces/SuccessSolid         → --surfaces-success-solid
//   hover   → Surfaces/SuccessSolidHover    → --surfaces-success-solid-hover
//   pressed → Surfaces/SuccessSolidPressed  → --surfaces-success-solid-pressed
//   icon    → Icons/OnBrandPrimary          → --icons-on-brand-primary
//
// Danger:
//   bg      → Surfaces/ErrorSolid           → --surfaces-error-solid
//   hover   → Surfaces/ErrorSolidHover      → --surfaces-error-solid-hover
//   pressed → Surfaces/ErrorSolidPressed    → --surfaces-error-solid-pressed
//   icon    → Icons/OnBrandPrimary          → --icons-on-brand-primary

type VariantStyle = {
  wrapper: string;
  icon: string;
  focusRing: string;
};

const variantStyles: Record<IconButtonVariant, VariantStyle> = {
  primary: {
    wrapper: [
      "bg-[var(--surfaces-brand-interactive)]",
      "hover:bg-[var(--surfaces-brand-interactive-hover)]",
      "active:bg-[var(--surfaces-brand-interactive-pressed)]",
    ].join(" "),
    icon: "text-[var(--icons-on-brand-primary)]",
    focusRing: "focus-visible:ring-[var(--surfaces-brand-interactive)]",
  },
  secondary: {
    wrapper: [
      "bg-[var(--surfaces-brand-interactive-low-contrast)]",
      "hover:bg-[var(--surfaces-brand-interactive-low-contrast-hover)]",
      "active:bg-[var(--surfaces-brand-interactive-low-contrast-pressed)]",
    ].join(" "),
    icon: "text-[var(--icons-primary)]",
    focusRing: "focus-visible:ring-[var(--border-brand)]",
  },
  tertiary: {
    wrapper: [
      "bg-[var(--surfaces-base-primary)]",
      "border border-[var(--border-brand)]",
      "hover:bg-[var(--surfaces-base-primary-hover)]",
      "active:bg-[var(--surfaces-base-primary-pressed)]",
    ].join(" "),
    icon: "text-[var(--icons-primary)]",
    focusRing: "focus-visible:ring-[var(--border-brand)]",
  },
  quarternary: {
    wrapper: [
      "bg-transparent",
      "hover:bg-[var(--surfaces-base-primary-hover)]",
      "active:bg-[var(--surfaces-base-primary-pressed)]",
    ].join(" "),
    icon: "text-[var(--icons-primary)]",
    focusRing: "focus-visible:ring-[var(--border-brand)]",
  },
  success: {
    wrapper: [
      "bg-[var(--surfaces-success-solid)]",
      "hover:bg-[var(--surfaces-success-solid-hover)]",
      "active:bg-[var(--surfaces-success-solid-pressed)]",
    ].join(" "),
    icon: "text-[var(--icons-on-brand-primary)]",
    focusRing: "focus-visible:ring-[var(--surfaces-success-solid)]",
  },
  danger: {
    wrapper: [
      "bg-[var(--surfaces-error-solid)]",
      "hover:bg-[var(--surfaces-error-solid-hover)]",
      "active:bg-[var(--surfaces-error-solid-pressed)]",
    ].join(" "),
    icon: "text-[var(--icons-on-brand-primary)]",
    focusRing: "focus-visible:ring-[var(--surfaces-error-solid)]",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function IconButton({
  icon,
  variant = "primary",
  size = "lg",
  label,
  isLoading = false,
  disabled,
  className = "",
  ...rest
}: IconButtonProps) {
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      aria-label={label}
      title={label}
      className={[
        // Square container, pill/circle shape
        "inline-flex items-center justify-center rounded-full",
        "select-none flex-shrink-0",
        // Size (exact pixel match to Figma)
        s.container,
        // Variant colours
        v.wrapper,
        // Icon colour (sets currentColor)
        v.icon,
        // Cursor
        "cursor-pointer",
        // Disabled: 50% opacity — Figma disabled state
        "disabled:opacity-50 disabled:cursor-not-allowed",
        // Transition
        "transition-colors duration-150 ease-out",
        // Focus ring
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        v.focusRing,
        className,
      ].join(" ")}
      {...rest}
    >
      {isLoading ? (
        // Loading spinner — inherits currentColor
        <svg
          className={`${s.iconSize} animate-spin`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12" cy="12" r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : (
        <span className={`${s.iconSize} flex items-center justify-center`} aria-hidden="true">
          {icon}
        </span>
      )}
    </button>
  );
}
