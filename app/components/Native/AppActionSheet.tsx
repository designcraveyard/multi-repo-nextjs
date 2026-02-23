"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppActionSheet everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Sheet background panel
    background:      "var(--surfaces-base-primary)",
    // Title text at the top of the sheet
    titleText:       "var(--typography-secondary)",
    // Optional message text below the title
    messageText:     "var(--typography-muted)",
    // Standard action label color
    actionText:      "var(--typography-brand)",
    // Destructive action label — red
    destructiveText: "var(--typography-error)",
    // Cancel button (separated at bottom)
    cancelText:      "var(--typography-brand)",
    cancelBg:        "var(--surfaces-base-primary)",
    // Thin divider between rows
    divider:         "var(--border-default)",
  },
  layout: {
    // Corner radius of the action group panel
    panelRadius:   "var(--radius-xl)",
    // Corner radius of the cancel button
    cancelRadius:  "var(--radius-xl)",
    itemPaddingX:  "var(--space-4)",
    itemPaddingY:  "var(--space-4)",
    // Gap between the action group and the cancel button
    cancelGap:     "var(--space-2)",
  },
  typography: {
    title:        "var(--typography-caption-md-size)",
    message:      "var(--typography-caption-md-size)",
    action:       "var(--typography-body-lg-size)",
    actionWeight: "400",
    cancel:       "var(--typography-body-lg-size)",
    cancelWeight: "600",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ActionRole = "default" | "destructive" | "cancel";

export interface AppActionSheetAction {
  label: string;
  role?: ActionRole;
  onPress?: () => void;
}

export interface AppActionSheetProps {
  /** Controls sheet visibility */
  isPresented: boolean;
  /** Called when the sheet requests to close */
  onClose: () => void;
  /** Bold title at the top of the sheet (iOS uses caption style) */
  title?: string;
  /** Optional descriptive message below the title */
  message?: string;
  /** List of actions — cancel role is separated at the bottom */
  actions: AppActionSheetAction[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppActionSheet({
  isPresented,
  onClose,
  title,
  message,
  actions,
}: AppActionSheetProps) {
  // Split cancel action from the rest — iOS always renders cancel separately
  const cancelAction = actions.find((a) => a.role === "cancel");
  const mainActions  = actions.filter((a) => a.role !== "cancel");

  function handleAction(action: AppActionSheetAction) {
    action.onPress?.();
    onClose();
  }

  return (
    <AlertDialog open={isPresented} onOpenChange={(open) => !open && onClose()}>
      {/* Render as a bottom sheet: position fixed to bottom, full-width on mobile */}
      <AlertDialogContent
        className="fixed bottom-4 left-4 right-4 w-auto max-w-sm mx-auto p-0 border-none shadow-lg"
        style={{ borderRadius: styling.layout.panelRadius }}
      >
        {/* Main actions group */}
        <div
          style={{
            backgroundColor: styling.colors.background,
            borderRadius:    styling.layout.panelRadius,
            overflow:        "hidden",
          }}
        >
          {/* Optional title + message header */}
          {(title || message) && (
            <AlertDialogHeader
              className="text-center border-b"
              style={{
                borderColor:   styling.colors.divider,
                paddingLeft:   styling.layout.itemPaddingX,
                paddingRight:  styling.layout.itemPaddingX,
                paddingTop:    styling.layout.itemPaddingY,
                paddingBottom: styling.layout.itemPaddingY,
              }}
            >
              {title && (
                <AlertDialogTitle
                  style={{
                    color:      styling.colors.titleText,
                    fontSize:   styling.typography.title,
                    fontWeight: "400",
                  }}
                >
                  {title}
                </AlertDialogTitle>
              )}
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
          )}

          {/* Action rows with dividers between them */}
          {mainActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleAction(action)}
              className="w-full text-center transition-colors"
              style={{
                color:         action.role === "destructive"
                                 ? styling.colors.destructiveText
                                 : styling.colors.actionText,
                fontSize:      styling.typography.action,
                fontWeight:    styling.typography.actionWeight,
                paddingLeft:   styling.layout.itemPaddingX,
                paddingRight:  styling.layout.itemPaddingX,
                paddingTop:    styling.layout.itemPaddingY,
                paddingBottom: styling.layout.itemPaddingY,
                // First row has no top border when there's no header
                borderTop:     i === 0 && !title && !message
                                 ? "none"
                                 : `1px solid ${styling.colors.divider}`,
                background:    "transparent",
                cursor:        "pointer",
              }}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Cancel button — separate panel below, matches iOS layout */}
        {cancelAction && (
          <button
            onClick={() => handleAction(cancelAction)}
            className="w-full text-center transition-colors"
            style={{
              marginTop:       styling.layout.cancelGap,
              backgroundColor: styling.colors.cancelBg,
              color:           styling.colors.cancelText,
              fontSize:        styling.typography.cancel,
              fontWeight:      styling.typography.cancelWeight,
              borderRadius:    styling.layout.cancelRadius,
              paddingTop:      styling.layout.itemPaddingY,
              paddingBottom:   styling.layout.itemPaddingY,
              cursor:          "pointer",
              border:          "none",
            }}
          >
            {cancelAction.label}
          </button>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
