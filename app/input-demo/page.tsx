"use client";

/**
 * /input-demo — Kitchen-sink demo for Label + InputField components
 *
 * Sections:
 *   1. Label variants — 3 sizes × 4 types, with/without icons
 *   2. InputField — all 7 states (Default / Focus / Filled / Disabled / Success / Warning / Error)
 *   3. InputField — all slot combinations (leading icon, trailing icon, leading label, trailing label, separators)
 *   4. TextField — multiline, all states
 */

import { useState } from "react";
import { Label } from "@/app/components/Label";
import { InputField, TextField } from "@/app/components/InputField";
import { Icon } from "@/app/components/icons";
import { AppNativePicker } from "@/app/components/Native/AppNativePicker";
import { AppDateTimePicker } from "@/app/components/Native/AppDateTimePicker";
import { AppColorPicker } from "@/app/components/Native/AppColorPicker";
import { AppRangeSlider } from "@/app/components/Native/AppRangeSlider";
import { AppBottomSheet } from "@/app/components/Native/AppBottomSheet";
import { Button } from "@/app/components/Button";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-[length:var(--typography-body-lg-em-size)] font-[var(--typography-body-lg-em-weight)] text-[var(--typography-primary)] border-b border-[var(--border-default)] pb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[length:var(--typography-caption-md-size)] font-[var(--typography-caption-md-weight)] text-[var(--typography-muted)]">
        {label}
      </span>
      {children}
    </div>
  );
}

// ─── Demo page ────────────────────────────────────────────────────────────────

