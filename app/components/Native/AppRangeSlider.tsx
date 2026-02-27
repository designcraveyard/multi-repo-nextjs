"use client";

import { Slider } from "@/components/ui/slider";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppRangeSlider everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.
//
// Note: If CSS custom property overrides don't apply in Tailwind v4,
// add these rules to globals.css and add className="native-range-slider" to
// the outer div:
//   .native-range-slider [data-slot="slider-track"]  { background: var(--slider-track-color); }
//   .native-range-slider [data-slot="slider-range"]  { background: var(--slider-range-color); }
//   .native-range-slider [data-slot="slider-thumb"]  { background: var(--slider-thumb-color);
//                                                      border: 2px solid var(--slider-thumb-border); }

const styling = {
  colors: {
    // Filled track segment between the two thumbs
    trackActive:     "var(--surfaces-brand-interactive)",
    // Unfilled track (outside the thumb range)
    trackBackground: "var(--surfaces-base-low-contrast)",
    // Thumb circle fill — brand color matching iOS surfacesBrandInteractive
    thumb:       "var(--surfaces-brand-interactive)",
    // Thumb border / shadow ring
    thumbBorder: "var(--border-default)",
    // Optional min/max label text
    label:           "var(--typography-muted)",
  },
  layout: {
    // Height of the slider track bar
    trackHeight:  "4px",
    // Corner radius of track ends (pill)
    trackRadius:  "var(--radius-full)",
    // Total height of the component (≥44px for tap accessibility)
    totalHeight:  "44px",
    // Thumb circle diameter
    thumbSize:    "20px",
    // Gap between track and min/max labels
    labelSpacing: "var(--space-1)",
  },
  typography: {
    label: "var(--typography-caption-sm-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppRangeSliderProps {
  /** Lower bound of the selected range */
  lowerValue: number;
  /** Upper bound of the selected range */
  upperValue: number;
  /** Called when either thumb moves — receives [lower, upper] */
  onChange: (values: [number, number]) => void;
  /** Absolute min and max of the track [min, max] */
  range?: [number, number];
  /** Step increment */
  step?: number;
  /** When true, renders min/max labels below the track */
  showLabels?: boolean;
  /** Additional CSS class for the wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A dual-thumb range slider for selecting a numeric interval.
 *
 * Wraps shadcn Slider (Radix) with `value={[lower, upper]}` for native
 * dual-thumb behavior. Design tokens are injected via CSS custom properties
 * (`--slider-track-color`, `--slider-range-color`, etc.) to override
 * shadcn defaults.
 *
 * A `pointerdown` handler sets `document.body.style.cursor = "grabbing"`
 * for the drag duration, because Radix captures the pointer away from the
 * thumb element, causing `:active` cursor styles to drop mid-drag.
 *
 * Cross-platform counterpart: `AppRangeSlider` on iOS (dual `Slider` wrapper).
 */
export function AppRangeSlider({
  lowerValue,
  upperValue,
  onChange,
  range = [0, 100],
  step = 1,
  showLabels = false,
  className = "",
}: AppRangeSliderProps) {
  const [min, max] = range;

  return (
    <div
      className={`flex flex-col native-range-slider ${className}`}
      style={{ gap: styling.layout.labelSpacing }}
    >
      {/*
        Radix Slider supports multiple thumbs natively via value arrays.
        value={[lower, upper]} + onValueChange gives us the dual-thumb range behavior.
      */}
      <div
        style={{
          height:      styling.layout.totalHeight,
          display:     "flex",
          alignItems:  "center",
        }}
      >
        <Slider
          value={[lowerValue, upperValue]}
          onValueChange={([lower, upper]) => onChange([lower, upper])}
          min={min}
          max={max}
          step={step}
          // Override shadcn's CSS custom properties with our design tokens
          style={
            {
              "--slider-track-color":  styling.colors.trackBackground,
              "--slider-range-color":  styling.colors.trackActive,
              "--slider-thumb-color":  styling.colors.thumb,
              "--slider-thumb-border": styling.colors.thumbBorder,
            } as React.CSSProperties
          }
          className="w-full"
          // active:cursor-grabbing on the thumb alone fails during a drag — once Radix
          // captures the pointer and moves away from the thumb element, the browser drops
          // :active on that element and the cursor reverts. Setting it on document.body for
          // the drag duration wins everywhere regardless of where the pointer is.
          onPointerDown={() => {
            document.body.style.cursor = "grabbing";
            const release = () => {
              document.body.style.cursor = "";
              document.removeEventListener("pointerup", release);
            };
            document.addEventListener("pointerup", release);
          }}
        />
      </div>

      {showLabels && (
        <div
          className="flex justify-between"
          style={{
            color:    styling.colors.label,
            fontSize: styling.typography.label,
          }}
        >
          <span>{min}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}
