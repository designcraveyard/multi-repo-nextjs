"use client";

import { ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppAlertPopup everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Dialog background surface
    background:         "var(--surfaces-base-primary)",
    // Title text
    titleText:          "var(--typography-primary)",
    // Message body text
    messageText:        "var(--typography-secondary)",
    // Standard (default) action button
    actionBg:           "var(--surfaces-brand-interactive)",
    actionText:         "var(--typography-on-brand-primary)",
    actionHoverBg:      "var(--surfaces-brand-interactive-hover)",
    // Destructive action — communicates a dangerous or irreversible operation
    destructiveBg:      "var(--surfaces-error-solid)",
    destructiveText:    "var(--typography-on-brand-primary)",
    destructiveHoverBg: "var(--surfaces-error-solid-hover)",
    // Cancel action — low visual weight
    cancelBg:           "var(--surfaces-base-low-contrast)",
    cancelText:         "var(--typography-primary)",
    cancelHoverBg:      "var(--surfaces-base-low-contrast-hover)",
  },
  layout: {
    radius:         "var(--radius-lg)",
    padding:        "var(--space-6)",
    gap:            "var(--space-3)",
    buttonRadius:   "var(--radius-md)",
    buttonPaddingX: "var(--space-4)",
    buttonPaddingY: "var(--space-2)",
  },
  typography: {
    title:   "var(--typography-title-sm-size)",
    message: "var(--typography-body-md-size)",
    button:  "var(--typography-cta-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type AlertButtonRole = "default" | "destructive" | "cancel";

export interface AlertButton {
  label: string;
  role?: AlertButtonRole;
  onPress?: () => void;
}

export interface AppAlertPopupProps {
  /** Controls dialog visibility */
  isPresented: boolean;
  /** Called when the dialog requests to close */
  onClose: () => void;
  /** Bold title at the top of the alert */
  title: string;
  /** Descriptive message below the title */
  message?: string;
  /** Up to two buttons — one primary action, one cancel */
  buttons?: AlertButton[];
  /** Additional CSS class for the dialog content panel */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Returns the visual token set for a button based on its semantic role
function resolveButtonColors(role: AlertButtonRole = "default"): {
  bg: string;
  text: string;
  hoverBg: string;
} {
  const map: Record<AlertButtonRole, { bg: string; text: string; hoverBg: string }> = {
    default:     { bg: styling.colors.actionBg,      text: styling.colors.actionText,      hoverBg: styling.colors.actionHoverBg },
    destructive: { bg: styling.colors.destructiveBg, text: styling.colors.destructiveText, hoverBg: styling.colors.destructiveHoverBg },
    cancel:      { bg: styling.colors.cancelBg,      text: styling.colors.cancelText,      hoverBg: styling.colors.cancelHoverBg },
  };
  return map[role];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppAlertPopup({
  isPresented,
  onClose,
  title,
  message,
  buttons = [{ label: "OK", role: "default" }],
  className = "",
}: AppAlertPopupProps) {
  return (
    <AlertDialog open={isPresented} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent
        className={className}
        style={{
          backgroundColor: styling.colors.background,
          borderRadius:    styling.layout.radius,
          padding:         styling.layout.padding,
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle
            style={{
              color:    styling.colors.titleText,
              fontSize: styling.typography.title,
            }}
          >
            {title}
          </AlertDialogTitle>

          {message && (
            <AlertDialogDescription
              style={{
                color:    styling.colors.messageText,
                fontSize: styling.typography.message,
              }}
            >
              {message}
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter style={{ gap: styling.layout.gap }}>
          {buttons.map((btn, i) => {
            const colors = resolveButtonColors(btn.role);
            const isCancel = btn.role === "cancel";

            const sharedStyle: React.CSSProperties = {
              backgroundColor: colors.bg,
              color:           colors.text,
              borderRadius:    styling.layout.buttonRadius,
              paddingLeft:     styling.layout.buttonPaddingX,
              paddingRight:    styling.layout.buttonPaddingX,
              paddingTop:      styling.layout.buttonPaddingY,
              paddingBottom:   styling.layout.buttonPaddingY,
              fontSize:        styling.typography.button,
              border:          "none",
            };

            // AlertDialogCancel closes without triggering an action;
            // AlertDialogAction closes and confirms the action.
            return isCancel ? (
              <AlertDialogCancel key={i} style={sharedStyle} onClick={btn.onPress}>
                {btn.label}
              </AlertDialogCancel>
            ) : (
              <AlertDialogAction key={i} style={sharedStyle} onClick={btn.onPress}>
                {btn.label}
              </AlertDialogAction>
            );
          })}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
