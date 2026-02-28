"use client";

/**
 * DateGrid — weekly horizontal date selector from the bubbles-kit design system.
 *
 * Composed of two exports:
 *  - `DateItem`  — single day cell (atomic). Shows a 3-letter day abbreviation,
 *    a 2-digit date number, and a today-indicator dot.
 *  - `DateGrid`  — horizontally paging week strip (Outlook-style).
 *    Scroll left/right to navigate weeks; snaps to full-week pages.
 *    Scrolling to a new week automatically selects the same weekday.
 *
 * Figma source: bubbles-kit
 *   DateItem (item)  → node 93:4399
 *   DateGrid (grid)  → node 95:2791
 *
 * @prop date          — JS `Date` for each cell (DateItem) or the anchor date of the week (DateGrid)
 * @prop isActive      — whether this cell is the selected day (DateItem)
 * @prop isToday       — shows a 4 px brand-colour dot below the date number (DateItem)
 * @prop onSelect      — called with the cell's Date when the user clicks it (DateItem / DateGrid)
 * @prop selectedDate  — externally controlled selection; if omitted DateGrid manages state internally
 * @prop startOfWeek   — 0 = Sunday (default), 1 = Monday
 */

import { useState, useMemo, useRef, useLayoutEffect, useCallback } from "react";
import { ButtonHTMLAttributes } from "react";
import { Icon } from "@/app/components/icons";

// ─── Constants ─────────────────────────────────────────────────────────────────

/** Number of weeks rendered on each side of the anchor week. */
const WEEK_RANGE = 52;
/** Total pages: [−WEEK_RANGE … 0 … +WEEK_RANGE]. */
const TOTAL_WEEKS = WEEK_RANGE * 2 + 1;

/** Day abbreviations matching the Figma design (3 uppercase letters). */
const DAY_ABBR = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"] as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DateItemProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "onSelect"> {
  /** The date this cell represents. */
  date: Date;
  /** Whether this cell is selected. */
  isActive?: boolean;
  /** When true, a 4 px brand-colour dot appears below the date number. */
  isToday?: boolean;
  /** Called when the user clicks this cell. */
  onSelect?: (date: Date) => void;
}

export interface DateGridProps {
  /**
   * Any date within the week to display.
   * The grid derives the full 7-day window from this anchor.
   */
  anchorDate?: Date;
  /**
   * Controlled selection. If provided, the grid will not manage its own state.
   * Defaults to today when uncontrolled.
   */
  selectedDate?: Date;
  /** Called when the user selects a different day. */
  onSelect?: (date: Date) => void;
  /** 0 = week starts on Sunday (default), 1 = Monday. */
  startOfWeek?: 0 | 1;
  className?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Zero out time portion so Date equality comparisons work correctly. */
function toDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/** Returns the 7 Date objects for the week containing `anchor`, ordered by `startOfWeek`. */
function weekDates(anchor: Date, startOfWeek: 0 | 1 = 0): Date[] {
  const day = toDay(anchor);
  const offset = (day.getDay() - startOfWeek + 7) % 7;
  const weekStart = new Date(day);
  weekStart.setDate(day.getDate() - offset);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });
}

/** Format a date as a zero-padded day string, e.g. "08". */
function formatDay(d: Date): string {
  return String(d.getDate()).padStart(2, "0");
}

/** Returns true if both dates represent the same calendar day. */
function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// ─── DateItem ─────────────────────────────────────────────────────────────────

/**
 * Single date cell — day abbreviation stacked above the numeric date, with a today indicator dot.
 *
 * Default: muted text on a transparent background.
 * Active:  white card surface (`surfaces-base-primary`) with Elevation 1 drop shadow.
 *          Date number switches to `typography-primary` at medium weight.
 * Today:   4 px dot below the number (always reserves space for layout consistency).
 *          Brand colour when inactive; `typography-primary` when active (white on card).
 */
