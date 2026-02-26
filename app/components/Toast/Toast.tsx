"use client";

import { useEffect, useCallback, ReactNode } from "react";
import { Icon } from "@/app/components/icons";

// ─── Types ────────────────────────────────────────────────────────────────────
//
// Figma: Toast Message (node 108:4229)
// Only the default variant is implemented.

export interface ToastProps {
  message: string;
  /** Visual variant — only "default" is currently implemented */
  variant?: "default" | "success" | "warning" | "error" | "info";
  /** Optional description / secondary line */
  description?: string;
  /** Optional action button label */
  actionLabel?: string;
  onAction?: () => void;
  /** Show dismiss (×) button */
  dismissible?: boolean;
  onDismiss?: () => void;
  /** Auto-dismiss after ms (0 = no auto-dismiss) */
  duration?: number;
  className?: string;
}

// ─── Variant Styles ──────────────────────────────────────────────────────────
//
// Matches iOS AppToast: all variants use InversePrimary bg, only the icon
// color differs per variant. Text is always InversePrimary/InverseSecondary.

type ToastVariant = "default" | "success" | "warning" | "error" | "info";

const variantStyles: Record<ToastVariant, { iconName: string; iconColor: string }> = {
  default: { iconName: "Info",             iconColor: "var(--icons-inverse-primary)" },
  info:    { iconName: "Info",             iconColor: "var(--icons-inverse-primary)" },
  success: { iconName: "CheckCircle",      iconColor: "var(--icons-success)" },
  warning: { iconName: "WarningCircle",    iconColor: "var(--icons-warning)" },
  error:   { iconName: "XCircle",          iconColor: "var(--icons-error)" },
};

const baseStyle = {
  wrapper: "bg-[var(--surfaces-inverse-primary)] border-transparent",
  textColor: "text-[var(--typography-inverse-primary)]",
  descColor: "text-[var(--typography-inverse-secondary)]",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Toast({
  message,
  variant = "default",
  description,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  duration = 0,
  className = "",
}: ToastProps) {
  const v = { ...baseStyle, ...variantStyles[variant] };

  const dismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(dismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, dismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={[
        "flex items-center gap-3 w-full",
        "pl-5 pr-3 py-3 rounded-full border",
        v.wrapper,
        className,
      ].join(" ")}
    >
      {/* Status icon — variant-specific color (matches iOS) */}
      <span className="flex-shrink-0 flex items-center justify-center" aria-hidden="true">
        <Icon name={v.iconName as any} size="sm" color={v.iconColor} weight="fill" />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={[
          "text-[length:var(--typography-body-sm-em-size)] leading-[var(--typography-body-sm-em-leading)] font-[var(--typography-body-sm-em-weight)]",
          baseStyle.textColor,
        ].join(" ")}>
          {message}
        </p>
        {description && (
          <p className={[
            "mt-0.5 text-[length:var(--typography-body-sm-size)] leading-[var(--typography-body-sm-leading)] font-[var(--typography-body-sm-weight)]",
            baseStyle.descColor,
          ].join(" ")}>
            {description}
          </p>
        )}
      </div>

      {/* Action pill button — matches iOS capsule with 20% opacity bg */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={[
            "flex-shrink-0 px-3 py-1 rounded-full cursor-pointer",
            "text-[length:var(--typography-cta-sm-size)] leading-[var(--typography-cta-sm-leading)] font-[var(--typography-cta-sm-weight)]",
            "bg-[var(--surfaces-base-primary)]/20 hover:bg-[var(--surfaces-base-primary)]/30 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
            baseStyle.textColor,
          ].join(" ")}
        >
          {actionLabel}
        </button>
      )}

      {/* Dismiss button */}
      {dismissible && (
        <button
          onClick={dismiss}
          aria-label="Dismiss notification"
          className={[
            "flex-shrink-0 p-1 rounded-full cursor-pointer",
            "opacity-60 hover:opacity-100 transition-opacity",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
            baseStyle.textColor,
          ].join(" ")}
        >
          <Icon name="X" size="sm" color="currentColor" />
        </button>
      )}
    </div>
  );
}

// ─── ToastContainer ───────────────────────────────────────────────────────────
// Utility wrapper that positions toasts in a corner of the viewport.

export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

const positionClasses: Record<ToastPosition, string> = {
  "top-left":       "top-4 left-4 items-start",
  "top-center":     "top-4 left-1/2 -translate-x-1/2 items-center",
  "top-right":      "top-4 right-4 items-end",
  "bottom-left":    "bottom-4 left-4 items-start",
  "bottom-center":  "bottom-4 left-1/2 -translate-x-1/2 items-center",
  "bottom-right":   "bottom-4 right-4 items-end",
};

export function ToastContainer({
  position = "bottom-right",
  children,
}: {
  position?: ToastPosition;
  children: ReactNode;
}) {
  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className={[
        "fixed z-50 flex flex-col gap-2 pointer-events-none",
        positionClasses[position],
      ].join(" ")}
    >
      <div className="pointer-events-auto flex flex-col gap-2">
        {children}
      </div>
    </div>
  );
}
