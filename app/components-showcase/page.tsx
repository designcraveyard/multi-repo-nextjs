"use client";

import React, { useState } from "react";
import { RadioButton, RadioGroup } from "@/app/components/RadioButton";
import { Checkbox } from "@/app/components/Checkbox";
import { Switch } from "@/app/components/Switch";
import { ListItem } from "@/app/components/patterns/ListItem";
import { Divider } from "@/app/components/Divider";
import { DateItem, DateGrid } from "@/app/components/DateGrid";

// --- Section header helper ---------------------------------------------------

function SectionHeader({ children }: { children: string }) {
  return (
    <h2 className="text-[length:var(--typography-title-md-size)] font-[var(--typography-title-md-weight)] leading-[var(--typography-title-md-leading)] text-[var(--typography-primary)] mb-[var(--space-2)]">
      {children}
    </h2>
  );
}

function SubHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[length:var(--typography-caption-md-size)] leading-[var(--typography-caption-md-leading)] text-[var(--typography-muted)] mb-[var(--space-2)]">
      {children}
    </p>
  );
}

// --- Page --------------------------------------------------------------------
// responsive: N/A — showcase/demo page, single-column layout

export default function ComponentsShowcasePage() {
  // --- State -----------------------------------------------------------------
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [radioValue, setRadioValue] = useState("email");
  const [checkNotifications, setCheckNotifications] = useState(true);
  const [checkUpdates, setCheckUpdates] = useState(false);
  const [checkMarketing, setCheckMarketing] = useState(false);
  const [indeterminate, setIndeterminate] = useState(true);
  const [switchDarkMode, setSwitchDarkMode] = useState(false);
  const [switchNotifications, setSwitchNotifications] = useState(true);
  const [switchLocation, setSwitchLocation] = useState(false);

  // Compute "select all" state
  const allChecked = checkNotifications && checkUpdates && checkMarketing;
  const someChecked = checkNotifications || checkUpdates || checkMarketing;

  return (
    <div className="min-h-screen bg-[var(--surfaces-base-primary)] p-[var(--space-6)]">
      <h1 className="text-[length:var(--typography-heading-lg-size)] font-[var(--typography-heading-lg-weight)] leading-[var(--typography-heading-lg-leading)] text-[var(--typography-primary)] mb-[var(--space-6)]">
        Components Showcase
      </h1>

      <div className="flex flex-col gap-[var(--space-8)] max-w-lg">

        {/* ── DateGrid ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeader>Date Grid</SectionHeader>

          <SubHeader>Full week strip (self-managed selection)</SubHeader>
          <DateGrid className="mb-[var(--space-4)]" />

          <SubHeader>Controlled — selected: {selectedDate.toDateString()}</SubHeader>
          <DateGrid
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            className="mb-[var(--space-4)]"
          />

          <SubHeader>Individual cells</SubHeader>
          <div className="flex gap-[var(--space-1)]">
            {[-2, -1, 0, 1, 2].map((offset) => {
              const d = new Date();
              d.setDate(d.getDate() + offset);
              return (
                <DateItem
                  key={offset}
                  date={d}
                  isActive={offset === 0}
                  onSelect={() => {}}
                />
              );
            })}
          </div>
        </section>

        <Divider type="row" />

        {/* ── Radio Buttons ────────────────────────────────────────────── */}
        <section>
          <SectionHeader>Radio Buttons</SectionHeader>

          <SubHeader>Standalone</SubHeader>
          <div className="flex flex-col gap-[var(--space-3)] mb-[var(--space-4)]">
            <RadioButton checked={true} label="Selected radio" />
            <RadioButton checked={false} label="Unselected radio" />
            <RadioButton checked={true} label="Disabled selected" disabled />
          </div>

          <SubHeader>Radio Group — Contact preference</SubHeader>
          <RadioGroup value={radioValue} onChange={setRadioValue}>
            <RadioButton value="email" label="Email" />
            <RadioButton value="sms" label="SMS" />
            <RadioButton value="push" label="Push notification" />
          </RadioGroup>

          <SubHeader>As ListItem rows</SubHeader>
          <div className="mt-[var(--space-3)]">
            <ListItem
              title="Email"
              subtitle="Receive updates via email"
              trailing={{ type: "radio", checked: radioValue === "email", onChange: () => setRadioValue("email") }}
              divider
            />
            <ListItem
              title="SMS"
              subtitle="Receive updates via text message"
              trailing={{ type: "radio", checked: radioValue === "sms", onChange: () => setRadioValue("sms") }}
              divider
            />
            <ListItem
              title="Push notification"
              subtitle="Receive updates on your device"
              trailing={{ type: "radio", checked: radioValue === "push", onChange: () => setRadioValue("push") }}
            />
          </div>
        </section>

        <Divider type="row" />

        {/* ── Checkboxes ───────────────────────────────────────────────── */}
        <section>
          <SectionHeader>Checkboxes</SectionHeader>

          <SubHeader>Standalone</SubHeader>
          <div className="flex flex-col gap-[var(--space-3)] mb-[var(--space-4)]">
            <Checkbox checked={true} label="Checked" />
            <Checkbox checked={false} label="Unchecked" />
            <Checkbox checked={true} indeterminate label="Indeterminate" />
            <Checkbox checked={true} label="Disabled checked" disabled />
          </div>

          <SubHeader>As ListItem rows — Email preferences</SubHeader>
          <div>
            <ListItem
              title="Select all"
              trailing={{
                type: "checkbox",
                checked: allChecked,
                indeterminate: !allChecked && someChecked,
                onChange: (val) => {
                  setCheckNotifications(val);
                  setCheckUpdates(val);
                  setCheckMarketing(val);
                  setIndeterminate(false);
                },
              }}
              divider
            />
            <ListItem
              title="Notifications"
              subtitle="Transaction alerts and reminders"
              trailing={{ type: "checkbox", checked: checkNotifications, onChange: setCheckNotifications }}
              divider
            />
            <ListItem
              title="Product updates"
              subtitle="New features and improvements"
              trailing={{ type: "checkbox", checked: checkUpdates, onChange: setCheckUpdates }}
              divider
            />
            <ListItem
              title="Marketing"
              subtitle="Promotions and special offers"
              trailing={{ type: "checkbox", checked: checkMarketing, onChange: setCheckMarketing }}
            />
          </div>
        </section>

        <Divider type="row" />

        {/* ── Switches ─────────────────────────────────────────────────── */}
        <section>
          <SectionHeader>Switches</SectionHeader>

          <SubHeader>Standalone</SubHeader>
          <div className="flex flex-col gap-[var(--space-3)] mb-[var(--space-4)]">
            <Switch checked={true} label="On" />
            <Switch checked={false} label="Off" />
            <Switch checked={true} label="Disabled on" disabled />
          </div>

          <SubHeader>As ListItem rows — Settings</SubHeader>
          <div>
            <ListItem
              title="Dark mode"
              subtitle="Use dark color theme"
              trailing={{ type: "switch", checked: switchDarkMode, onChange: setSwitchDarkMode }}
              divider
            />
            <ListItem
              title="Notifications"
              subtitle="Enable push notifications"
              trailing={{ type: "switch", checked: switchNotifications, onChange: setSwitchNotifications }}
              divider
            />
            <ListItem
              title="Location services"
              subtitle="Allow access to your location"
              trailing={{ type: "switch", checked: switchLocation, onChange: setSwitchLocation }}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
