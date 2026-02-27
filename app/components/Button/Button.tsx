"use client";

/**
 * Button -- primary action component from the bubbles-kit design system.
 *
 * Renders a pill-shaped button with semantic color variants, three size tiers,
 * optional leading/trailing icons, and a built-in loading spinner.
 *
 * @variant "primary"   -- solid brand background, high-emphasis CTA
 * @variant "secondary"  -- low-contrast brand background, medium-emphasis
 * @variant "tertiary"   -- outlined with brand border, low-emphasis
 * @variant "success"    -- solid green background for confirmations
 * @variant "danger"     -- solid red background for destructive actions
 *
 * @size "sm" -- 24px height, compact inline use
 * @size "md" -- 36px height, standard forms
 * @size "lg" -- 48px height, primary page CTAs (default)
 *
 * @prop label         -- button text (required)
 * @prop leadingIcon   -- ReactNode rendered before the label
 * @prop trailingIcon  -- ReactNode rendered after the label
 * @prop isLoading     -- replaces leading icon with a spinner and disables interaction
 *
 * Figma source: bubbles-kit node 229:3892 (_Button component set)
 */

import { ReactNode, ButtonHTMLAttributes } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "success" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  label: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  isLoading?: boolean;
}

// ─── Size Config ──────────────────────────────────────────────────────────────
//
// Figma node 229:3892 (_Button component set):
//   Small  → h-24px, px-8px  / py-4px,  gap-2px,  font: --typography-cta-sm  (12px/600), icon-16px
//   Medium → h-36px, px-16px / py-8px,  gap-8px,  font: --typography-cta-md  (14px/600), icon-20px
//   Large  → h-48px, px-20px / py-12px, gap-12px, font: --typography-cta-lg  (16px/600), icon-24px
//
// Tailwind spacing maps to --space-* tokens via @theme inline in globals.css:
//   px-2  = --space-2 (8px)   px-4 = --space-4 (16px)   px-5 = --space-5 (20px)
//   py-1  = --space-1 (4px)   py-2 = --space-2 (8px)    py-3 = --space-3 (12px)
//   gap-* follows same mapping.
// cornerRadius = 2000 → pill → rounded-full

const sizeStyles: Record<ButtonSize, { wrapper: string; label: string; iconSize: string }> = {
  sm: {
    // px-2 = var(--space-2) 8px | py-1 = var(--space-1) 4px | gap-0.5 = 2px
    wrapper:  "h-6 px-2 py-1 gap-0.5",
    label:    "text-[length:var(--typography-cta-sm-size)] leading-[var(--typography-cta-sm-leading)] font-[var(--typography-cta-sm-weight)]",
    iconSize: "w-4 h-4",
  },
  md: {
    // px-4 = var(--space-4) 16px | py-2 = var(--space-2) 8px | gap-2 = var(--space-2) 8px
    wrapper:  "h-9 px-4 py-2 gap-2",
    label:    "text-[length:var(--typography-cta-md-size)] leading-[var(--typography-cta-md-leading)] font-[var(--typography-cta-md-weight)]",
    iconSize: "w-5 h-5",
  },
  lg: {
    // px-5 = var(--space-5) 20px | py-3 = var(--space-3) 12px | gap-3 = var(--space-3) 12px
    wrapper:  "h-12 px-5 py-3 gap-3",
    label:    "text-[length:var(--typography-cta-lg-size)] leading-[var(--typography-cta-lg-leading)] font-[var(--typography-cta-lg-weight)]",
    iconSize: "w-6 h-6",
  },
};

// ─── Variant Config ───────────────────────────────────────────────────────────
//
// Every color references the SEMANTIC CSS custom property layer from globals.css.
// Token naming follows Figma 1:1 (kebab-cased):
//   Figma: Surfaces/BrandInteractive  →  --surfaces-brand-interactive
//   Figma: Typography/OnBrandPrimary  →  --typography-on-brand-primary
//   Figma: Border/Brand               →  --border-brand
//
// Primary:
//   bg      → Surfaces/BrandInteractive          (#09090B light / #FAFAFA dark)
//   hover   → Surfaces/BrandInteractiveHover     (#27272A light / #E4E4E7 dark)
//   pressed → Surfaces/BrandInteractivePressed   (#09090B light / #A1A1AA dark)
//   text    → Typography/OnBrandPrimary          (#FFFFFF light / #000000 dark)
//
// Secondary:
//   bg      → Surfaces/BrandInteractiveLowContrast         (#E4E4E7 light / #27272A dark)
//   hover   → Surfaces/BrandInteractiveLowContrastHover    (#D4D4D8 light / #3F3F46 dark)
//   pressed → Surfaces/BrandInteractiveLowContrastPressed  (#A1A1AA light / #52525B dark)
//   text    → Typography/Brand                             (#09090B light / #FAFAFA dark)
//
// Tertiary:
//   bg      → Surfaces/BasePrimary               (#FFFFFF light / #000000 dark)
//   hover   → Surfaces/BasePrimaryHover          (#F5F5F5 light / #262626 dark)
//   pressed → Surfaces/BasePrimaryPressed        (#E5E5E5 light / #404040 dark)
//   border  → Border/Brand                       (#09090B light / #FAFAFA dark)
//   text    → Typography/Brand                   (#09090B light / #FAFAFA dark)
//
// Success:
//   bg      → Surfaces/SuccessSolid              (#16A34A light / #86EFAC dark)
//   hover   → Surfaces/SuccessSolidHover         (#15803D light / #BBF7D0 dark)
//   pressed → Surfaces/SuccessSolidPressed       (#166534 light / #DCFCE7 dark)
//   text    → Typography/OnBrandPrimary          (#FFFFFF light / #000000 dark)
//
// Danger:
//   bg      → Surfaces/ErrorSolid               (#DC2626 light / #FCA5A5 dark)
//   hover   → Surfaces/ErrorSolidHover          (#B91C1C light / #FECACA dark)
//   pressed → Surfaces/ErrorSolidPressed        (#991B1B light / #FEE2E2 dark)
//   text    → Typography/OnBrandPrimary          (#FFFFFF light / #000000 dark)

