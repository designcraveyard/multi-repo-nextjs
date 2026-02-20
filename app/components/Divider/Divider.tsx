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

  // Vertical divider — simple line
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

  // Horizontal with label
  if (label) {
    const lineClass = isSection
      ? "bg-[var(--surfaces-base-low-contrast)]"
      : "bg-[var(--surfaces-base-low-contrast-pressed)]";
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

  // Plain horizontal divider
  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={[
        "border-0 w-full",
        isSection
          ? "h-2 bg-[var(--surfaces-base-low-contrast)]"
          : "h-px bg-[var(--surfaces-base-low-contrast-pressed)]",
        className,
      ].join(" ")}
    />
  );
}
