// AdaptiveNavShell.tsx
// Adaptive navigation shell: bottom tabs on mobile, collapsible sidebar on desktop.
//
// Usage:
//
//   const tabs = [
//     { id: 0, label: "Home",     icon: "House" },
//     { id: 1, label: "Search",   icon: "MagnifyingGlass" },
//     { id: 2, label: "Settings", icon: "Gear" },
//   ];
//
//   <AdaptiveNavShell tabs={tabs} selectedTab={0} onTabChange={setTab}>
//     {tab === 0 && <HomePage />}
//     {tab === 1 && <SearchPage />}
//     {tab === 2 && <SettingsPage />}
//   </AdaptiveNavShell>
//
// On mobile (<768px): renders a bottom navigation bar with icon + label tabs.
// On desktop (>=768px): renders a collapsible icon-rail sidebar.
//
// Sidebar spec:
//   - Collapsed: 60px wide (icon only)
//   - Expanded: 240px wide (icon + label)
//   - Toggle button at the bottom of the sidebar
//   - Active tab highlighted with brand color
//   - Transition animated with CSS transition

"use client";

import { ReactNode, useState } from "react";
import { Icon } from "@/app/components/icons/Icon";
import type { IconProps } from "@/app/components/icons/Icon";

// ─── Styling Config ───────────────────────────────────────────────────────────

