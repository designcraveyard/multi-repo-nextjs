// Thumbnail.tsx
// Figma source: bubbles-kit › node 82:1235 "Thumbnail"
//
// Axes: Sizes(xs/sm/md/lg/xl/xxl) × Rounded(Off/On) = 12
//
// Usage:
//   <Thumbnail src="/avatar.png" alt="User avatar" size="md" />
//   <Thumbnail src="/photo.jpg" alt="Photo" size="lg" rounded />
//   <Thumbnail alt="Initials" size="md" rounded>AB</Thumbnail>  // fallback slot

import React from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ThumbnailSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

export interface ThumbnailProps {
  /** Image source URL */
  src?: string;
  /** Alt text (required for accessibility) */
  alt: string;
  /** Size token — xs=32 · sm=40 · md=48 · lg=64 · xl=80 · xxl=96 */
  size?: ThumbnailSize;
  /** Rounded=On: circle shape. Rounded=Off: radius-sm square (default) */
  rounded?: boolean;
  /** Optional fallback content rendered when src is absent or fails to load */
  children?: React.ReactNode;
  className?: string;
}

// ─── Size Map ────────────────────────────────────────────────────────────────

const SIZE_MAP: Record<ThumbnailSize, { px: number; cls: string }> = {
  xs:  { px: 32,  cls: "w-8 h-8 text-[11px]" },
  sm:  { px: 40,  cls: "w-10 h-10 text-[13px]" },
  md:  { px: 48,  cls: "w-12 h-12 text-[15px]" },
  lg:  { px: 64,  cls: "w-16 h-16 text-[18px]" },
  xl:  { px: 80,  cls: "w-20 h-20 text-[22px]" },
  xxl: { px: 96,  cls: "w-24 h-24 text-[28px]" },
};

// ─── Component ───────────────────────────────────────────────────────────────

export function Thumbnail({
  src,
  alt,
  size = "md",
  rounded = false,
  children,
  className = "",
}: ThumbnailProps) {
  const { cls } = SIZE_MAP[size];
  const shapeClass = rounded ? "rounded-full" : "rounded-[var(--radius-sm)]";

  const baseClass = [
    "relative inline-flex items-center justify-center shrink-0 overflow-hidden",
    "bg-[var(--surfaces-base-low-contrast)]",
    cls,
    shapeClass,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={[baseClass, "object-cover"].join(" ")}
        draggable={false}
      />
    );
  }

  return (
    <span className={baseClass} aria-label={alt} role="img">
      {children ? (
        <span
          className="font-medium leading-none text-[var(--typography-secondary)] select-none"
          aria-hidden="true"
        >
          {children}
        </span>
      ) : (
        // Generic person silhouette fallback
        <svg
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[60%] h-[60%]"
          aria-hidden="true"
        >
          <circle cx="10" cy="7" r="3.5" fill="var(--typography-muted)" />
          <path
            d="M3 17c0-3.866 3.134-7 7-7s7 3.134 7 7"
            stroke="var(--typography-muted)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      )}
    </span>
  );
}
