/**
 * Badge -- small status indicator from the bubbles-kit design system.
 *
 * Renders a pill-shaped inline badge for counts, labels, or dot indicators.
 * Supports solid (high-emphasis) and subtle (tinted, low-emphasis) color modes.
 *
 * @size "tiny"   -- 6px dot-only indicator, no text (e.g. unread notification dot)
 * @size "sm"     -- 14px height, compact text label
 * @size "number" -- 14px height, same as "sm" but documented separately for numeric counts
 * @size "md"     -- 16px height, standard text label (default)
 *
 * @type "brand"   -- brand-colored (default)
 * @type "success" -- green
 * @type "error"   -- red
 * @type "accent"  -- accent/purple
 *
 * @prop subtle -- when true, uses tinted (low-contrast) background instead of solid
 * @prop label  -- text or number to display (ignored for "tiny" size)
 *
 * Figma source: bubbles-kit node 87:1071 (Badge component set)
 */

// ─── Types ────────────────────────────────────────────────────────────────────
//
// Figma: Badge (node 87:1071)
// Axes: Size(Small/Number/Tiny/Medium) × Subtle(Off/On) × Type(Brand/Success/Error/Accent) = 32
//
// Tiny   — dot-only indicator, no text, 6px circle
// Small  — text label, 16px height, badge-sm font
// Number — numeric count, 16px height, badge-sm font  (same as Small but documented separately)
// Medium — text label, 20px height, badge-md font
//
// Subtle Off (solid):
//   Brand   → Surfaces/BrandInteractive bg,  Typography/OnBrandPrimary text
//   Success → Surfaces/SuccessSolid bg,      Typography/OnBrandPrimary text
//   Error   → Surfaces/ErrorSolid bg,        Typography/OnBrandPrimary text
//   Accent  → Surfaces/AccentPrimary bg,     Typography/OnBrandPrimary text
//
// Subtle On (tinted):
//   Brand   → Surfaces/BrandInteractiveLowContrast bg, Typography/Brand text
//   Success → Surfaces/SuccessSubtle bg,              Typography/Success text
//   Error   → Surfaces/ErrorSubtle bg,                Typography/Error text
//   Accent  → Surfaces/AccentLowContrast bg,          Typography/Accent text

export type BadgeSize = "tiny" | "sm" | "number" | "md";
export type BadgeType = "brand" | "success" | "error" | "accent";

export interface BadgeProps {
  size?: BadgeSize;
  type?: BadgeType;
  subtle?: boolean;
  label?: string | number;
  className?: string;
}

// ─── Variant Config ───────────────────────────────────────────────────────────

type BadgeColors = { bg: string; text: string };

const solidColors: Record<BadgeType, BadgeColors> = {
  brand:   { bg: "bg-[var(--surfaces-brand-interactive)]",  text: "text-[var(--typography-on-brand-primary)]" },
  success: { bg: "bg-[var(--surfaces-success-solid)]",      text: "text-[var(--typography-on-brand-primary)]" },
  error:   { bg: "bg-[var(--surfaces-error-solid)]",        text: "text-[var(--typography-on-brand-primary)]" },
  accent:  { bg: "bg-[var(--surfaces-accent-primary)]",     text: "text-[var(--typography-on-brand-primary)]" },
};

const subtleColors: Record<BadgeType, BadgeColors> = {
  brand:   { bg: "bg-[var(--surfaces-brand-interactive-low-contrast)]", text: "text-[var(--typography-brand)]" },
  success: { bg: "bg-[var(--surfaces-success-subtle)]",                 text: "text-[var(--typography-success)]" },
  error:   { bg: "bg-[var(--surfaces-error-subtle)]",                   text: "text-[var(--typography-error)]" },
  accent:  { bg: "bg-[var(--surfaces-accent-low-contrast)]",            text: "text-[var(--typography-accent)]" },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Badge({
  size = "md",
  type = "brand",
  subtle = false,
  label,
  className = "",
}: BadgeProps) {
  // Pick solid or subtle color set based on the subtle prop
  const colors = subtle ? subtleColors[type] : solidColors[type];

  // Tiny -- renders a small colored dot with no text; used for notification indicators
  if (size === "tiny") {
    return (
      <span
        aria-hidden="true"
        className={[
          "inline-block w-1 h-1 rounded-full flex-shrink-0",
          colors.bg,
          className,
        ].join(" ")}
      />
    );
  }

  // "md" size uses slightly taller height (16px vs 14px) and larger font token
  const isMd = size === "md";

  return (
    <span
      className={[
        "inline-flex items-center justify-center rounded-full flex-shrink-0",
        "select-none",
        // Height and padding
        isMd
          ? "h-4 px-1.5 min-w-[16px]"
          : "h-3.5 px-1 min-w-[14px]",
        // Font
        isMd
          ? "text-[length:var(--typography-badge-md-size)] leading-[var(--typography-badge-md-leading)] font-[var(--typography-badge-md-weight)]"
          : "text-[length:var(--typography-badge-sm-size)] leading-[var(--typography-badge-sm-leading)] font-[var(--typography-badge-sm-weight)]",
        colors.bg,
        colors.text,
        className,
      ].join(" ")}
    >
      {label !== undefined && label !== null ? String(label) : ""}
    </span>
  );
}
