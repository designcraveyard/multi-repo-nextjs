"use client";

import { Progress } from "@/components/ui/progress";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppProgressLoader everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Filled portion of the linear bar + spinner ring segment
    tint:  "var(--surfaces-brand-interactive)",
    // Unfilled track behind the linear bar
    track: "var(--surfaces-base-low-contrast)",
    // Optional label text below the loader
    label: "var(--typography-secondary)",
  },
  layout: {
    // Height of the linear progress bar track
    linearTrackHeight:  "6px",
    // Corner radius of the linear bar (pill ends)
    linearTrackRadius:  "var(--radius-full)",
    // Diameter of the circular spinner
    spinnerSize:        "24px",
    // Border width of the spinner ring
    spinnerBorderWidth: "3px",
    // Gap between loader and label text
    labelSpacing:       "var(--space-2)",
  },
  typography: {
    label:   "var(--typography-body-md-size)",
    leading: "var(--typography-body-md-leading)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProgressVariant =
  | { variant: "indefinite" }
  | { variant: "definite"; value: number; total?: number };

export type AppProgressLoaderProps = {
  /** Optional descriptive label shown below the loader */
  label?: string;
  /** Additional CSS class for the wrapper */
  className?: string;
} & ProgressVariant;

// ─── Component ────────────────────────────────────────────────────────────────

export function AppProgressLoader(props: AppProgressLoaderProps) {
  const { label, className = "" } = props;

  // Compute 0–100 percentage for the definite variant
  const percentage =
    props.variant === "definite"
      ? Math.min(100, Math.max(0, (props.value / (props.total ?? 100)) * 100))
      : null;

  return (
    <div
      className={`flex flex-col items-center ${className}`}
      style={{ gap: styling.layout.labelSpacing }}
    >
      {props.variant === "indefinite" ? (
        // Circular spinner — pure CSS, no extra dependency
        <span
          role="status"
          aria-label={label ?? "Loading"}
          className="animate-spin rounded-full"
          style={{
            width:       styling.layout.spinnerSize,
            height:      styling.layout.spinnerSize,
            borderWidth: styling.layout.spinnerBorderWidth,
            borderStyle: "solid",
            // Top segment = filled (brand color), remaining three sides = track
            borderColor: `${styling.colors.tint} ${styling.colors.track} ${styling.colors.track} ${styling.colors.track}`,
          }}
        />
      ) : (
        // Linear determinate bar via shadcn Progress
        <div
          style={{
            width:            "100%",
            height:           styling.layout.linearTrackHeight,
            borderRadius:     styling.layout.linearTrackRadius,
            backgroundColor:  styling.colors.track,
            overflow:         "hidden",
          }}
          role="progressbar"
          aria-valuenow={percentage ?? 0}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label ?? "Progress"}
        >
          <Progress
            value={percentage ?? 0}
            className="h-full rounded-full"
            // Override shadcn default indicator color with our brand token
            style={{ "--progress-foreground": styling.colors.tint } as React.CSSProperties}
          />
        </div>
      )}

      {label && (
        <span
          style={{
            color:      styling.colors.label,
            fontSize:   styling.typography.label,
            lineHeight: styling.typography.leading,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
