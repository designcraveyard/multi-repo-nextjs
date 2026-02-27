/**
 * Divider -- horizontal or vertical separator from the bubbles-kit design system.
 *
 * Renders a visual divider between content sections or list rows. Supports
 * horizontal/vertical orientations and an optional centered label (section
 * type, horizontal only).
 *
 * @type "section" -- thicker, higher-contrast divider for separating page sections
 * @type "row"     -- hairline separator for list/table rows (default)
 *
 * @orientation "horizontal" -- full-width line (default)
 * @orientation "vertical"   -- self-stretching inline line for column separation
 *
 * @prop label -- centered text label that splits the divider line (horizontal section only)
 *
 * Figma source: bubbles-kit node 95:2092 (Divider component set)
 */

// ─── Types ────────────────────────────────────────────────────────────────────
//
// Figma: Divider (node 95:2092)
// Axes: Type(SectionDivider/RowDivider) = 2
//
// SectionDivider — full-width horizontal rule used between page sections, thicker visual weight
// RowDivider     — subtle horizontal separator used between list/table rows, hairline

export type DividerType = "section" | "row";
export type DividerOrientation = "horizontal" | "vertical";

export interface DividerProps {
  type?: DividerType;
  orientation?: DividerOrientation;
  /** Optional label text centered in the divider (section type only, horizontal) */
  label?: string;
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Divider({
  type = "row",
  orientation = "horizontal",
  label,
  className = "",
}: DividerProps) {
  const isSection = type === "section";
  const isVertical = orientation === "vertical";

  // Vertical divider -- simple self-stretching line; section uses border-default, row uses border-muted
  if (isVertical) {
    return (
      <span
        role="separator"
        aria-orientation="vertical"
        className={[
          "inline-block self-stretch",
          isSection ? "w-px bg-[var(--border-default)]" : "w-px bg-[var(--border-muted)]",
          className,
        ].join(" ")}
      />
    );
  }

  // Horizontal with label -- two flex-1 lines flanking centered text
  if (label) {
    const lineClass = isSection
      ? "bg-[var(--border-default)]"
      : "bg-[var(--border-muted)]";
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={["flex items-center gap-3", className].join(" ")}
      >
        <span className={["flex-1 h-px", lineClass].join(" ")} />
        <span className="text-[length:var(--typography-caption-sm-size)] leading-[var(--typography-caption-sm-leading)] font-[var(--typography-caption-sm-weight)] text-[var(--typography-muted)] whitespace-nowrap">
          {label}
        </span>
        <span className={["flex-1 h-px", lineClass].join(" ")} />
      </div>
    );
  }

  // Plain horizontal divider -- section type renders 8px tall bar, row renders 1px hairline
  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={[
        "border-0 w-full",
        isSection
          ? "h-2 bg-[var(--border-default)]"
          : "h-px bg-[var(--border-muted)]",
        className,
      ].join(" ")}
    />
  );
}
