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

// ─── Default Toast Style ──────────────────────────────────────────────────────
//
// Surfaces/InversePrimary bg (dark theme)
// Typography/InversePrimary text color
// Info icon, rounded-full pill shape for default, action button on the right

const toastStyle = {
  wrapper: "bg-[var(--surfaces-inverse-primary)] border-transparent",
  iconName: "Info",
  iconColor: "var(--icons-inverse-primary)",
  textColor: "text-[var(--typography-inverse-primary)]",
  descColor: "text-[var(--typography-inverse-secondary)]",
  actionColor: "text-[var(--typography-inverse-primary)] underline",
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Toast({
  message,
  description,
  actionLabel,
  onAction,
  dismissible = false,
  onDismiss,
  duration = 0,
  className = "",
}: ToastProps) {
  const v = toastStyle;

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
      </div>

      {/* Action pill button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className={[
            "flex-shrink-0 px-3 py-1 rounded-full",
            "text-[length:var(--typography-cta-sm-size)] leading-[var(--typography-cta-sm-leading)] font-[var(--typography-cta-sm-weight)]",
            "bg-[var(--surfaces-base-primary)] opacity-90 hover:opacity-100 transition-opacity",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current",
            "text-[var(--typography-brand)]",
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