const styling = {
  colors: {
    sidebarBg:    "var(--surfaces-base-primary)",
    divider:      "var(--border-muted)",
    activeText:   "var(--surfaces-brand-interactive)",
    activeBg:     "var(--surfaces-brand-interactive)",
    inactiveText: "var(--typography-secondary)",
    bottomBarBg:  "var(--surfaces-base-primary)",
    badgeBg:      "var(--surfaces-brand-interactive)",
    badgeText:    "var(--typography-on-brand-primary)",
  },
  layout: {
    collapsedWidth:  60,
    expandedWidth:   240,
    itemHeight:      48,
    bottomBarHeight: 56,
    radius:          "var(--radius-md)",
  },
  spacing: {
    sidebarPaddingTop: "var(--space-6)",
    itemPaddingX:      "var(--space-4)",
    itemGap:           "var(--space-2)",
    badgePaddingX:     "var(--space-1)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface NavTab {
  /** Unique tab identifier (0-based) */
  id: number;
  /** Display label */
  label: string;
  /** Phosphor icon name (PascalCase, e.g. "House", "MagnifyingGlass") */
  icon: IconProps["name"];
  /** Filled icon variant for active state. Defaults to icon with weight="fill" */
  iconFill?: IconProps["name"];
  /** Numeric badge count. 0 or undefined hides the badge */
  badge?: number;
}

export interface AdaptiveNavShellProps {
  /** Tab definitions */
  tabs: NavTab[];
  /** Currently selected tab id */
  selectedTab: number;
  /** Called when user taps a tab */
  onTabChange: (tabId: number) => void;
  /** Page content (conditionally rendered based on selectedTab) */
  children: ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdaptiveNavShell({
  tabs,
  selectedTab,
  onTabChange,
  children,
}: AdaptiveNavShellProps) {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const sidebarWidth = isSidebarExpanded
    ? styling.layout.expandedWidth
    : styling.layout.collapsedWidth;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* --- Desktop Sidebar (hidden on mobile) --- */}
      <aside
        className="hidden md:flex flex-col flex-shrink-0"
        style={{
          width: sidebarWidth,
          backgroundColor: styling.colors.sidebarBg,
          borderRight: `1px solid ${styling.colors.divider}`,
          transition: "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
          paddingTop: styling.spacing.sidebarPaddingTop,
        }}
      >
        {/* --- Sidebar Tab Items --- */}
        <nav className="flex flex-col flex-1" role="navigation" aria-label="Main">
          {tabs.map((tab) => (
            <SidebarItem
              key={tab.id}
              tab={tab}
              isActive={selectedTab === tab.id}
              isExpanded={isSidebarExpanded}
              onClick={() => onTabChange(tab.id)}
            />
          ))}

          <div className="flex-1" />

          {/* --- Collapse/Expand Toggle --- */}
          <button
            onClick={() => setIsSidebarExpanded((prev) => !prev)}
            aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
            className="flex items-center justify-center mx-auto"
            style={{
              height: 44,
              width: "100%",
              color: styling.colors.inactiveText,
              marginBottom: "var(--space-2)",
            }}
          >
            <Icon
              name={isSidebarExpanded ? "SidebarSimple" : "List"}
              size="md"
              color="currentColor"
            />
          </button>
        </nav>
      </aside>

      {/* --- Main Content Area --- */}
      <main className="flex-1 min-w-0">
        {children}
      </main>

      {/* --- Mobile Bottom Nav (hidden on desktop) --- */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
        role="navigation"
        aria-label="Main"
        style={{
          height: styling.layout.bottomBarHeight,
          backgroundColor: styling.colors.bottomBarBg,
          borderTop: `1px solid ${styling.colors.divider}`,
        }}
      >
        {tabs.map((tab) => (
          <BottomTabItem
            key={tab.id}
            tab={tab}
            isActive={selectedTab === tab.id}
            onClick={() => onTabChange(tab.id)}
          />
        ))}
      </nav>

      {/* Bottom nav spacer (prevents content from hiding behind fixed nav on mobile) */}
      <div
        className="md:hidden"
        style={{ height: styling.layout.bottomBarHeight }}
        aria-hidden
      />
    </div>
  );
}

// ─── Sidebar Item ─────────────────────────────────────────────────────────────

function SidebarItem({
  tab,
  isActive,
  isExpanded,
  onClick,
}: {
  tab: NavTab;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
}) {
  const iconWeight = isActive ? "fill" : "regular";

  return (
    <button
      onClick={onClick}
      aria-label={tab.label}
      aria-current={isActive ? "page" : undefined}
      className="flex items-center text-left w-full"
      style={{
        height: styling.layout.itemHeight,
        paddingLeft: styling.spacing.itemPaddingX,
        paddingRight: styling.spacing.itemPaddingX,
        marginLeft: "var(--space-1)",
        marginRight: "var(--space-1)",
        gap: styling.spacing.itemGap,
        color: isActive ? styling.colors.activeText : styling.colors.inactiveText,
        backgroundColor: isActive ? `color-mix(in srgb, ${styling.colors.activeBg} 10%, transparent)` : "transparent",
        borderRadius: styling.layout.radius,
        transition: "background-color 0.15s ease, color 0.15s ease",
      }}
    >
      <span className="flex items-center justify-center" style={{ width: 24, height: 24 }}>
        <Icon
          name={isActive && tab.iconFill ? tab.iconFill : tab.icon}
          weight={iconWeight}
          size="md"
          color="currentColor"
        />
      </span>

      {isExpanded && (
        <>
          <span
            className="truncate text-sm font-medium flex-1"
            style={{ lineHeight: "20px" }}
          >
            {tab.label}
          </span>

          {tab.badge != null && tab.badge > 0 && (
            <span
              className="text-xs font-medium flex items-center justify-center"
              style={{
                backgroundColor: styling.colors.badgeBg,
                color: styling.colors.badgeText,
                paddingLeft: styling.spacing.badgePaddingX,
                paddingRight: styling.spacing.badgePaddingX,
                paddingTop: 2,
                paddingBottom: 2,
                borderRadius: 9999,
                minWidth: 20,
              }}
            >
              {tab.badge}
            </span>
          )}
        </>
      )}
    </button>
  );
}

// ─── Bottom Tab Item ──────────────────────────────────────────────────────────

function BottomTabItem({
  tab,
  isActive,
  onClick,
}: {
  tab: NavTab;
  isActive: boolean;
  onClick: () => void;
}) {
  const iconWeight = isActive ? "fill" : "regular";

  return (
    <button
      onClick={onClick}
      aria-label={tab.label}
      aria-current={isActive ? "page" : undefined}
      className="relative flex flex-col items-center justify-center flex-1"
      style={{
        height: "100%",
        color: isActive ? styling.colors.activeText : styling.colors.inactiveText,
        transition: "color 0.15s ease",
      }}
    >
      <span className="relative">
        <Icon
          name={isActive && tab.iconFill ? tab.iconFill : tab.icon}
          weight={iconWeight}
          size="md"
          color="currentColor"
        />
        {tab.badge != null && tab.badge > 0 && (
          <span
            className="absolute -top-1 -right-2 text-[10px] font-bold flex items-center justify-center"
            style={{
              backgroundColor: styling.colors.badgeBg,
              color: styling.colors.badgeText,
              minWidth: 16,
              height: 16,
              borderRadius: 9999,
              paddingLeft: 3,
              paddingRight: 3,
            }}
          >
            {tab.badge}
          </span>
        )}
      </span>
      <span
        className="text-[10px] font-medium mt-0.5"
        style={{ lineHeight: "14px" }}
      >
        {tab.label}
      </span>
    </button>
  );
}
