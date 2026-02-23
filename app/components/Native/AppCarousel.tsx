"use client";

import { ReactNode, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppCarousel everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Active page dot — brand color marks the current slide
    dotActive:   "var(--surfaces-brand-interactive)",
    // Inactive page dots — high-contrast surface so dots read on any background
    dotInactive: "var(--surfaces-base-high-contrast)",
  },
  layout: {
    // Horizontal gap between cards in scroll-snap style
    cardSpacing:     "var(--space-3)",
    // Inactive dot diameter (width = height)
    dotInactiveSize: "6px",
    // Dot height (both active and inactive)
    dotHeight:       "6px",
    // Active dot width (wider capsule marks current page)
    dotActiveWidth:  "18px",
    // Corner radius on dots (makes active dot a capsule)
    dotRadius:       "var(--radius-full)",
    // Gap between adjacent dots
    dotGap:          "var(--space-1)",
    // Gap between carousel content and dots row
    dotsSpacing:     "var(--space-3)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AppCarouselProps {
  /** Array of ReactNodes to render as carousel slides */
  items: ReactNode[];
  /**
   * "paged"      → full-width slides, one visible at a time (iOS .page style)
   * "scrollSnap" → partial peek of adjacent cards
   */
  style?: "paged" | "scrollSnap";
  /** When true, renders dot indicators below the carousel */
  showDots?: boolean;
  /** Additional CSS class for the outer wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppCarousel({
  items,
  style: carouselStyle = "paged",
  showDots = true,
  className = "",
}: AppCarouselProps) {
  // CarouselApi from shadcn gives us the Embla instance that the <Carousel>
  // component itself controls — no second useEmblaCarousel call needed.
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Subscribe to Embla's "select" event once the API is available
  function onSetApi(carouselApi: CarouselApi) {
    setApi(carouselApi);
    if (!carouselApi) return;
    carouselApi.on("select", () => setSelectedIndex(carouselApi.selectedScrollSnap()));
  }

  const opts =
    carouselStyle === "scrollSnap"
      ? { align: "start" as const, containScroll: "trimSnaps" as const }
      : { align: "center" as const, loop: false };

  return (
    <div className={`flex flex-col ${className}`} style={{ gap: styling.layout.dotsSpacing }}>
      <Carousel opts={opts} setApi={onSetApi}>
        <CarouselContent
          style={{
            gap: carouselStyle === "scrollSnap" ? styling.layout.cardSpacing : undefined,
          }}
        >
          {items.map((item, i) => (
            <CarouselItem
              key={i}
              // scrollSnap shows a peek of adjacent cards; paged fills full width
              className={carouselStyle === "scrollSnap" ? "basis-[85%]" : "basis-full"}
            >
              {item}
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Dot indicators — only shown when showDots=true and there are multiple slides */}
      {showDots && items.length > 1 && (
        <div
          className="flex items-center justify-center"
          style={{ gap: styling.layout.dotGap }}
          aria-label={`Slide ${selectedIndex + 1} of ${items.length}`}
          role="tablist"
        >
          {items.map((_, i) => {
            const isActive = i === selectedIndex;
            return (
              <span
                key={i}
                role="tab"
                aria-selected={isActive}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width:           isActive ? styling.layout.dotActiveWidth : styling.layout.dotInactiveSize,
                  height:          styling.layout.dotHeight,
                  borderRadius:    styling.layout.dotRadius,
                  backgroundColor: isActive ? styling.colors.dotActive : styling.colors.dotInactive,
                  // Smooth width transition when active dot changes
                  transition:      "width 200ms ease",
                  display:         "inline-block",
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
