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

      </div>
    </main>
  );
}
