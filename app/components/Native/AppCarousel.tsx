"use client";

import { ReactNode, useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { IconButton } from "@/app/components/IconButton";
import { Icon } from "@/app/components/icons";

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
  /** Show prev/next navigation buttons on the edges (default: true) */
  showNavButtons?: boolean;
  /** Accessible label for the previous button */
  prevLabel?: string;
  /** Accessible label for the next button */
  nextLabel?: string;
  /** Additional CSS class for the outer wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppCarousel({
  items,
  style: carouselStyle = "paged",
  showDots = true,
  showNavButtons = true,
  prevLabel = "Previous slide",
  nextLabel = "Next slide",
  className = "",
}: AppCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  function onSetApi(carouselApi: CarouselApi) {
    setApi(carouselApi);
    if (!carouselApi) return;

    const updateState = () => {
      setSelectedIndex(carouselApi.selectedScrollSnap());
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
    };

    carouselApi.on("select", updateState);
    carouselApi.on("reInit", updateState);
    updateState();
  }

  const opts =
    carouselStyle === "scrollSnap"
      ? { align: "start" as const, containScroll: "trimSnaps" as const }
      : { align: "center" as const, loop: false };

  return (
    <div className={`flex flex-col ${className}`} style={{ gap: styling.layout.dotsSpacing }}>
      {/* Carousel with navigation arrows */}
      <div className="relative">
        <Carousel opts={opts} setApi={onSetApi}>
          <CarouselContent
            style={{
              gap: carouselStyle === "scrollSnap" ? styling.layout.cardSpacing : undefined,
            }}
          >
            {items.map((item, i) => (
              <CarouselItem
                key={i}
                className={carouselStyle === "scrollSnap" ? "basis-[85%]" : "basis-full"}
              >
                {item}
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Navigation buttons — positioned on left/right edges, vertically centered */}
        {showNavButtons && items.length > 1 && (
          <>
            <div
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 transition-opacity"
              style={{ opacity: canScrollPrev ? 1 : 0, pointerEvents: canScrollPrev ? "auto" : "none" }}
            >
              <IconButton
                icon={<Icon name="CaretLeft" size="sm" />}
                label={prevLabel}
                variant="secondary"
                size="sm"
                onClick={() => api?.scrollPrev()}
              />
            </div>
            <div
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 transition-opacity"
              style={{ opacity: canScrollNext ? 1 : 0, pointerEvents: canScrollNext ? "auto" : "none" }}
            >
              <IconButton
                icon={<Icon name="CaretRight" size="sm" />}
                label={nextLabel}
                variant="secondary"
                size="sm"
                onClick={() => api?.scrollNext()}
              />
            </div>
          </>
        )}
      </div>

      {/* Dot indicators */}
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
                onClick={() => api?.scrollTo(i)}
                className="cursor-pointer"
                style={{
                  width:           isActive ? styling.layout.dotActiveWidth : styling.layout.dotInactiveSize,
                  height:          styling.layout.dotHeight,
                  borderRadius:    styling.layout.dotRadius,
                  backgroundColor: isActive ? styling.colors.dotActive : styling.colors.dotInactive,
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
