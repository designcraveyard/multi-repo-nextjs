"use client";

import { useState, useRef, useEffect, useLayoutEffect, ReactNode, KeyboardEvent } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
//
// Figma: _Tabs (tab item, node 76:660) + Tabs (full bar, node 78:284)
// _Tabs axis: Size(Small/Medium/Large) × Active(Off/On) = 6
// The full Tabs component wraps a list of tab items with an animated sliding indicator.

export type TabSize = "sm" | "md" | "lg";

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultTab?: string;
  activeTab?: string;
  size?: TabSize;
  onChange?: (id: string) => void;
  className?: string;
}

// ─── Size Config ───────────────────────────────────────────────────────────────
//
// Figma _Tabs:
//   Small  → label: cta-sm (12px/600), py: 4px (space-1), px: 8px (space-2), gap: 4px
//   Medium → label: cta-md (14px/600), py: 8px (space-2), px: 12px (space-3), gap: 4px
//   Large  → label: cta-lg (16px/600), py: 8px (space-2), px: 16px (space-4), gap: 4px

const sizeStyles: Record<TabSize, { tab: string; label: string; iconSize: string; indicatorH: string }> = {
  sm: {
    tab: "px-2 py-1 gap-1",
    label: "text-[length:var(--typography-cta-sm-size)] leading-[var(--typography-cta-sm-leading)] font-[var(--typography-cta-sm-weight)]",
    iconSize: "w-4 h-4",
    indicatorH: "h-0.5",
  },
  md: {
    tab: "px-3 py-2 gap-1",
    label: "text-[length:var(--typography-cta-md-size)] leading-[var(--typography-cta-md-leading)] font-[var(--typography-cta-md-weight)]",
    iconSize: "w-4 h-4",
    indicatorH: "h-0.5",
  },
  lg: {
    tab: "px-4 py-2 gap-1",
    label: "text-[length:var(--typography-cta-lg-size)] leading-[var(--typography-cta-lg-leading)] font-[var(--typography-cta-lg-weight)]",
    iconSize: "w-5 h-5",
    indicatorH: "h-[2px]",
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function Tabs({
  items,
  defaultTab,
  activeTab: controlledActiveTab,
  size = "md",
  onChange,
  className = "",
}: TabsProps) {
  const isControlled = controlledActiveTab !== undefined;
  const [internalActive, setInternalActive] = useState<string>(defaultTab ?? items[0]?.id ?? "");
  const activeId = isControlled ? controlledActiveTab : internalActive;

  // Track each tab button's position for the sliding indicator
  const tabRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const s = sizeStyles[size];

  const updateIndicator = () => {
    const el = tabRefs.current.get(activeId);
    const container = containerRef.current;
    if (!el || !container) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setIndicatorStyle({
      left: elRect.left - containerRect.left,
      width: elRect.width,
    });
  };

  // Update on active tab change
  useLayoutEffect(() => {
    updateIndicator();
  }, [activeId]);

  // Update on resize
  useEffect(() => {
    const observer = new ResizeObserver(updateIndicator);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleSelect = (id: string) => {
    if (!isControlled) setInternalActive(id);
    onChange?.(id);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const ids = items.map((t) => t.id);
    if (e.key === "ArrowRight") {
      e.preventDefault();
      const next = (currentIndex + 1) % ids.length;
      tabRefs.current.get(ids[next])?.focus();
      handleSelect(ids[next]);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      const prev = (currentIndex - 1 + ids.length) % ids.length;
      tabRefs.current.get(ids[prev])?.focus();
      handleSelect(ids[prev]);
    } else if (e.key === "Home") {
      e.preventDefault();
      tabRefs.current.get(ids[0])?.focus();
      handleSelect(ids[0]);
    } else if (e.key === "End") {
      e.preventDefault();
      tabRefs.current.get(ids[ids.length - 1])?.focus();
      handleSelect(ids[ids.length - 1]);
    }
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={[
        "relative inline-flex items-end",
        "border-b border-[var(--border-default)]",
        className,
      ].join(" ")}
      ref={containerRef}
    >
      {/* Tab buttons */}
      {items.map((item, idx) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${item.id}`}
            id={`tab-${item.id}`}
            tabIndex={isActive ? 0 : -1}
            ref={(el) => {
              if (el) tabRefs.current.set(item.id, el);
              else tabRefs.current.delete(item.id);
            }}
            onClick={() => handleSelect(item.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={[
              "inline-flex items-center flex-shrink-0",
              "select-none whitespace-nowrap cursor-pointer",
              "transition-colors duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)] focus-visible:ring-inset",
              "rounded-t-sm",
              s.tab,
              isActive
                ? "text-[var(--typography-primary)]"
                : "text-[var(--typography-secondary)] hover:bg-[var(--surfaces-base-low-contrast)] hover:text-[var(--typography-primary)]",
            ].join(" ")}
          >
            {item.icon && (
              <span className={`${s.iconSize} flex-shrink-0`} aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className={s.label}>{item.label}</span>
          </button>
        );
      })}

      {/* Sliding indicator — animated via CSS transition */}
      <span
        aria-hidden="true"
        className={[
          "absolute bottom-0",
          "bg-[var(--surfaces-brand-interactive)]",
          "transition-[left,width] duration-200 ease-out",
          s.indicatorH,
        ].join(" ")}
        style={{
          left: indicatorStyle.left,
          width: indicatorStyle.width,
        }}
      />
    </div>
  );
}

// ─── TabPanel ─────────────────────────────────────────────────────────────────
// Companion component to associate content panels with tabs

export function TabPanel({
  id,
  activeTab,
  children,
  className = "",
}: {
  id: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="tabpanel"
      id={`tabpanel-${id}`}
      aria-labelledby={`tab-${id}`}
      hidden={id !== activeTab}
      className={className}
    >
      {children}
    </div>
  );
}
