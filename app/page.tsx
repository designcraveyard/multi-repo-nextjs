"use client";

import { useState } from "react";
import { Button } from "@/app/components/Button";
import { IconButton } from "@/app/components/IconButton";
import { Icon } from "@/app/components/icons";

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-[length:var(--typography-label-sm-size)] font-[var(--typography-label-sm-weight)] uppercase tracking-widest text-[var(--typography-muted)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

// ─── Row helper ───────────────────────────────────────────────────────────────

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ComponentShowcase() {
  const [loadingBtn, setLoadingBtn] = useState(false);

  function triggerLoading() {
    setLoadingBtn(true);
    setTimeout(() => setLoadingBtn(false), 2000);
  }

  return (
    <div className="min-h-screen bg-[var(--surfaces-base-primary)] px-6 py-12">
      <div className="mx-auto max-w-2xl flex flex-col gap-12">

        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-[var(--typography-brand)]">
            Component Showcase
          </h1>
          <p className="text-[var(--typography-muted)] text-sm">
            Live preview of all design-system components.
          </p>
        </div>

        {/* ── Button: Variants ─────────────────────────────────────────────── */}
        <Section title="Button — Variants">
          <Row>
            <Button label="Primary" variant="primary" />
            <Button label="Secondary" variant="secondary" />
            <Button label="Tertiary" variant="tertiary" />
            <Button label="Success" variant="success" />
            <Button label="Danger" variant="danger" />
          </Row>
        </Section>

        {/* ── Button: Sizes ────────────────────────────────────────────────── */}
        <Section title="Button — Sizes">
          <Row>
            <Button label="Large" variant="primary" size="lg" />
            <Button label="Medium" variant="primary" size="md" />
            <Button label="Small" variant="primary" size="sm" />
          </Row>
        </Section>

        {/* ── Button: Icons ────────────────────────────────────────────────── */}
        <Section title="Button — Icons">
          <Row>
            <Button
              label="Leading"
              variant="primary"
              leadingIcon={<Icon name="House" size="md" />}
            />
            <Button
              label="Trailing"
              variant="secondary"
              trailingIcon={<Icon name="ArrowRight" size="md" />}
            />
            <Button
              label="Both"
              variant="tertiary"
              leadingIcon={<Icon name="Star" size="md" />}
              trailingIcon={<Icon name="ArrowRight" size="md" />}
            />
            <Button
              label="Delete"
              variant="danger"
              leadingIcon={<Icon name="Trash" size="md" />}
            />
          </Row>
        </Section>

        {/* ── Button: States ───────────────────────────────────────────────── */}
        <Section title="Button — States">
          <Row>
            <Button
              label={loadingBtn ? "Loading…" : "Click to Load"}
              variant="primary"
              isLoading={loadingBtn}
              onClick={triggerLoading}
            />
            <Button label="Disabled" variant="primary" disabled />
            <Button label="Disabled" variant="danger" disabled />
            <Button label="Disabled" variant="tertiary" disabled />
          </Row>
        </Section>

        {/* ── IconButton: Variants ─────────────────────────────────────────── */}
        <Section title="IconButton — Variants">
          <Row>
            <IconButton icon={<Icon name="Heart" />}      label="Like"    variant="primary"     />
            <IconButton icon={<Icon name="Bookmark" />}   label="Save"    variant="secondary"   />
            <IconButton icon={<Icon name="Share" />}      label="Share"   variant="tertiary"    />
            <IconButton icon={<Icon name="DotsThree" />}  label="More"    variant="quarternary" />
            <IconButton icon={<Icon name="Check" />}      label="Confirm" variant="success"     />
            <IconButton icon={<Icon name="Trash" />}      label="Delete"  variant="danger"      />
          </Row>
        </Section>

        {/* ── IconButton: Sizes ─────────────────────────────────────────────── */}
        <Section title="IconButton — Sizes">
          <Row>
            <IconButton icon={<Icon name="Star" />} label="Favourite" variant="primary" size="lg" />
            <IconButton icon={<Icon name="Star" />} label="Favourite" variant="primary" size="md" />
            <IconButton icon={<Icon name="Star" />} label="Favourite" variant="primary" size="sm" />
          </Row>
        </Section>

        {/* ── IconButton: States ───────────────────────────────────────────── */}
        <Section title="IconButton — States">
          <Row>
            <IconButton icon={<Icon name="Heart" />} label="Loading"  variant="primary" isLoading />
            <IconButton icon={<Icon name="Heart" />} label="Disabled" variant="primary" disabled  />
            <IconButton icon={<Icon name="Trash" />} label="Disabled" variant="danger"  disabled  />
            <IconButton icon={<Icon name="Share" />} label="Disabled" variant="tertiary" disabled />
          </Row>
        </Section>

        {/* ── Icons ────────────────────────────────────────────────────────── */}
        <Section title="Icons — Sizes">
          <Row>
            {(["xs", "sm", "md", "lg", "xl"] as const).map((s) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <Icon name="House" size={s} color="var(--icon-primary)" />
                <span className="text-[10px] text-[var(--typography-muted)]">{s}</span>
              </div>
            ))}
          </Row>
        </Section>

        <Section title="Icons — Weights">
          <Row>
            {(["thin", "light", "regular", "bold", "fill", "duotone"] as const).map((w) => (
              <div key={w} className="flex flex-col items-center gap-1">
                <Icon name="Heart" weight={w} size="lg" color="var(--icon-primary)" />
                <span className="text-[10px] text-[var(--typography-muted)]">{w}</span>
              </div>
            ))}
          </Row>
        </Section>

      </div>
    </div>
  );
}
