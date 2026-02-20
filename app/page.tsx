"use client";

import { useState } from "react";
import { Button } from "@/app/components/Button";
import { IconButton } from "@/app/components/IconButton";
import { Icon } from "@/app/components/icons";
import { Chip } from "@/app/components/Chip";
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { SegmentControlBar } from "@/app/components/SegmentControlBar";
import { Divider } from "@/app/components/Divider";
import { Toast, ToastContainer } from "@/app/components/Toast";
import { Badge } from "@/app/components/Badge";
import { InputField, TextField } from "@/app/components/InputField";
import { Thumbnail } from "@/app/components/Thumbnail";

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

  // Tabs
  const [activeTab, setActiveTab] = useState("design");

  // SegmentControlBar
  const [segSelected, setSegSelected] = useState("week");
  const [chipSelected, setChipSelected] = useState("all");
  const [filterSelected, setFilterSelected] = useState<string[]>(["ios"]);

  // Chip
  const [activeChip, setActiveChip] = useState("design");
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(["bold"]));

  // Toast
  const [toasts, setToasts] = useState<
    { id: number; variant: "default" | "success" | "warning" | "error" | "info"; message: string }[]
  >([]);
  let nextId = 0;
  function showToast(variant: "default" | "success" | "warning" | "error" | "info", message: string) {
    const id = ++nextId;
    setToasts((prev) => [...prev, { id, variant, message }]);
  }
  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // InputField
  const [name, setName] = useState("");
  const [email, setEmail] = useState("user@example");
  const [bio, setBio] = useState("");

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

        {/* ── Badge ────────────────────────────────────────────────────────── */}
        <Section title="Badge — Solid">
          <Row>
            <Badge label="Brand"   type="brand" />
            <Badge label="Success" type="success" />
            <Badge label="Error"   type="error" />
            <Badge label="Accent"  type="accent" />
          </Row>
        </Section>

        <Section title="Badge — Subtle">
          <Row>
            <Badge label="Brand"   type="brand"   subtle />
            <Badge label="Success" type="success" subtle />
            <Badge label="Error"   type="error"   subtle />
            <Badge label="Accent"  type="accent"  subtle />
          </Row>
        </Section>

        <Section title="Badge — Number / Tiny">
          <Row>
            <Badge label="3"  size="number" type="brand" />
            <Badge label="12" size="number" type="error" />
            <Badge label="99" size="number" type="success" />
            <Badge size="tiny" type="brand" />
            <Badge size="tiny" type="error" />
            <Badge size="tiny" type="success" />
          </Row>
        </Section>

        {/* ── Chip ─────────────────────────────────────────────────────────── */}
        <Section title="Chip — ChipTabs (single-select)">
          <Row>
            {["design", "code", "product"].map((id) => (
              <Chip
                key={id}
                label={id.charAt(0).toUpperCase() + id.slice(1)}
                variant="chipTabs"
                isActive={activeChip === id}
                onClick={() => setActiveChip(id)}
              />
            ))}
          </Row>
        </Section>

        <Section title="Chip — Filters (multi-select)">
          <Row>
            {["bold", "italic", "underline"].map((id) => (
              <Chip
                key={id}
                label={id.charAt(0).toUpperCase() + id.slice(1)}
                variant="filters"
                isActive={activeFilters.has(id)}
                onClick={() =>
                  setActiveFilters((prev) => {
                    const next = new Set(prev);
                    next.has(id) ? next.delete(id) : next.add(id);
                    return next;
                  })
                }
              />
            ))}
          </Row>
        </Section>

        <Section title="Chip — Disabled">
          <Row>
            <Chip label="Active + disabled" variant="chipTabs" isActive disabled />
            <Chip label="Inactive + disabled" variant="filters" disabled />
          </Row>
        </Section>

        {/* ── Tabs ─────────────────────────────────────────────────────────── */}
        <Section title="Tabs — Animated indicator">
          <Tabs
            items={[
              { id: "design", label: "Design" },
              { id: "code",   label: "Code" },
              { id: "preview", label: "Preview" },
            ]}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
          <TabPanel activeTab={activeTab} id="design">
            <p className="text-sm text-[var(--typography-secondary)]">Design tab content</p>
          </TabPanel>
          <TabPanel activeTab={activeTab} id="code">
            <p className="text-sm text-[var(--typography-secondary)]">Code tab content</p>
          </TabPanel>
          <TabPanel activeTab={activeTab} id="preview">
            <p className="text-sm text-[var(--typography-secondary)]">Preview tab content</p>
          </TabPanel>
        </Section>

        <Section title="Tabs — Sizes">
          <div className="flex flex-col gap-4">
            {(["sm", "md", "lg"] as const).map((sz) => (
              <Tabs
                key={sz}
                size={sz}
                items={[
                  { id: "a", label: "Week" },
                  { id: "b", label: "Month" },
                  { id: "c", label: "Year" },
                ]}
                activeTab="a"
                onChange={() => {}}
              />
            ))}
          </div>
        </Section>

        {/* ── SegmentControlBar ────────────────────────────────────────────── */}
        <Section title="SegmentControlBar — Segment">
          <SegmentControlBar
            items={[
              { id: "week",  label: "Week" },
              { id: "month", label: "Month" },
              { id: "year",  label: "Year" },
            ]}
            value={segSelected}
            onChange={(v) => setSegSelected(v as string)}
            type="segmentControl"
          />
        </Section>

        <Section title="SegmentControlBar — Chips (single-select)">
          <SegmentControlBar
            items={[
              { id: "all",    label: "All" },
              { id: "design", label: "Design" },
              { id: "code",   label: "Code" },
            ]}
            value={chipSelected}
            onChange={(v) => setChipSelected(v as string)}
            type="chips"
          />
        </Section>

        <Section title="SegmentControlBar — Filters (multi-select)">
          <SegmentControlBar
            items={[
              { id: "ios",     label: "iOS" },
              { id: "android", label: "Android" },
              { id: "web",     label: "Web" },
            ]}
            value={filterSelected}
            onChange={(id) =>
              setFilterSelected((prev) =>
                prev.includes(id as string) ? prev.filter((x) => x !== id) : [...prev, id as string]
              )
            }
            type="filters"
          />
        </Section>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <Section title="Divider">
          <div className="flex flex-col gap-4">
            <div>
              <p className="text-xs text-[var(--typography-muted)] mb-2">Row (default)</p>
              <p className="text-sm text-[var(--typography-primary)]">Item A</p>
              <Divider type="row" className="my-2" />
              <p className="text-sm text-[var(--typography-primary)]">Item B</p>
              <Divider type="row" className="my-2" />
              <p className="text-sm text-[var(--typography-primary)]">Item C</p>
            </div>
            <div>
              <p className="text-xs text-[var(--typography-muted)] mb-2">Section</p>
              <Divider type="section" />
            </div>
            <div>
              <p className="text-xs text-[var(--typography-muted)] mb-2">Labeled</p>
              <Divider type="section" label="or" />
            </div>
            <div>
              <p className="text-xs text-[var(--typography-muted)] mb-2">Vertical</p>
              <div className="flex items-center gap-3 h-6">
                <span className="text-sm text-[var(--typography-primary)]">Left</span>
                <Divider orientation="vertical" type="row" />
                <span className="text-sm text-[var(--typography-primary)]">Right</span>
              </div>
            </div>
          </div>
        </Section>

        {/* ── Toast ────────────────────────────────────────────────────────── */}
        <Section title="Toast">
          <div className="flex flex-col gap-3">
            <Toast variant="default" message="Settings saved" dismissible onDismiss={() => {}} />
            <Toast variant="success" message="Upload complete!" description="Your file is ready to share." />
            <Toast variant="warning" message="Connection unstable" actionLabel="Retry" onAction={() => {}} />
            <Toast variant="error"   message="Failed to save" description="Check your connection." dismissible onDismiss={() => {}} />
            <Toast variant="info"    message="New update available" actionLabel="Update now" onAction={() => {}} />
          </div>
          <p className="text-xs text-[var(--typography-muted)] mt-1">Live toasts (tap triggers):</p>
          <Row>
            {(["default", "success", "warning", "error", "info"] as const).map((v) => (
              <Button
                key={v}
                label={v.charAt(0).toUpperCase() + v.slice(1)}
                variant="secondary"
                size="sm"
                onClick={() => showToast(v, `${v.charAt(0).toUpperCase() + v.slice(1)} toast`)}
              />
            ))}
          </Row>
        </Section>

        {/* ── Input Field ──────────────────────────────────────────────────── */}
        <Section title="Input Field">
          <InputField
            id="name"
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <InputField
            id="email-success"
            label="Email"
            value="user@example.com"
            state="success"
            hint="Looks good!"
            onChange={() => {}}
          />
          <InputField
            id="email-error"
            label="Email"
            value={email}
            state="error"
            hint="Please enter a valid email address"
            onChange={(e) => setEmail(e.target.value)}
          />
          <InputField
            id="password"
            label="Password"
            placeholder="Enter password"
            state="warning"
            hint="Weak password"
            value=""
            onChange={() => {}}
          />
          <InputField
            id="disabled"
            label="Disabled"
            value="Disabled value"
            disabled
            onChange={() => {}}
          />
          <TextField
            id="bio"
            label="Bio"
            placeholder="Tell us about yourself…"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
          />
        </Section>

        {/* ── Thumbnail ────────────────────────────────────────────────────── */}
        <Section title="Thumbnail — Sizes (square)">
          <Row>
            {(["xs", "sm", "md", "lg", "xl", "xxl"] as const).map((sz) => (
              <div key={sz} className="flex flex-col items-center gap-1">
                <Thumbnail alt="Avatar" size={sz} />
                <span className="text-[10px] text-[var(--typography-muted)]">{sz}</span>
              </div>
            ))}
          </Row>
        </Section>

        <Section title="Thumbnail — Sizes (rounded)">
          <Row>
            {(["xs", "sm", "md", "lg", "xl", "xxl"] as const).map((sz) => (
              <div key={sz} className="flex flex-col items-center gap-1">
                <Thumbnail alt="Avatar" size={sz} rounded />
                <span className="text-[10px] text-[var(--typography-muted)]">{sz}</span>
              </div>
            ))}
          </Row>
        </Section>

        <Section title="Thumbnail — Initials fallback">
          <Row>
            <Thumbnail alt="Alice Brown" size="lg" rounded>AB</Thumbnail>
            <Thumbnail alt="John Doe"    size="xl" rounded>JD</Thumbnail>
            <Thumbnail alt="Maria Kim"   size="xxl">MK</Thumbnail>
          </Row>
        </Section>

      </div>

      {/* ── Live Toast container ─────────────────────────────────────────── */}
      <ToastContainer position="bottom-center">
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            message={t.message}
            dismissible
            duration={3000}
            onDismiss={() => dismissToast(t.id)}
          />
        ))}
      </ToastContainer>
    </div>
  );
}