export function DateItem({
  date,
  isActive = false,
  isToday = false,
  onSelect,
  disabled,
  className = "",
  ...rest
}: DateItemProps) {
  const dayAbbr = DAY_ABBR[date.getDay()];
  const dayNum = formatDay(date);

  // --- Styles

  const baseCell = [
    "flex flex-col items-center justify-center",
    "p-[var(--space-2)] rounded-[12px]",
    "cursor-pointer select-none",
    "transition-all duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)] focus-visible:ring-offset-1",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ].join(" ");

  const activeCell = [
    "bg-[var(--surfaces-base-primary)]",
    "shadow-[0px_2px_8px_0px_var(--surfaces-base-high-contrast)]",
  ].join(" ");

  const inactiveCell = "hover:bg-[var(--surfaces-base-low-contrast-hover)]";

  // Day abbreviation is always muted.
  const abbrStyle =
    "text-[var(--typography-muted)] text-[10px] font-semibold leading-[12px] tracking-[0px]";

  // Date number: primary + medium weight when active, muted + regular weight when inactive.
  const numStyle = isActive
    ? "text-[var(--typography-primary)] text-[16px] font-medium leading-[24px]"
    : "text-[var(--typography-muted)] text-[16px] font-normal leading-[24px]";

  // Today dot — white on active card, brand on transparent background.
  const dotColour = isActive
    ? "bg-[var(--typography-primary)]"
    : "bg-[var(--surfaces-brand-interactive)]";

  return (
    <button
      role="gridcell"
      aria-selected={isActive}
      aria-label={`${dayAbbr} ${dayNum}${isActive ? ", selected" : ""}${isToday ? ", today" : ""}`}
      disabled={disabled}
      aria-disabled={disabled}
      onClick={() => onSelect?.(date)}
      className={[baseCell, isActive ? activeCell : inactiveCell, className].join(" ")}
      {...rest}
    >
      {/* Day abbreviation — Badge/Medium style */}
      <span className={abbrStyle} aria-hidden="true">
        {dayAbbr}
      </span>

      {/* Numeric date — Body/LargeEmphasized (active) or Body/Large (inactive) */}
      <span className={numStyle}>{dayNum}</span>

      {/* Today indicator dot — always rendered to keep cell heights consistent.
          Invisible via opacity-0 when not today; coloured when today. */}
      <span
        aria-hidden="true"
        className={`mt-[2px] block h-[4px] w-[4px] rounded-full transition-opacity duration-150 ${
          isToday ? dotColour : "opacity-0"
        }`}
      />
    </button>
  );
}

// ─── DateGrid ─────────────────────────────────────────────────────────────────

/**
 * Horizontally paging weekly date selector (Outlook-style).
 *
 * The strip is a scroll-snap container — each page is one full week.
 * Scrolling left/right snaps to week boundaries and automatically selects
 * the same weekday in the newly visible week. Today's cell always shows its
 * indicator dot regardless of selection state.
 *
 * Manages its own selected-date state when `selectedDate` is not provided (defaults to today).
 * The strip spans ±52 weeks (±1 year) from the `anchorDate`'s week.
 *
 * Accessible as a `role="grid"` with `role="row"` + `role="gridcell"` items.
 */
