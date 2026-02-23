// AdaptiveSheet.tsx
// Adaptive presentation: bottom drawer on mobile, centered modal dialog on desktop.
//
// Usage:
//
//   <AdaptiveSheet
//     isPresented={open}
//     onClose={() => setOpen(false)}
//     title="Edit Profile"
//   >
//     <EditProfileContent />
//   </AdaptiveSheet>
//
//   // With snap points (mobile only — ignored on desktop):
//   <AdaptiveSheet
//     isPresented={open}
//     onClose={() => setOpen(false)}
//     title="Filters"
//     snapPoints={[0.4, 1]}
//   >
//     <FilterContent />
//   </AdaptiveSheet>
//
// On mobile (<768px): renders a vaul Drawer (bottom sheet, swipe-to-dismiss).
// On desktop (>=768px): renders a Radix Dialog (centered modal with overlay).
//
// Modal spec (desktop):
//   - Max width: 480px
//   - Corner radius: radius-xl token
//   - Background: surfaces-base-primary
//   - Scrim: 40% black overlay
//   - Close button top-right (X icon)

"use client";

import { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMediaQuery } from "@/app/components/Adaptive/useMediaQuery";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    background: "var(--surfaces-base-primary)",
    titleText:  "var(--typography-primary)",
    descText:   "var(--typography-secondary)",
  },
  layout: {
    // Drawer (mobile)
    drawerRadius:     "var(--radius-xl)",
    drawerPaddingX:   "var(--space-4)",
    drawerPaddingTop: "var(--space-3)",
    drawerPaddingBot: "var(--space-6)",
    // Dialog (desktop)
    dialogRadius:     "var(--radius-xl)",
    dialogPadding:    "var(--space-6)",
    dialogMaxWidth:   480,
  },
  typography: {
    title: "var(--typography-title-sm-size)",
    desc:  "var(--typography-body-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdaptiveSheetProps {
  /** Controls visibility */
  isPresented: boolean;
  /** Called when the sheet/modal requests to close */
  onClose: () => void;
  /** Sheet/modal content */
  children: ReactNode;
  /** Optional title */
  title?: string;
  /** Optional description below the title */
  description?: string;
  /**
   * Snap points as fractions (mobile drawer only — ignored on desktop).
   * Equivalent to iOS `presentationDetents`.
   */
  snapPoints?: number[];
  /** Additional CSS class */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdaptiveSheet({
  isPresented,
  onClose,
  children,
  title,
  description,
  snapPoints,
  className = "",
}: AdaptiveSheetProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // --- Desktop: centered Dialog modal ---
  if (isDesktop) {
    return (
      <Dialog open={isPresented} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className={`border-none ${className}`}
          style={{
            backgroundColor: styling.colors.background,
            borderRadius: styling.layout.dialogRadius,
            padding: styling.layout.dialogPadding,
            maxWidth: styling.layout.dialogMaxWidth,
            width: "90vw",
          }}
        >
          {(title || description) && (
            <DialogHeader>
              {title && (
                <DialogTitle
                  style={{
                    color: styling.colors.titleText,
                    fontSize: styling.typography.title,
                  }}
                >
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription
                  style={{
                    color: styling.colors.descText,
                    fontSize: styling.typography.desc,
                  }}
                >
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  // --- Mobile: bottom Drawer ---
  return (
    <Drawer
      open={isPresented}
      onOpenChange={(open) => !open && onClose()}
      snapPoints={snapPoints}
    >
      <DrawerContent
        className={className}
        style={{
          backgroundColor: styling.colors.background,
          borderTopLeftRadius: styling.layout.drawerRadius,
          borderTopRightRadius: styling.layout.drawerRadius,
          paddingLeft: styling.layout.drawerPaddingX,
          paddingRight: styling.layout.drawerPaddingX,
          paddingTop: styling.layout.drawerPaddingTop,
          paddingBottom: styling.layout.drawerPaddingBot,
        }}
      >
        {(title || description) && (
          <DrawerHeader className="px-0">
            {title && (
              <DrawerTitle
                style={{
                  color: styling.colors.titleText,
                  fontSize: styling.typography.title,
                }}
              >
                {title}
              </DrawerTitle>
            )}
            {description && (
              <DrawerDescription
                style={{
                  color: styling.colors.descText,
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