export default function InputDemoPage() {
  const [value, setValue] = useState("");
  const [email, setEmail] = useState("user@example.com");
  const [bio, setBio] = useState("");

  // --- Picker state ---
  const [currency, setCurrency] = useState("usd");
  const [country, setCountry] = useState("us");
  const [pickerDate, setPickerDate] = useState<Date | undefined>(undefined);
  const [pickerColor, setPickerColor] = useState("#3B82F6");

  // --- Range slider state ---
  const [priceRange, setPriceRange] = useState<[number, number]>([20, 80]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 65]);
  const [singleSlider, setSingleSlider] = useState<[number, number]>([0, 50]);

  // --- Bottom sheet state ---
  const [sheetOpen, setSheetOpen] = useState(false);
  const [formSheetOpen, setFormSheetOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--surfaces-base-primary)] px-6 py-10">
      <div className="max-w-2xl mx-auto flex flex-col gap-12">

        {/* ── Page header ── */}
        <header className="flex flex-col gap-1">
          <h1 className="text-[length:var(--typography-body-xl-size)] font-[var(--typography-body-xl-weight)] text-[var(--typography-primary)]">
            Label &amp; Input Field
          </h1>
          <p className="text-[length:var(--typography-body-md-size)] leading-[var(--typography-body-md-leading)] text-[var(--typography-muted)]">
            Figma: bubbles-kit › Label (82:1401) · Input Field (90:3753)
          </p>
        </header>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 1 — Label variants
        ═══════════════════════════════════════════════════════════════════ */}
        <Section title="1 · Label — all sizes × types">

          {/* Text-only grid */}
          {(["sm", "md", "lg"] as const).map((size) => (
            <Row key={size} label={`Size: ${size}`}>
              <div className="flex flex-wrap items-center gap-4">
                {(
                  [
                    "secondaryAction",
                    "primaryAction",
                    "brandInteractive",
                    "information",
                  ] as const
                ).map((type) => (
                  <Label key={type} label={type} size={size} type={type} />
                ))}
              </div>
            </Row>
          ))}

          {/* With leading icon */}
          <Row label="With leading icon">
            <div className="flex flex-wrap items-center gap-4">
              <Label
                label="Verified"
                size="lg"
                type="primaryAction"
                leadingIcon={<Icon name="CheckCircle" size="lg" />}
              />
              <Label
                label="USD"
                size="md"
                type="secondaryAction"
                leadingIcon={<Icon name="CurrencyDollar" size="md" />}
              />
              <Label
                label="Info"
                size="sm"
                type="information"
                leadingIcon={<Icon name="Info" size="sm" />}
              />
            </div>
          </Row>

          {/* With trailing icon */}
          <Row label="With trailing icon">
            <div className="flex flex-wrap items-center gap-4">
              <Label
                label="USD"
                size="md"
                type="secondaryAction"
                trailingIcon={<Icon name="CaretDown" size="md" />}
              />
              <Label
                label="Brand"
                size="lg"
                type="brandInteractive"
                trailingIcon={<Icon name="ArrowRight" size="lg" />}
              />
              <Label
                label="Close"
                size="sm"
                type="information"
                trailingIcon={<Icon name="X" size="sm" />}
              />
            </div>
          </Row>

          {/* With both icons */}
          <Row label="With leading + trailing icons">
            <div className="flex flex-wrap items-center gap-4">
              <Label
                label="Search"
                size="md"
                type="primaryAction"
                leadingIcon={<Icon name="MagnifyingGlass" size="md" />}
                trailingIcon={<Icon name="X" size="md" />}
              />
              <Label
                label="Filter"
                size="lg"
                type="secondaryAction"
                leadingIcon={<Icon name="FunnelSimple" size="lg" />}
                trailingIcon={<Icon name="CaretDown" size="lg" />}
              />
            </div>
          </Row>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 2 — InputField states
        ═══════════════════════════════════════════════════════════════════ */}
        <Section title="2 · InputField — all states">

          <Row label="Default (empty)">
            <InputField
              value={value}
              onChange={(e) => setValue(e.target.value)}
              label="Full Name"
              placeholder="Enter your name"
            />
          </Row>

          <Row label="Default (focus — click inside)">
            <InputField
              label="Username"
              placeholder="Focus me to see the active border"
              defaultValue=""
            />
          </Row>

          <Row label="Filled (has value)">
            <InputField
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email"
              placeholder="you@example.com"
            />
          </Row>

          <Row label="Disabled">
            <InputField
              label="Read-only field"
              placeholder="Cannot type here"
              defaultValue="Disabled value"
              disabled
            />
          </Row>

          <Row label="Success — auto CheckCircle icon">
            <InputField
              label="Email"
              defaultValue="valid@example.com"
              state="success"
              hint="Looks good!"
            />
          </Row>

          <Row label="Warning — auto Warning icon">
            <InputField
              label="Password"
              defaultValue="weak"
              state="warning"
              hint="Password is too weak"
            />
          </Row>

          <Row label="Error — auto WarningCircle icon">
            <InputField
              label="Email"
              defaultValue="not-an-email"
              state="error"
              hint="Invalid email address"
            />
          </Row>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 3 — InputField slot combinations
        ═══════════════════════════════════════════════════════════════════ */}
        <Section title="3 · InputField — slot combinations">

          {/* Icon slots */}
          <Row label="Leading icon">
            <InputField
              label="Search"
              placeholder="Search…"
              leadingIcon={<Icon name="MagnifyingGlass" size="md" />}
            />
          </Row>

          <Row label="Trailing icon (custom, overrides state icon)">
            <InputField
              label="Password"
              placeholder="Enter password"
              type="password"
              trailingIcon={<Icon name="Eye" size="md" />}
            />
          </Row>

          <Row label="Both icons">
            <InputField
              label="Search"
              placeholder="Search by name…"
              leadingIcon={<Icon name="MagnifyingGlass" size="md" />}
              trailingIcon={<Icon name="X" size="md" />}
            />
          </Row>

          {/* Label slots — no separator */}
          <Row label="Leading label (no separator)">
            <InputField
              label="Amount"
              placeholder="0.00"
              leadingLabel={
                <Label label="USD" size="md" type="secondaryAction" />
              }
            />
          </Row>

          <Row label="Trailing label (no separator)">
            <InputField
              label="Weight"
              placeholder="Enter value"
              trailingLabel={
                <Label label="kg" size="md" type="information" />
              }
            />
          </Row>

          {/* Label slots — with separator */}
          <Row label="Leading label + separator">
            <InputField
              label="Amount"
              placeholder="0.00"
              leadingLabel={
                <Label label="USD" size="md" type="secondaryAction" />
              }
              leadingSeparator
            />
          </Row>

          <Row label="Trailing label + separator">
            <InputField
              label="Price"
              placeholder="Enter amount"
              trailingLabel={
                <Label label="per unit" size="md" type="information" />
              }
              trailingSeparator
            />
          </Row>

          {/* Both label slots */}
          <Row label="Leading + trailing labels (with separators)">
            <InputField
              label="Exchange"
              placeholder="0.00"
              leadingLabel={
                <Label label="From" size="md" type="secondaryAction" />
              }
              trailingLabel={
                <Label
                  label="USD"
                  size="md"
                  type="brandInteractive"
                  trailingIcon={<Icon name="CaretDown" size="md" />}
                />
              }
              leadingSeparator
              trailingSeparator
            />
          </Row>

          {/* Label slot with icon + state */}
          <Row label="Leading label + trailing state icon (success)">
            <InputField
              label="Currency"
              defaultValue="100"
              state="success"
              hint="Valid amount"
              leadingLabel={
                <Label
                  label="USD"
                  size="md"
                  type="secondaryAction"
                  leadingIcon={<Icon name="CurrencyDollar" size="md" />}
                />
              }
              leadingSeparator
            />
          </Row>

          <Row label="Trailing label overrides state icon">
            <InputField
              label="Currency"
              defaultValue="not-a-number"
              state="error"
              hint="Must be a number"
              trailingLabel={
                <Label label="Clear" size="md" type="information" />
              }
              trailingSeparator
            />
          </Row>

          {/* Full combinatorial showcase */}
          <Row label="Full: leading icon + leading label/sep + trailing label/sep + trailing icon">
            <InputField
              label="Full-slot demo"
              placeholder="0.00"
              leadingIcon={<Icon name="Tag" size="md" />}
              leadingLabel={
                <Label label="From" size="md" type="secondaryAction" />
              }
              trailingLabel={
                <Label label="USD" size="md" type="brandInteractive" />
              }
              trailingIcon={<Icon name="CaretDown" size="md" />}
              leadingSeparator
              trailingSeparator
            />
          </Row>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 4 — TextField (multiline)
        ═══════════════════════════════════════════════════════════════════ */}
        <Section title="4 · TextField — multiline">

          <Row label="Default">
            <TextField
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              label="Bio"
              placeholder="Tell us about yourself…"
            />
          </Row>

          <Row label="Success">
            <TextField
              label="Note"
              defaultValue="Great content here. All is well."
              state="success"
              hint="Looks good!"
            />
          </Row>

          <Row label="Warning">
            <TextField
              label="Description"
              defaultValue="Too brief."
              state="warning"
              hint="Please provide at least 20 characters"
            />
          </Row>

          <Row label="Error">
            <TextField
              label="Message"
              defaultValue=""
              state="error"
              hint="This field is required"
            />
          </Row>

          <Row label="Disabled">
            <TextField
              label="Bio"
              defaultValue="You cannot edit this."
              disabled
            />
          </Row>

          <Row label="Tall (8 rows)">
            <TextField
              label="Long content"
              placeholder="Write as much as you need…"
              rows={8}
            />
          </Row>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 5 — Pickers in InputField
        ═══════════════════════════════════════════════════════════════════ */}
        <Section title="5 · InputField — with Pickers">

          <Row label="Leading picker (currency selector)">
            <InputField
              label="Amount"
              placeholder="0.00"
              leadingPicker={
                <AppNativePicker
                  label="Currency"
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { label: "USD", value: "usd" },
                    { label: "EUR", value: "eur" },
                    { label: "GBP", value: "gbp" },
                    { label: "INR", value: "inr" },
                  ]}
                  embedded
                />
              }
              leadingSeparator
            />
          </Row>

          <Row label="Trailing picker (country selector)">
            <InputField
              label="Phone"
              placeholder="Enter phone number"
              leadingIcon={<Icon name="Phone" size="md" />}
              trailingPicker={
                <AppNativePicker
                  label="Country"
                  value={country}
                  onChange={setCountry}
                  options={[
                    { label: "US", value: "us" },
                    { label: "UK", value: "uk" },
                    { label: "IN", value: "in" },
                    { label: "DE", value: "de" },
                  ]}
                  embedded
                />
              }
              trailingSeparator
            />
          </Row>

          <Row label="Both pickers (currency conversion)">
            <InputField
              label="Convert"
              placeholder="0.00"
              leadingPicker={
                <AppNativePicker
                  label="From"
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { label: "USD", value: "usd" },
                    { label: "EUR", value: "eur" },
                    { label: "GBP", value: "gbp" },
                  ]}
                  embedded
                />
              }
              trailingPicker={
                <AppNativePicker
                  label="To"
                  value={country}
                  onChange={setCountry}
                  options={[
                    { label: "INR", value: "in" },
                    { label: "JPY", value: "de" },
                    { label: "AUD", value: "uk" },
                  ]}
                  embedded
                />
              }
              leadingSeparator
              trailingSeparator
            />
          </Row>

          <Row label="Picker with validation (error state)">
            <InputField
              label="Budget"
              defaultValue="abc"
              state="error"
              hint="Enter a valid number"
              leadingPicker={
                <AppNativePicker
                  label="Currency"
                  value={currency}
                  onChange={setCurrency}
                  options={[
                    { label: "USD", value: "usd" },
                    { label: "EUR", value: "eur" },
                  ]}
                  embedded
                />
              }
              leadingSeparator
            />
          </Row>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 6 — Standalone Pickers
        ═══════════════════════════════════════════════════════════════════ */}
        <Section title="6 · Standalone Pickers">

          <Row label="Native Picker — default (chipTabs)">
            <AppNativePicker
              label="Favorite fruit"
              value={currency}
              onChange={setCurrency}
              options={[
                { label: "Apple", value: "usd" },
                { label: "Banana", value: "eur" },
                { label: "Cherry", value: "gbp" },
                { label: "Date", value: "inr" },
              ]}
            />
          </Row>

          <Row label="Native Picker — filters variant">
            <AppNativePicker
              label="Sort by"
              value={country}
              onChange={setCountry}
              options={[
                { label: "Newest", value: "us" },
                { label: "Oldest", value: "uk" },
                { label: "Popular", value: "in" },
              ]}
              variant="filters"
            />
          </Row>

          <Row label="Native Picker — medium size">
            <AppNativePicker
              label="Category"
              value={currency}
              onChange={setCurrency}
              options={[
                { label: "Design", value: "usd" },
                { label: "Development", value: "eur" },
                { label: "Marketing", value: "gbp" },
              ]}
              size="md"
            />
          </Row>

          <Row label="Native Picker — error state">
            <AppNativePicker
              label="Required field"
              value=""
              onChange={() => {}}
              options={[
                { label: "Option A", value: "a" },
                { label: "Option B", value: "b" },
              ]}
              placeholder="Select one..."
              showError
              errorMessage="This field is required"
            />
          </Row>

          <Row label="Date Picker — compact">
            <AppDateTimePicker
              label="Start date"
              value={pickerDate}
              onChange={setPickerDate}
              mode="date"
            />
          </Row>

          <Row label="Date & Time Picker">
            <AppDateTimePicker
              label="Event start"
              value={pickerDate}
              onChange={setPickerDate}
              mode="dateAndTime"
            />
          </Row>

          <Row label="Color Picker">
            <AppColorPicker
              label="Theme color"
              value={pickerColor}
              onChange={setPickerColor}
            />
          </Row>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 7 — Range Sliders
        ═══════════════════════════════════════════════════════════════════ */}
        <Section title="7 · Range Sliders">

          <Row label="Price range ($0–$100)">
            <AppRangeSlider
              lowerValue={priceRange[0]}
              upperValue={priceRange[1]}
              onChange={(vals) => setPriceRange(vals)}
              range={[0, 100]}
              step={5}
              showLabels
            />
          </Row>

          <Row label="Age range (0–100, step 1)">
            <AppRangeSlider
              lowerValue={ageRange[0]}
              upperValue={ageRange[1]}
              onChange={(vals) => setAgeRange(vals)}
              range={[0, 100]}
              step={1}
              showLabels
            />
          </Row>

          <Row label="Single value (lower pinned at 0)">
            <AppRangeSlider
              lowerValue={singleSlider[0]}
              upperValue={singleSlider[1]}
              onChange={(vals) => setSingleSlider(vals)}
              range={[0, 100]}
              step={10}
              showLabels
            />
          </Row>
        </Section>

        {/* ═══════════════════════════════════════════════════════════════════
            SECTION 8 — Bottom Sheets
        ═══════════════════════════════════════════════════════════════════ */}
        <Section title="8 · Bottom Sheets">

          <Row label="Basic bottom sheet">
            <Button
              label="Open Sheet"
              variant="secondary"
              size="md"
              onClick={() => setSheetOpen(true)}
            />
            <AppBottomSheet
              isPresented={sheetOpen}
              onClose={() => setSheetOpen(false)}
              title="Basic Sheet"
              description="This is a simple bottom sheet example."
            >
              <div className="p-[var(--space-4)] flex flex-col gap-[var(--space-3)]">
                <p className="text-[length:var(--typography-body-md-size)] text-[var(--typography-primary)]">
                  Bottom sheets slide up from the bottom of the screen. They can contain any content.
                </p>
                <Button
                  label="Close"
                  variant="primary"
                  size="md"
                  onClick={() => setSheetOpen(false)}
                />
              </div>
            </AppBottomSheet>
          </Row>

          <Row label="Form in bottom sheet">
            <Button
              label="Open Form Sheet"
              variant="secondary"
              size="md"
              onClick={() => setFormSheetOpen(true)}
            />
            <AppBottomSheet
              isPresented={formSheetOpen}
              onClose={() => setFormSheetOpen(false)}
              title="Add Item"
              description="Fill in the details below."
            >
              <div className="p-[var(--space-4)] flex flex-col gap-[var(--space-4)]">
                <InputField
                  label="Name"
                  placeholder="Enter item name"
                />
                <InputField
                  label="Price"
                  placeholder="0.00"
                  leadingPicker={
                    <AppNativePicker
                      label="Currency"
                      value={currency}
                      onChange={setCurrency}
                      options={[
                        { label: "USD", value: "usd" },
                        { label: "EUR", value: "eur" },
                      ]}
                      embedded
                    />
                  }
                  leadingSeparator
                />
                <TextField
                  label="Description"
                  placeholder="Describe the item..."
                  rows={3}
                />
                <div className="flex gap-[var(--space-3)]">
                  <Button
                    label="Cancel"
                    variant="tertiary"
                    size="md"
                    onClick={() => setFormSheetOpen(false)}
                    className="flex-1"
                  />
                  <Button
                    label="Save"
                    variant="primary"
                    size="md"
                    onClick={() => setFormSheetOpen(false)}
                    className="flex-1"
                  />
                </div>
              </div>
            </AppBottomSheet>
          </Row>
        </Section>

      </div>
    </main>
  );
}
