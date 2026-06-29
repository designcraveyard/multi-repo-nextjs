"use client";

import { IconButton } from "@/app/components/IconButton";
import { Icon, type IconProps } from "@/app/components/icons";

export interface HeaderAction {
  icon: IconProps["name"];
  contentDescription: string;
  onPress: () => void;
}

export interface AppPageHeaderProps {
  title: string;
  navigationIcon?: IconProps["name"];
  onNavigationClick?: () => void;
  actions?: HeaderAction[];
}

export function AppPageHeader({
  title,
  navigationIcon,
  onNavigationClick,
  actions = [],
}: AppPageHeaderProps) {
  return (
    <div className="flex items-center justify-between rounded-[var(--radius-md)] border border-[var(--border-muted)] bg-[var(--surfaces-base-primary)] px-[var(--space-4)] py-[var(--space-3)]">
      <div className="flex min-w-0 items-center gap-[var(--space-2)]">
        {navigationIcon && onNavigationClick && (
          <IconButton
            icon={<Icon name={navigationIcon} />}
            label="Navigate back"
            variant="quarternary"
            size="sm"
            onClick={onNavigationClick}
          />
        )}
        <h3 className="truncate text-[length:var(--typography-title-md-size)] font-[var(--typography-title-md-weight)] leading-[var(--typography-title-md-leading)] text-[var(--typography-primary)]">
          {title}
        </h3>
      </div>
      <div className="flex items-center gap-[var(--space-2)]">
        {actions.map((action) => (
          <IconButton
            key={action.contentDescription}
            icon={<Icon name={action.icon} />}
            label={action.contentDescription}
            variant="quarternary"
            size="sm"
            onClick={action.onPress}
          />
        ))}
      </div>
    </div>
  );
}
