"use client";

import { Fragment, ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppContextMenu everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Menu panel background
    background:      "var(--surfaces-base-primary)",
    // Standard menu item text
    itemText:        "var(--typography-primary)",
    // Destructive item text — red
    destructiveText: "var(--typography-error)",
    // Item background on hover
    itemHoverBg:     "var(--surfaces-base-low-contrast)",
    // Thin divider between rows
    rowDivider:      "var(--border-muted)",
  },
  layout: {
    // Corner radius of the menu panel
    radius:        "var(--radius-md)",
    // Minimum width of the menu panel
    minWidth:      "180px",
    // Horizontal padding inside each row
    itemPaddingX:  "var(--space-4)",
    // Vertical padding inside each row
    itemPaddingY:  "var(--space-3)",
    // Gap between icon and label text
    iconSpacing:   "var(--space-2)",
  },
  typography: {
    item: "var(--typography-body-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

// Note: named AppContextMenuItem (not ContextMenuItem) to avoid conflict with
// the shadcn ContextMenuItem component imported above.
export interface AppContextMenuItem {
  label: string;
  /** Optional Phosphor icon node rendered to the left of the label */
  icon?: ReactNode;
  /** Red text + iOS destructive semantic */
  destructive?: boolean;
  /** Visual separator above this item */
  separatorAbove?: boolean;
  onPress?: () => void;
}

export interface AppContextMenuProps {
  /**
   * "context"  → right-click / long-press menu (Radix ContextMenu)
   * "dropdown" → click-triggered popover menu (Radix DropdownMenu)
   */
  mode?: "context" | "dropdown";
  /** The element that triggers the menu */
  children: ReactNode;
  /** Menu items to display */
  items: AppContextMenuItem[];
  /** Additional CSS class for the trigger wrapper */
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Shared inline style for a menu item row
function itemStyle(destructive?: boolean): React.CSSProperties {
  return {
    color:         destructive ? styling.colors.destructiveText : styling.colors.itemText,
    fontSize:      styling.typography.item,
    paddingLeft:   styling.layout.itemPaddingX,
    paddingRight:  styling.layout.itemPaddingX,
    paddingTop:    styling.layout.itemPaddingY,
    paddingBottom: styling.layout.itemPaddingY,
    gap:           styling.layout.iconSpacing,
    cursor:        "pointer",
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppContextMenu({
  mode = "context",
  children,
  items,
  className = "",
}: AppContextMenuProps) {
  const contentStyle: React.CSSProperties = {
    backgroundColor: styling.colors.background,
    borderRadius:    styling.layout.radius,
    minWidth:        styling.layout.minWidth,
    padding:         0,
    overflow:        "hidden",
  };

  // ── Context menu (right-click / long-press) ──
  if (mode === "context") {
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild className={className}>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent style={contentStyle}>
          {items.map((item, i) => (
            // Fragment with key so React can reconcile the conditional separator + item pair
            <Fragment key={i}>
              {item.separatorAbove && (
                <ContextMenuSeparator
                  style={{ backgroundColor: styling.colors.rowDivider }}
                />
              )}
              <ContextMenuItem
                onSelect={item.onPress}
                style={itemStyle(item.destructive)}
              >
                {item.icon && <span aria-hidden="true">{item.icon}</span>}
                {item.label}
              </ContextMenuItem>
            </Fragment>
          ))}
        </ContextMenuContent>
      </ContextMenu>
    );
  }

  // ── Dropdown menu (click-triggered) ──
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className={className}>
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent style={contentStyle}>
        {items.map((item, i) => (
          <Fragment key={i}>
            {item.separatorAbove && (
              <DropdownMenuSeparator
                style={{ backgroundColor: styling.colors.rowDivider }}
              />
            )}
            <DropdownMenuItem
              onSelect={item.onPress}
              style={itemStyle(item.destructive)}
            >
              {item.icon && <span aria-hidden="true">{item.icon}</span>}
              {item.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
