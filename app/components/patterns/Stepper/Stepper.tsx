// Stepper.tsx
// Figma source: bubbles-kit › node 108:4357 "TimelineStepper"
//
// A vertical timeline of steps, each composed of a StepIndicator dot + connecting
// line + TextBlock content. Display-only — no interaction, caller owns data.
//
// Usage:
//   <Stepper steps={[
//     { title: "Ordered", subtitle: "Mar 1", completed: true },
//     { title: "Shipped", completed: true },
//     { title: "Delivered", subtitle: "Arriving Mar 5" },
//   ]} />

import { StepIndicator } from "@/app/components/patterns/StepIndicator";
import { TextBlock } from "@/app/components/patterns/TextBlock";

// --- Types ───────────────────────────────────────────────────────────────────

export interface StepperStep {
  /** Primary step label (required) */
  title: string;
  /** Secondary line below title */
  subtitle?: string;
  /** Optional body copy for the step */
  body?: string;
  /** Whether this step has been completed */
  completed?: boolean;
}

export interface StepperProps {
  /** Ordered list of steps to render */
  steps: StepperStep[];
}

// --- Helpers ─────────────────────────────────────────────────────────────────

/** Left column: indicator dot + optional connector line to the next step */
function StepTrack({ completed, isLast }: { completed: boolean; isLast: boolean }) {
  return (
    <div className="flex flex-col items-center gap-[var(--space-2)] pt-[var(--space-2)] self-stretch w-3 flex-shrink-0">
      <StepIndicator completed={completed} />
      {!isLast && (
        <div
          aria-hidden="true"
          className="flex-1 w-0.5 min-h-0 rounded-full bg-[var(--surfaces-base-high-contrast)]"
        />
      )}
    </div>
  );
}

// --- Render ──────────────────────────────────────────────────────────────────

export function Stepper({ steps }: StepperProps) {
  if (steps.length === 0) return null;

  return (
    <div className="flex flex-col w-full">
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;

        return (
          <div
            key={index}
            className="flex gap-[var(--space-6)] items-start min-h-0"
          >
            <StepTrack completed={step.completed ?? false} isLast={isLast} />

            {/* Content — padded bottom to create visual separation between steps */}
            <div className={["flex-1 min-w-0", isLast ? "" : "pb-[var(--space-6)]"].join(" ")}>
              <TextBlock
                title={step.title}
                subtext={step.subtitle}
                body={step.body}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
