// ListItem.tsx
// Figma source: bubbles-kit › "ListItem" — horizontal row pattern composing
// Thumbnail + TextBlock + optional trailing action (Button | IconButton | Badge)
//
// All slots are optional except `title`. Caller controls trailing action type
// via a discriminated union to keep prop surface clean.
//
// Usage:
//   <ListItem title="Ayurveda Books" subtitle="bought for Anjali" />
//   <ListItem
//     thumbnail={{ src: "/book.jpg", alt: "Book cover" }}
//     title="Trip Planning"
//     metadata="2d ago"
//     trailing={{ type: "iconButton", icon: "DotsThree", accessibilityLabel: "More options", onPress: () => {} }}
//   />
//   <ListItem title="Inbox" trailing={{ type: "badge", label: "3", badgeVariant: "error" }} divider />

import { Badge } from "@/app/components/Badge";
import type { BadgeType } from "@/app/components/Badge";
import { Button } from "@/app/components/Button";
import type { ButtonVariant } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { Divider } from "@/app/components/Divider";
import { Icon } from "@/app/components/icons";
import { IconButton } from "@/app/components/IconButton";
import { RadioButton } from "@/app/components/RadioButton";
import { Switch } from "@/app/components/Switch";
import { Thumbnail } from "@/app/components/Thumbnail";
import { TextBlock } from "@/app/components/patterns/TextBlock";

// --- Types ───────────────────────────────────────────────────────────────────

export type ListItemTrailing =
  | { type: "button"; label: string; onPress: () => void; variant?: ButtonVariant }
  /** icon: Phosphor icon name (PascalCase, e.g. "DotsThree") */
  | { type: "iconButton"; icon: string; accessibilityLabel: string; onPress: () => void }
  | { type: "badge"; label: string; badgeVariant?: BadgeType }
  | { type: "radio"; checked: boolean; onChange: (checked: boolean) => void; value?: string }
  | { type: "checkbox"; checked: boolean; onChange: (checked: boolean) => void; indeterminate?: boolean }
  | { type: "switch"; checked: boolean; onChange: (checked: boolean) => void }
  | { type: "none" };

export interface ListItemProps {
  /** Primary text line (required) */
  title: string;
  /** Secondary line below title */
  subtitle?: string;
  /** Body copy below subtitle */
  body?: string;
  /** Metadata footnote (e.g. timestamp) */
  metadata?: string;
  /** Optional leading thumbnail */
  thumbnail?: { src: string; alt?: string };
  /** Optional trailing action — button, icon button, or badge */
  trailing?: ListItemTrailing;
  /** Renders a row Divider below the list item */
  divider?: boolean;
  className?: string;
}

// --- Helpers ─────────────────────────────────────────────────────────────────

/**
 * Renders the appropriate trailing action component based on the discriminated
 * union type. Each branch maps to a different atomic component from the design system.
 */
function TrailingSlot({ trailing }: { trailing: ListItemTrailing }) {
  switch (trailing.type) {
    case "button":
      return (
        <Button
          label={trailing.label}
          variant={trailing.variant ?? "secondary"}
          size="sm"
          onClick={trailing.onPress}
        />
      );
    case "iconButton":
      return (
        <IconButton
          icon={<Icon name={trailing.icon as Parameters<typeof Icon>[0]["name"]} size="sm" />}
          label={trailing.accessibilityLabel}
          variant="secondary"
          size="sm"
          onClick={trailing.onPress}
        />
      );
    case "badge":
      return (
        <Badge
          label={trailing.label}
          type={trailing.badgeVariant ?? "brand"}
          size="sm"
        />
      );
    case "radio":
      return (
        <RadioButton
          checked={trailing.checked}
          onChange={trailing.onChange}
          value={trailing.value}
        />
      );
    case "checkbox":
      return (
        <Checkbox
          checked={trailing.checked}
          onChange={trailing.onChange}
          indeterminate={trailing.indeterminate}
        />
      );
    case "switch":
      return (
        <Switch
          checked={trailing.checked}
          onChange={trailing.onChange}
        />
      );
    case "none":
    default:
      return null;
  }
}

// --- Render ──────────────────────────────────────────────────────────────────

/**
 * A horizontal row pattern composing Thumbnail + TextBlock + an optional trailing
 * action slot (Button, IconButton, Badge, Radio, Checkbox, or Switch).
 *
 * All slots are optional except `title`. The trailing action type is selected via
 * a discriminated union on `trailing.type` to keep the prop surface clean.
 *
 * Composition: Thumbnail (leading) + TextBlock (center) + TrailingSlot (trailing).
 *
 * @see TrailingSlot  -- renders the trailing action based on the union branch
 */
export function ListItem({
  title,
  subtitle,
  body,
  metadata,
  thumbnail,
  trailing,
  divider = false,
  className = "",
}: ListItemProps) {
  const hasTrailing = trailing && trailing.type !== "none";

  return (
    <div className={["w-full", className].join(" ")}>
      <div className="flex gap-[var(--space-3)] items-start w-full">
        {/* Leading: thumbnail (optional) */}
        {thumbnail && (
          <Thumbnail
            src={thumbnail.src}
            alt={thumbnail.alt ?? ""}
            size="md"
          />
        )}

        {/* Middle: text content — grows to fill available space */}
        <div className="flex-1 min-w-0">
          <TextBlock
            title={title}
            subtext={subtitle}
            body={body}
            metadata={metadata}
          />
        </div>

        {/* Trailing: action slot (optional) */}
        {hasTrailing && (
          <div className="flex-shrink-0 flex items-center self-center">
            <TrailingSlot trailing={trailing} />
          </div>
        )}
      </div>

      {/* Optional row divider below */}
      {divider && (
        <div className="mt-[var(--space-3)]">
          <Divider type="row" />
        </div>
      )}
    </div>
  );
}