export function DateGrid({
  anchorDate,
  selectedDate: controlledSelected,
  onSelect,
  startOfWeek = 0,
  className = "",
}: DateGridProps) {
  // --- State

  const today = useMemo(() => toDay(new Date()), []);
  const anchorDay = useMemo(() => toDay(anchorDate ?? new Date()), [anchorDate]);

  const [internalSelected, setInternalSelected] = useState<Date>(today);
  const isControlled = controlledSelected !== undefined;
  const activeDate = isControlled ? controlledSelected : internalSelected;

  // All week offsets rendered in the strip.
  const offsets = useMemo(
    () => Array.from({ length: TOTAL_WEEKS }, (_, i) => i - WEEK_RANGE),
    []
  );

  // --- Scroll refs

  const scrollRef = useRef<HTMLDivElement>(null);
  /** Debounce timer for scroll-end detection. */
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** Last committed week offset to avoid duplicate auto-selects. */
  const lastOffsetRef = useRef(0);

  // --- Helpers

  /** Returns the 7 dates for the week at `offset` weeks from the anchor week. */
  const datesForOffset = useCallback(
    (offset: number): Date[] => {
      const shifted = new Date(anchorDay);
      shifted.setDate(anchorDay.getDate() + offset * 7);
      return weekDates(shifted, startOfWeek);
    },
    [anchorDay, startOfWeek]
  );

  // --- Scroll to week 0 synchronously before first paint (no flash).
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = WEEK_RANGE * el.offsetWidth;
  }, []);

  // --- Handlers

  function handleSelect(d: Date) {
    if (!isControlled) setInternalSelected(d);
    onSelect?.(d);
  }

  /** When the user scrolls to a new week, auto-select the same weekday. */
  function handleWeekChange(offset: number) {
    if (offset === lastOffsetRef.current) return;
    lastOffsetRef.current = offset;

    const newDays = datesForOffset(offset);
    // If the current selection is already in this week, nothing to do.
    if (newDays.some((d) => isSameDay(d, activeDate))) return;

    const targetWeekday = activeDate.getDay();
    const match = newDays.find((d) => d.getDay() === targetWeekday);
    if (!match) return;

    if (!isControlled) setInternalSelected(match);
    onSelect?.(match);
  }

  function handleScroll() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const el = scrollRef.current;
      if (!el) return;
      const weekIndex = Math.round(el.scrollLeft / el.offsetWidth);
      handleWeekChange(weekIndex - WEEK_RANGE);
    }, 80);
  }

  /** Scroll forward (+1) or backward (−1) by one full week page. */
  function scrollWeeks(delta: number) {
    const el = scrollRef.current;
    if (!el) return;
    const currentPage = Math.round(el.scrollLeft / el.offsetWidth);
    el.scrollTo({ left: (currentPage + delta) * el.offsetWidth, behavior: "smooth" });
  }

  // --- Styles (arrow buttons)

  // Hidden on mobile (touch devices swipe natively), visible on md+ (desktop).
  const arrowBtn = [
    "hidden md:flex items-center justify-center shrink-0 self-stretch",
    "px-[var(--space-2)]",
    "text-[var(--typography-muted)] hover:text-[var(--typography-primary)]",
    "hover:bg-[var(--surfaces-base-low-contrast-hover)]",
    "transition-colors duration-150",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-active)] focus-visible:ring-inset",
  ].join(" ");

  // --- Render

  return (
    // Outer pill — background + rounded corners + flex row for buttons + scroll area.
    <div
      className={[
        "flex items-stretch overflow-hidden rounded-[12px]",
        "bg-[var(--surfaces-base-low-contrast)]",
        className,
      ].join(" ")}
    >
      {/* Previous-week button */}
      <button
        aria-label="Previous week"
        onClick={() => scrollWeeks(-1)}
        className={arrowBtn}
      >
        <Icon name="CaretLeft" size="sm" />
      </button>

      {/* Scroll container — snaps to full-week pages, hides scrollbar. */}
      <div
        ref={scrollRef}
        role="grid"
        aria-label="Week date selector"
        className="flex-1 overflow-x-auto [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        onScroll={handleScroll}
      >
        {/* Wide flex row — each child is min-w-full (= scroll container width). */}
        <div className="flex">
          {offsets.map((offset) => {
            const days = datesForOffset(offset);
            return (
              <div
                key={offset}
                role="row"
                className="min-w-full [scroll-snap-align:start] flex items-center gap-0 px-[var(--space-2)] py-[var(--space-1)]"
              >
                {days.map((d) => (
                  <DateItem
                    key={d.toISOString()}
                    date={d}
                    isActive={isSameDay(d, activeDate)}
                    isToday={isSameDay(d, today)}
                    onSelect={handleSelect}
                    className="flex-1 min-w-0"
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Next-week button */}
      <button
        aria-label="Next week"
        onClick={() => scrollWeeks(1)}
        className={arrowBtn}
      >
        <Icon name="CaretRight" size="sm" />
      </button>
    </div>
  );
}
