"use client";

import { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppBottomSheet everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Sheet background surface
    background:    "var(--surfaces-base-primary)",
    // Drag indicator pill color
    dragIndicator: "var(--border-default)",
    // Optional title text
    titleText:     "var(--typography-primary)",
    // Optional description text
    descText:      "var(--typography-secondary)",
  },
  layout: {
    // Corner radius of the sheet's top corners
    cornerRadius:    "var(--radius-xl)",
    // Inner horizontal padding around sheet content
    paddingX:        "var(--space-4)",
    // Top padding below the drag indicator
    paddingTop:      "var(--space-3)",
    // Bottom safe-area padding
    paddingBottom:   "var(--space-6)",
    // Width and height of the drag indicator pill
    indicatorW:      "32px",
    indicatorH:      "4px",
    indicatorRadius: "var(--radius-full)",
  },
  typography: {
    title: "var(--typography-title-sm-size)",
    desc:  "var(--typography-body-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppBottomSheetProps {
  /** Controls sheet visibility */
  isPresented: boolean;
  /** Called when the sheet requests to close (swipe down or backdrop tap) */
  onClose: () => void;
  /** Sheet content */
  children: ReactNode;
  /** Optional title displayed in the sheet header */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /**
   * Snap points as fractions of screen height (e.g. [0.5, 1] = medium + full).
   * Equivalent to iOS `presentationDetents`.
   */
  snapPoints?: number[];
  /** Additional CSS class for the content panel */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppBottomSheet({
  isPresented,
  onClose,
  children,
  title,
  description,
  snapPoints,
  className = "",
}: AppBottomSheetProps) {
  return (
    <Drawer
      open={isPresented}
      onOpenChange={(open) => !open && onClose()}
      // vaul snap points: array of fractions (0–1) or pixel heights
      snapPoints={snapPoints}
    >
      <DrawerContent
        className={className}
        style={{
          backgroundColor:      styling.colors.background,
          borderTopLeftRadius:  styling.layout.cornerRadius,
          borderTopRightRadius: styling.layout.cornerRadius,
          paddingLeft:          styling.layout.paddingX,
          paddingRight:         styling.layout.paddingX,
          paddingTop:           styling.layout.paddingTop,
          paddingBottom:        styling.layout.paddingBottom,
        }}
      >
        {/* Drag indicator pill — always visible, matches iOS grabber */}
        <div
          aria-hidden="true"
          className="mx-auto"
          style={{
            width:           styling.layout.indicatorW,
            height:          styling.layout.indicatorH,
            backgroundColor: styling.colors.dragIndicator,
            borderRadius:    styling.layout.indicatorRadius,
            marginBottom:    styling.layout.paddingTop,
          }}
        />

        {/* Optional header */}
        {(title || description) && (
          <DrawerHeader className="px-0">
            {title && (
              <DrawerTitle
                style={{
                  color:    styling.colors.titleText,
                  fontSize: styling.typography.title,
                }}
              >
                {title}
              </DrawerTitle>
            )}
            {description && (
              <DrawerDescription
                style={{
                  color:    styling.colors.descText,
                  fontSize: styling.typography.desc,
                }}
              >
                {description}
              </DrawerDescription>
            )}
          </DrawerHeader>
        )}

        {children}
      </DrawerContent>
    </Drawer>
  );
}
