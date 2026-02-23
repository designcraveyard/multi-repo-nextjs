"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@/app/components/icons/Icon";

// ─── Styling Config ───────────────────────────────────────────────────────────
// Change tokens here to restyle AppDateTimePicker everywhere it is used.
// All values must be semantic CSS custom properties from globals.css.

const styling = {
  colors: {
    // Trigger button background and hover/pressed states (no border in normal state)
    triggerBg:       "var(--surfaces-base-primary)",
    triggerHoverBg:  "var(--surfaces-base-primary-hover)",
    triggerText:     "var(--typography-primary)",
    // Calendar popup background
    calendarBg:      "var(--surfaces-base-primary)",
    // Calendar icon inside the trigger
    icon:            "var(--icons-secondary)",
    // Label text above the trigger
    label:           "var(--typography-primary)",
    // Time input text
    timeText:        "var(--typography-primary)",
    timeBg:          "var(--surfaces-base-primary)",
    // Active/selected day in calendar uses SurfacesBrandInteractive via Calendar component
  },
  layout: {
    triggerRadius:   "var(--radius-md)",
    calendarRadius:  "var(--radius-lg)",
    triggerPaddingX: "var(--space-4)",
    triggerPaddingY: "var(--space-2)",
    labelSpacing:    "var(--space-1)",
  },
  typography: {
    label:   "var(--typography-body-md-size)",
    trigger: "var(--typography-body-md-size)",
    time:    "var(--typography-body-md-size)",
  },
} as const;

// ─── Types ────────────────────────────────────────────────────────────────────

export type DateTimeMode = "date" | "time" | "dateAndTime";
export type DateTimeDisplayStyle = "compact" | "inline";

export interface AppDateTimePickerProps {
  /** The currently selected Date value */
  value?: Date;
  /** Called when the user selects a date/time */
  onChange: (date: Date) => void;
  /** Text label shown above the trigger */
  label?: string;
  /** date = calendar only | time = time only | dateAndTime = both */
  mode?: DateTimeMode;
  /** compact = trigger button + popover | inline = embedded calendar */
  displayStyle?: DateTimeDisplayStyle;
  /** Restrict selectable date range */
  range?: { min?: Date; max?: Date };
  /** Renders at 0.5 opacity, blocks interaction */
  disabled?: boolean;
  /** Additional CSS class for the wrapper */
  className?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AppDateTimePicker({
  value,
  onChange,
  label,
  mode = "date",
  displayStyle = "compact",
  range,
  disabled = false,
  className = "",
}: AppDateTimePickerProps) {
  const [open, setOpen] = useState(false);

  // Format the trigger label based on what is selected and the mode
  function formatTrigger(date?: Date): string {
    if (!date) return mode === "time" ? "Pick a time" : "Pick a date";
    if (mode === "date")        return format(date, "PPP");
    if (mode === "time")        return format(date, "p");
    return format(date, "PPP p");
  }

  // Handle date selection from Calendar (preserves existing time if dateAndTime)
  function handleDaySelect(day: Date | undefined) {
    if (!day) return;
    const next = value ? new Date(value) : new Date();
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(next);
    if (mode === "date") setOpen(false);
  }

  // Handle time input change
  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = e.target.value.split(":").map(Number);
    const next = value ? new Date(value) : new Date();
    next.setHours(hours, minutes);
    onChange(next);
  }

  // Calendar + optional time input — shared between inline and compact modes
  const calendarNode = (
    <div
      style={{
        backgroundColor: styling.colors.calendarBg,
        borderRadius:    styling.layout.calendarRadius,
        padding:         "var(--space-3)",
      }}
    >
      {/* Calendar grid — hidden when mode is "time" only */}
      {mode !== "time" && (
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDaySelect}
          disabled={(date) => {
            if (range?.min && date < range.min) return true;
            if (range?.max && date > range.max) return true;
            return false;
          }}
        />
      )}

      {/* Time input — shown when mode is "time" or "dateAndTime" */}
      {mode !== "date" && (
        <div className="flex items-center gap-2 px-2 pb-2">
          <label style={{ color: styling.colors.label, fontSize: styling.typography.label }}>
            Time
          </label>
          <input
            type="time"
            value={value ? format(value, "HH:mm") : ""}
            onChange={handleTimeChange}
            style={{
              backgroundColor: styling.colors.timeBg,
              color:           styling.colors.timeText,
              // No default border; use border-default only when focused via outline
              border:          "none",
              borderRadius:    styling.layout.triggerRadius,
              paddingLeft:     "var(--space-2)",
              paddingRight:    "var(--space-2)",
              paddingTop:      "var(--space-1)",
              paddingBottom:   "var(--space-1)",
              fontSize:        styling.typography.time,
              cursor:          "pointer",
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`flex flex-col ${className}`}
      style={{ gap: styling.layout.labelSpacing, opacity: disabled ? 0.5 : 1 }}
    >
      {label && (
        <span style={{ color: styling.colors.label, fontSize: styling.typography.label }}>
          {label}
        </span>
      )}

      {displayStyle === "inline" ? (
        // Embedded calendar — no popover trigger
        calendarNode
      ) : (
        // Compact trigger button + popover calendar
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger disabled={disabled} asChild>
            <button
              style={{
                backgroundColor: styling.colors.triggerBg,
                color:           styling.colors.triggerText,
                // No default border — clean surface appearance
                border:          "none",
                borderRadius:    styling.layout.triggerRadius,
                paddingLeft:     styling.layout.triggerPaddingX,
                paddingRight:    styling.layout.triggerPaddingX,
                paddingTop:      styling.layout.triggerPaddingY,
                paddingBottom:   styling.layout.triggerPaddingY,
                fontSize:        styling.typography.trigger,
                display:         "flex",
                alignItems:      "center",
                gap:             "var(--space-2)",
                cursor:          disabled ? "not-allowed" : "pointer",
                width:           "100%",
              }}
            >
              {/* CalendarBlank icon from Phosphor via project Icon wrapper */}
              <span style={{ color: styling.colors.icon }} aria-hidden="true">
                <Icon name="CalendarBlank" size="sm" />
              </span>
              {formatTrigger(value)}
            </button>
          </PopoverTrigger>

          {/* No border on the popover panel */}
          <PopoverContent className="p-0 w-auto border-none" align="start">
            {calendarNode}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
