"use client";

import { Badge } from "@/app/components/Badge";
import { Icon, type IconProps } from "@/app/components/icons";

export interface BottomNavTab {
  label: string;
  icon: IconProps["name"];
  selectedIcon?: IconProps["name"];
  badge?: string | number;
}

export interface AppBottomNavBarProps {
  selectedTab: number;
  onTabSelect: (index: number) => void;
  tabs: BottomNavTab[];
}

export function AppBottomNavBar({ selectedTab, onTabSelect, tabs }: AppBottomNavBarProps) {
  return (
    <nav className="flex items-center justify-around rounded-[var(--radius-md)] border border-[var(--border-muted)] bg-[var(--surfaces-base-primary)] p-[var(--space-2)]">
      {tabs.map((tab, index) => {
        const isSelected = selectedTab === index;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onTabSelect(index)}
            className="relative flex min-w-16 flex-col items-center gap-[var(--space-1)] rounded-[var(--radius-sm)] px-[var(--space-2)] py-[var(--space-2)] text-[length:var(--typography-caption-sm-size)] text-[var(--typography-secondary)] data-[selected=true]:text-[var(--typography-brand)]"
            data-selected={isSelected}
          >
            <Icon name={isSelected ? tab.selectedIcon ?? tab.icon : tab.icon} size="md" />
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <Badge label={tab.badge} size="number" type="error" className="absolute right-3 top-1" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
