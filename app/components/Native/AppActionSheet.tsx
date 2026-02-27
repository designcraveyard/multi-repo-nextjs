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
    // Thin divider between rows — border-default per design rules
    divider:         "var(--border-default)",
    // Action row hover background
    actionHoverBg:   "var(--surfaces-base-primary-hover)",
  },
  layout: {
    // Corner radius of the action group panel
    panelRadius:  "var(--radius-xl)",
    // Corner radius of the cancel button
    cancelRadius: "var(--radius-xl)",
    itemPaddingX: "var(--space-4)",
    itemPaddingY: "var(--space-4)",
    // Gap between the action group and the cancel button
    cancelGap:    "var(--space-2)",
    // Max width of the sheet panel — centered on screen
    maxWidth:     "380px",
  },
  typography: {
    title:         "var(--typography-body-md-em-size)",
    titleWeight:   "var(--typography-body-md-em-weight)",
    titleLeading:  "var(--typography-body-md-em-leading)",
    message:       "var(--typography-caption-md-size)",
    messageLeading:"var(--typography-caption-md-leading)",
    action:        "var(--typography-body-lg-size)",
    actionWeight:  "400",
    cancel:        "var(--typography-body-lg-size)",
    cancelWeight:  "600",
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

/**
 * An iOS-style action sheet presenting a list of actions with an optional
 * title and message, plus a visually separated cancel button at the bottom.
 *
 * Built on shadcn AlertDialog (Radix). The cancel action is automatically
 * split from the main actions and rendered in its own rounded panel below
 * the action group, matching the native iOS `UIAlertController.Style.actionSheet`
 * appearance. Action rows include dividers and hover/pressed states.
 *
 * Cross-platform counterpart: `AppActionSheet` on iOS (`.appActionSheet` modifier).
 */
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
      {/*
        AlertDialogContent centers by default (Radix Dialog primitive uses
        fixed + translate-x/y centering). We constrain width and remove the
        shadcn border so only our panel radius and background are visible.
        No explicit bottom/top positioning — the dialog is centered on screen.
      */}
      <AlertDialogContent
        className="w-full border-none shadow-lg p-0"
        style={{
          maxWidth: styling.layout.maxWidth,
          // The outer AlertDialogContent is the transparent wrapper;
          // no radius here — the inner panels define their own shapes.
          borderRadius: 0,
          background:   "transparent",
        }}
      >
        {/* Main actions group — rounded panel with overflow-hidden to clip rows */}
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
                    fontWeight: styling.typography.titleWeight,
                    lineHeight: styling.typography.titleLeading,
                  }}
                >
                  {title}
                </AlertDialogTitle>
              )}
              {message && (
                <AlertDialogDescription
                  style={{
                    color:      styling.colors.messageText,
                    fontSize:   styling.typography.message,
                    lineHeight: styling.typography.messageLeading,
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
              className="w-full text-center transition-colors hover:bg-[var(--surfaces-base-primary-hover)] active:bg-[var(--surfaces-base-primary-pressed)] cursor-pointer"
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
                borderTop:     i === 0 && !title && !message
                                 ? "none"
                                 : `1px solid ${styling.colors.divider}`,
              }}
            >
              {action.label}
            </button>
          ))}
        </div>

        {/* Cancel button — separate rounded panel below, matches iOS layout */}
        {cancelAction && (
          <button
            onClick={() => handleAction(cancelAction)}
            className="w-full text-center transition-colors hover:bg-[var(--surfaces-base-primary-hover)] active:bg-[var(--surfaces-base-primary-pressed)] cursor-pointer"
            style={{
              marginTop:       styling.layout.cancelGap,
              backgroundColor: styling.colors.cancelBg,
              color:           styling.colors.cancelText,
              fontSize:        styling.typography.cancel,
              fontWeight:      styling.typography.cancelWeight,
              borderRadius:    styling.layout.cancelRadius,
              paddingTop:      styling.layout.itemPaddingY,
              paddingBottom:   styling.layout.itemPaddingY,
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
