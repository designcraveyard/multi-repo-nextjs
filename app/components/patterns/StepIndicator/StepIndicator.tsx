// StepIndicator.tsx
// Figma source: bubbles-kit › node 108:9891 "StepIndicator"
//
// 12×12 circular dot that represents a single step in a timeline.
//   Completed=OFF — hollow circle with --border-default stroke
//   Completed=ON  — filled --surfaces-success-solid circle with a white checkmark
//
// Usage:
//   <StepIndicator />               // incomplete
//   <StepIndicator completed />     // done

import { Icon } from "@/app/components/icons";

// --- Types ───────────────────────────────────────────────────────────────────

export interface StepIndicatorProps {
  /** Whether this step has been completed. Default: false */
  completed?: boolean;
}

// --- Render ──────────────────────────────────────────────────────────────────

/**
 * A 12x12 circular dot representing a single step in a timeline.
 *
 * - Incomplete: hollow circle with `--border-default` stroke.
 * - Completed: filled `--surfaces-success-solid` circle with a white checkmark icon.
 *
 * Used as a building block inside the Stepper pattern component.
 */
export function StepIndicator({ completed = false }: StepIndicatorProps) {
  if (completed) {
    return (
      <div
        aria-label="Step completed"
        className={[
          "w-3 h-3 rounded-full flex-shrink-0",
          "flex items-center justify-center",
          "bg-[var(--surfaces-success-solid)]",
        ].join(" ")}
      >
        <Icon
          name="Check"
          weight="bold"
          size={8}
          color="var(--icons-white)"
          label=""
        />
      </div>
    );
  }

  return (
    <div
      aria-label="Step incomplete"
      className={[
        "w-3 h-3 rounded-full flex-shrink-0",
        "border border-[var(--border-default)]",
        "bg-transparent",
      ].join(" ")}
    />
  );
}
