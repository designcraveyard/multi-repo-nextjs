// TextBlock.tsx
// Figma source: bubbles-kit › node 84:789 "TextBlock"
//
// A vertical typography stack composing up to 5 optional text slots:
// overline → title → subtext → body → metadata
//
// Usage:
//   <TextBlock title="Ayurveda Books" subtext="bought for Anjali at airport" />
//   <TextBlock overline="RECENT" title="Trip to Bali" body="Some notes here" metadata="Posted 2d ago" />

// --- Types ───────────────────────────────────────────────────────────────────

export interface TextBlockProps {
  /** Overline label — Badge/Small style, all-caps, typography/muted */
  overline?: string;
  /** Primary title — Body/LargeEmphasized, typography/primary */
  title?: string;
  /** Secondary line below title — Body/Small, typography/muted */
  subtext?: string;
  /** Main body copy — Body/Medium, typography/secondary */
  body?: string;
  /** Trailing metadata line — Caption/Small, typography/muted */
  metadata?: string;
  className?: string;
}

// --- Render ──────────────────────────────────────────────────────────────────

/**
 * A vertical typography stack composing up to five optional text slots:
 * overline, title, subtext, body, and metadata.
 *
 * The header group (overline / title / subtext) uses a tighter inner gap
 * (`--space-1`), while body and metadata are separated by the outer gap
 * (`--space-2`). All typography tokens come from the semantic layer.
 *
 * This is a foundational pattern used by ListItem, Stepper, and other
 * composite components that need structured text layouts.
 */
export function TextBlock({
  overline,
  title,
  subtext,
  body,
  metadata,
  className = "",
}: TextBlockProps) {
  const hasHeader = overline || title || subtext;

  return (
    <div
      className={[
        "flex flex-col gap-[var(--space-2)] items-start w-full",
        className,
      ].join(" ")}
    >
      {/* Header stack: overline / title / subtext — tighter inner gap */}
      {hasHeader && (
        <div className="flex flex-col gap-[var(--space-1)] items-start w-full">
          {overline && (
            <p
              className={[
                "w-full uppercase",
                "text-[length:var(--typography-overline-sm-size)]",
                "leading-[var(--typography-overline-sm-leading)]",
                "font-[var(--typography-overline-sm-weight)]",
                "tracking-[var(--typography-overline-sm-tracking)]",
                "text-[var(--typography-muted)]",
              ].join(" ")}
            >
              {overline}
            </p>
          )}

          {title && (
            <p
              className={[
                "w-full",
                "text-[length:var(--typography-body-lg-em-size)]",
                "leading-[var(--typography-body-lg-em-leading)]",
                "font-[var(--typography-body-lg-em-weight)]",
                "text-[var(--typography-primary)]",
              ].join(" ")}
            >
              {title}
            </p>
          )}

          {subtext && (
            <p
              className={[
                "w-full",
                "text-[length:var(--typography-body-sm-size)]",
                "leading-[var(--typography-body-sm-leading)]",
                "font-[var(--typography-body-sm-weight)]",
                "text-[var(--typography-muted)]",
              ].join(" ")}
            >
              {subtext}
            </p>
          )}
        </div>
      )}

      {/* Body copy */}
      {body && (
        <p
          className={[
            "w-full",
            "text-[length:var(--typography-body-md-size)]",
            "leading-[var(--typography-body-md-leading)]",
            "font-[var(--typography-body-md-weight)]",
            "text-[var(--typography-secondary)]",
          ].join(" ")}
        >
          {body}
        </p>
      )}

      {/* Metadata footnote */}
      {metadata && (
        <p
          className={[
            "w-full",
            "text-[length:var(--typography-caption-sm-size)]",
            "leading-[var(--typography-caption-sm-leading)]",
            "font-[var(--typography-caption-sm-weight)]",
            "text-[var(--typography-muted)]",
          ].join(" ")}
        >
          {metadata}
        </p>
      )}
    </div>
  );
}
