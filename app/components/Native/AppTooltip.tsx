"use client";

import { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppTooltip everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Tooltip bubble background — high contrast so it reads over any content
    background: "var(--surfaces-inverse-primary)",
    // Text inside the bubble — must contrast with background
    text:       "var(--typography-inverse-primary)",
  },
  layout: {
    radius:    "var(--radius-sm)",
    paddingX:  "var(--space-3)",
    paddingY:  "var(--space-2)",
    maxWidth:  "240px",
    // Delay before the tooltip appears (ms) — 400ms is deliberate hover
    delayMs:   400,
  },
  typography: {
    size:    "var(--typography-body-sm-size)",
    leading: "var(--typography-body-sm-leading)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppTooltipProps {
  /** The element that triggers the tooltip on hover/focus */
  children: ReactNode;
  /** Plain text shown inside the tooltip bubble */
  tipText?: string;
  /** Custom content for the tooltip bubble — overrides tipText */
  tipContent?: ReactNode;
  /** Which side the bubble appears relative to the trigger */
  side?: "top" | "bottom" | "left" | "right";
  /** Controlled open state — omit for uncontrolled */
  open?: boolean;
  /** Called when open state changes (controlled mode) */
  onOpenChange?: (open: boolean) => void;
  /** Additional CSS class for the trigger wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * A hover/focus tooltip bubble wrapping shadcn Tooltip (Radix).
 *
 * Renders a high-contrast inverse-color bubble with either plain `tipText`
 * or custom `tipContent`. Supports controlled (`open` / `onOpenChange`) and
 * uncontrolled modes. A 400ms delay prevents accidental triggers.
 *
 * The `TooltipProvider` is included inline so each `AppTooltip` is
 * self-contained; nesting providers is idempotent and safe.
 *
 * Cross-platform counterpart: `AppTooltip` on iOS (`.appTooltip` popover modifier).
 */
export function AppTooltip({
  children,
  tipText,
  tipContent,
  side = "top",
  open,
  onOpenChange,
  className = "",
}: AppTooltipProps) {
  return (
    // TooltipProvider must wrap any Tooltip usage. Placing it here makes
    // AppTooltip self-contained. The provider is idempotent so nesting is safe.
    <TooltipProvider delayDuration={styling.layout.delayMs}>
      <Tooltip open={open} onOpenChange={onOpenChange}>
        <TooltipTrigger asChild className={`cursor-pointer ${className}`}>
          {children}
        </TooltipTrigger>

        <TooltipContent
          side={side}
          style={{
            backgroundColor: styling.colors.background,
            color:           styling.colors.text,
            borderRadius:    styling.layout.radius,
            paddingLeft:     styling.layout.paddingX,
            paddingRight:    styling.layout.paddingX,
            paddingTop:      styling.layout.paddingY,
            paddingBottom:   styling.layout.paddingY,
            maxWidth:        styling.layout.maxWidth,
            fontSize:        styling.typography.size,
            lineHeight:      styling.typography.leading,
            // Remove shadcn default border — only our bg is visible
            border:          "none",
          }}
        >
          {tipContent ?? tipText}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
