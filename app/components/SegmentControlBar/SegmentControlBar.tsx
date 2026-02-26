"use client";

import { useState, useRef, useLayoutEffect, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
//
// Figma: SegmentControlBar (node 81:637)
// Axes: Size(Small/Medium/Large) × Type(SegmentControl/Chips/Filters) = 9
//
// SegmentControl — pill container, sliding bg indicator, single-select
// Chips          — row of ChipTab chips (borderless pills), single-select
// Filters        — row of Filters chips (bordered pills), multi-select

export type SegmentBarType = "segmentControl" | "chips" | "filters";
export type SegmentBarSize = "sm" | "md" | "lg";

export interface SegmentItem {
  id: string;
  label: string;
}

export interface SegmentControlBarProps {
  items: SegmentItem[];
  type?: SegmentBarType;
  size?: SegmentBarSize;
  /** Selected item(s). Single string for segmentControl/chips; string[] for filters. */
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  className?: string;
}

// ─── Size Config ──────────────────────────────────────────────────────────────

const sizeStyles: Record<SegmentBarSize, { tab: string; label: string; indicatorOffset: number }> = {
  sm: {
    tab: "px-2 py-1",
    label: "text-[length:var(--typography-cta-sm-size)] leading-[var(--typography-cta-sm-leading)] font-[var(--typography-cta-sm-weight)]",
    indicatorOffset: 4, // padding inside the bar container
  },
  md: {
    tab: "px-3 py-1.5",
    label: "text-[length:var(--typography-cta-md-size)] leading-[var(--typography-cta-md-leading)] font-[var(--typography-cta-md-weight)]",
    indicatorOffset: 4,
  },
  lg: {
    tab: "px-4 py-2",
    label: "text-[length:var(--typography-cta-lg-size)] leading-[var(--typography-cta-lg-leading)] font-[var(--typography-cta-lg-weight)]",
    indicatorOffset: 4,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function SegmentControlBar({
  items,
  type = "segmentControl",
  size = "md",
  value: controlledValue,
  defaultValue,
  onChange,
  className = "",
}: SegmentControlBarProps) {
  const isMulti = type === "filters";
  const isControlled = controlledValue !== undefined;

  const [internalValue, setInternalValue] = useState<string | string[]>(() => {
    if (defaultValue !== undefined) return defaultValue;
    if (isMulti) return [];
    return items[0]?.id ?? "";
  });

  const activeValue = isControlled ? controlledValue : internalValue;

  const s = sizeStyles[size];
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const [thumbStyle, setThumbStyle] = useState({ left: 0, width: 0 });

  const isActive = (id: string) => {
    if (Array.isArray(activeValue)) return activeValue.includes(id);
    return activeValue === id;
  };

  const handleSelect = (id: string) => {
    let next: string | string[];
    if (isMulti) {
      const arr = Array.isArray(activeValue) ? activeValue : [];
      next = arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id];
    } else {
      next = id;
    }
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
  };

  // Sliding thumb for SegmentControl type
  const updateThumb = () => {
    if (type !== "segmentControl") return;
    const activeId = Array.isArray(activeValue) ? activeValue[0] : activeValue;
    const el = tabRefs.current.get(activeId);
    const container = containerRef.current;
    if (!el || !container) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setThumbStyle({
      left: elRect.left - containerRect.left,
      width: elRect.width,
    });
  };

  useLayoutEffect(() => { updateThumb(); }, [activeValue, type]);
  useEffect(() => {
    const observer = new ResizeObserver(updateThumb);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Render as a pill container (SegmentControl) or flat row (Chips/Filters)
  const isSegment = type === "segmentControl";

  return (
    <div
      ref={containerRef}
      role={isMulti ? "group" : "radiogroup"}
      className={[
        "relative flex items-center",
        isSegment
          ? "px-1 py-0.5 bg-[var(--surfaces-base-low-contrast)] rounded-full"
          : "inline-flex gap-2",
        className,
      ].join(" ")}
    >
      {/* Sliding thumb — SegmentControl only */}
      {isSegment && (
        <span
          aria-hidden="true"
          className="absolute segment-thumb rounded-full shadow-sm transition-[left,width] duration-200 ease-out pointer-events-none"
          style={{
            left: thumbStyle.left,
            width: thumbStyle.width,
            top: 4,
            bottom: 4,
          }}
        />
      )}

      {items.map((item) => {
        const active = isActive(item.id);
        return (
          <button
            key={item.id}
            role={isMulti ? "checkbox" : "radio"}
            aria-checked={active}
            ref={(el) => {
              if (el) tabRefs.current.set(item.id, el);
              else tabRefs.current.delete(item.id);
            }}
            onClick={() => handleSelect(item.id)}
            className={[
              "relative z-10 inline-flex items-center justify-center",
              isSegment ? "flex-1" : "",
              "select-none whitespace-nowrap cursor-pointer",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)] focus-visible:ring-inset",
              s.tab,
              isSegment
                ? [
                    "rounded-full",
                    active
                      ? "text-[var(--typography-primary)]"
                      : "text-[var(--typography-secondary)] hover:text-[var(--typography-primary)]",
                  ].join(" ")
                : type === "filters"
                ? [
                    "rounded-full border",
                    active
                      ? "bg-[var(--surfaces-base-primary)] text-[var(--typography-primary)] border-[var(--border-active)]"
                      : "bg-[var(--surfaces-base-primary)] border-[var(--border-default)] text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)]",
                  ].join(" ")
                : // chips (chipTabs)
                  [
                    "rounded-full",
                    active
                      ? "bg-[var(--surfaces-base-low-contrast-pressed)] text-[var(--typography-primary)]"
                      : "bg-[var(--surfaces-base-low-contrast)] text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast-pressed)]",
                  ].join(" "),
            ].join(" ")}
          >
            <span className={s.label}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
