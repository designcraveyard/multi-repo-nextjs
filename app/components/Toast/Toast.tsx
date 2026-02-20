"use client";

import { useEffect, useCallback, ReactNode } from "react";
import { Icon } from "@/app/components/icons";

// ─── Types ────────────────────────────────────────────────────────────────────
//
// Figma: Toast Message (node 108:4229)
// Variants: Type(Default/Success/Warning/Error/Info) × has-action(off/on) × has-dismiss(off/on)

export type ToastVariant = "default" | "success" | "warning" | "error" | "info";

export interface ToastProps {
  variant?: ToastVariant;
  message: string;
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

// ─── Variant Config ───────────────────────────────────────────────────────────
//
// Default:  Surfaces/InversePrimary bg,  Typography/InversePrimary text
// Success:  Surfaces/SuccessSubtle  bg,  Typography/Success text, border-success
// Warning:  Surfaces/WarningSubtle  bg,  Typography/Warning text, border-warning
// Error:    Surfaces/ErrorSubtle    bg,  Typography/Error text,   border-error
// Info:     Surfaces/AccentLowContrast bg, Typography/Accent text, border-accent(indigo)

type ToastVariantStyle = {
  wrapper: string;
  iconName: string;
  iconColor: string;
  textColor: string;
  descColor: string;
  actionColor: string;
};

const variantStyles: Record<ToastVariant, ToastVariantStyle> = {
  default: {
    wrapper: "bg-[var(--surfaces-inverse-primary)] border-transparent",
    iconName: "Info",
    iconColor: "var(--icons-inverse-primary)",
    textColor: "text-[var(--typography-inverse-primary)]",
    descColor: "text-[var(--typography-inverse-secondary)]",
    actionColor: "text-[var(--typography-inverse-primary)] underline",
  },
  success: {
    wrapper: "bg-[var(--surfaces-success-subtle)] border-[var(--border-success)]",
    iconName: "CheckCircle",
    iconColor: "var(--icons-success)",
    textColor: "text-[var(--typography-success)]",
    descColor: "text-[var(--typography-success)]",
    actionColor: "text-[var(--typography-success)] underline",
  },
  warning: {
    wrapper: "bg-[var(--surfaces-warning-subtle)] border-[var(--border-warning)]",
    iconName: "Warning",
    iconColor: "var(--icons-warning)",
    textColor: "text-[var(--typography-warning)]",
    descColor: "text-[var(--typography-warning)]",
    actionColor: "text-[var(--typography-warning)] underline",
  },
  error: {
    wrapper: "bg-[var(--surfaces-error-subtle)] border-[var(--border-error)]",
    iconName: "XCircle",
    iconColor: "var(--icons-error)",
    textColor: "text-[var(--typography-error)]",
    descColor: "text-[var(--typography-error)]",
    actionColor: "text-[var(--typography-error)] underline",
  },
  info: {
    wrapper: "bg-[var(--surfaces-accent-low-contrast)] border-[var(--surfaces-accent-primary)]",
    iconName: "Info",
    iconColor: "var(--icons-accent)",
    textColor: "text-[var(--typography-accent)]",
    descColor: "text-[var(--typography-accent)]",
    actionColor: "text-[var(--typography-accent)] underline",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Toast({
  variant = "default",
  message,
  description,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  duration = 0,
  className = "",
}: ToastProps) {
  const v = variantStyles[variant];

  const dismiss = useCallback(() => {
    onDismiss?.();
  }, [onDismiss]);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(dismiss, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, dismiss]);

  const isDefault = variant === "default";

  return (
    <div
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={[
        "flex items-center gap-3 w-full",
        isDefault
          ? "pl-5 pr-3 py-3 rounded-full border"
          : "pl-4 pr-3 py-3 rounded-[var(--radius-md)] border shadow-md max-w-sm",
        v.wrapper,
        className,
      ].join(" ")}
    >
      {/* Status icon */}
      <span className="flex-shrink-0" aria-hidden="true">
        <Icon name={v.iconName as any} size="sm" color={v.iconColor} />
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={[
          "text-[length:var(--typography-body-sm-em-size)] leading-[var(--typography-body-sm-em-leading)] font-[var(--typography-body-sm-em-weight)]",
          v.textColor,
        ].join(" ")}>
          {message}
        </p>
        {description && (
          <p className={[
            "mt-0.5 text-[length:var(--typography-body-sm-size)] leading-[var(--typography-body-sm-leading)] font-[var(--typography-body-sm-weight)]",
            "opacity-80",
            v.descColor,
          ].join(" ")}>
            {description}
          </p>
        )}
        {!isDefault && actionLabel && onAction && (
          <button
            onClick={onAction}
            className={[
              "mt-1.5 text-[length:var(--typography-cta-sm-size)] leading-[var(--typography-cta-sm-leading)] font-[var(--typography-cta-sm-weight)]",
              "focus-visible:outline-none focus-visible:ring-1",
              v.actionColor,
            ].join(" ")}
          >
            {actionLabel}
          </button>
        )}
      </div>

      {/* Action pill button (default variant only) */}
      {isDefault && actionLabel && onAction && (
        <button
          onClick={onAction}
          className={[
            "flex-shrink-0 px-3 py-1 rounded-full",
            "text-[length:var(--typography-cta-sm-size)] leading-[var(--typography-cta-sm-leading)] font-[var(--typography-cta-sm-weight)]",
            "bg-[var(--surfaces-base-primary)] opacity-90 hover:opacity-100 transition-opacity",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
            v.textColor,
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
            "flex-shrink-0 p-1 rounded-full",
            "opacity-60 hover:opacity-100 transition-opacity",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
            v.textColor,
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