type VariantStyle = {
  wrapper: string;   // background + text + border (if any)
  focusRing: string; // focus-visible ring color
};

const variantStyles: Record<ButtonVariant, VariantStyle> = {
  primary: {
    wrapper: [
      "bg-[var(--surfaces-brand-interactive)] text-[var(--typography-on-brand-primary)]",
      "hover:bg-[var(--surfaces-brand-interactive-hover)]",
      "active:bg-[var(--surfaces-brand-interactive-pressed)]",
    ].join(" "),
    focusRing: "focus-visible:ring-[var(--surfaces-brand-interactive)]",
  },
  secondary: {
    wrapper: [
      "bg-[var(--surfaces-brand-interactive-low-contrast)] text-[var(--typography-brand)]",
      "hover:bg-[var(--surfaces-brand-interactive-low-contrast-hover)]",
      "active:bg-[var(--surfaces-brand-interactive-low-contrast-pressed)]",
    ].join(" "),
    focusRing: "focus-visible:ring-[var(--border-brand)]",
  },
  tertiary: {
    wrapper: [
      "bg-[var(--surfaces-base-primary)] text-[var(--typography-brand)]",
      "border border-[var(--border-brand)]",
      "hover:bg-[var(--surfaces-base-primary-hover)]",
      "active:bg-[var(--surfaces-base-primary-pressed)]",
    ].join(" "),
    focusRing: "focus-visible:ring-[var(--border-brand)]",
  },
  success: {
    wrapper: [
      "bg-[var(--surfaces-success-solid)] text-[var(--typography-on-brand-primary)]",
      "hover:bg-[var(--surfaces-success-solid-hover)]",
      "active:bg-[var(--surfaces-success-solid-pressed)]",
    ].join(" "),
    focusRing: "focus-visible:ring-[var(--surfaces-success-solid)]",
  },
  danger: {
    wrapper: [
      "bg-[var(--surfaces-error-solid)] text-[var(--typography-on-brand-primary)]",
      "hover:bg-[var(--surfaces-error-solid-hover)]",
      "active:bg-[var(--surfaces-error-solid-pressed)]",
    ].join(" "),
    focusRing: "focus-visible:ring-[var(--surfaces-error-solid)]",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

// --- Props
// Destructured with defaults: variant="primary", size="lg", isLoading=false.
// Extends native <button> attributes for full HTML compatibility.

export function Button({
  variant = "primary",
  size = "lg",
  label,
  leadingIcon,
  trailingIcon,
  isLoading = false,
  disabled,
  className = "",
  ...rest
}: ButtonProps) {
  // --- State
  const v = variantStyles[variant];
  const s = sizeStyles[size];
  // Treat the button as disabled when loading to prevent duplicate submissions
  const isDisabled = disabled || isLoading;

  // --- Render
  return (
    <button
      disabled={isDisabled}
      aria-disabled={isDisabled}
      aria-busy={isLoading}
      className={[
        // Layout — pill shape matches Figma cornerRadius=2000
        "inline-flex items-center justify-center rounded-full",
        "select-none whitespace-nowrap",
        // Sizing (maps to --space-* tokens)
        s.wrapper,
        // Variant colours (all via Semantic CSS custom properties)
        v.wrapper,
        // Cursor
        "cursor-pointer disabled:cursor-not-allowed",
        // Disabled: 50% opacity — matches Figma disabled state
        "disabled:opacity-50",
        // Transition
        "transition-colors duration-150 ease-out",
        // Focus ring (uses Semantic token color)
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        v.focusRing,
        className,
      ].join(" ")}
      {...rest}
    >
      {/* Leading Icon — colored via currentColor (inherits text-[var(--...)]) */}
      {leadingIcon && !isLoading && (
        <span className={`${s.iconSize} flex-shrink-0 flex items-center justify-center`} aria-hidden="true">
          {leadingIcon}
        </span>
      )}

      {/* Loading spinner — replaces leading icon, inherits currentColor */}
      {isLoading && (
        <svg
          className={`${s.iconSize} flex-shrink-0 animate-spin`}
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
      )}

      {/* Label */}
      <span className={s.label}>{label}</span>

      {/* Trailing Icon */}
      {trailingIcon && (
        <span className={`${s.iconSize} flex-shrink-0 flex items-center justify-center`} aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  );
}
