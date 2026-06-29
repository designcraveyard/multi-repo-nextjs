"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdaptiveNavShell, type NavTab } from "@/app/components/Adaptive";
import { Badge } from "@/app/components/Badge";
import { Button } from "@/app/components/Button";
import { Checkbox } from "@/app/components/Checkbox";
import { Chip } from "@/app/components/Chip";
import { DateGrid, DateItem } from "@/app/components/DateGrid";
import { Divider } from "@/app/components/Divider";
import { IconButton } from "@/app/components/IconButton";
import { Icon } from "@/app/components/icons";
import { InputField, TextField } from "@/app/components/InputField";
import { Label } from "@/app/components/Label";
import {
  AppActionSheet,
  AppAlertPopup,
  AppBottomSheet,
  AppCarousel,
  AppColorPicker,
  AppContextMenu,
  AppDateTimePicker,
  AppNativePicker,
  AppProgressLoader,
  AppRangeSlider,
  AppTooltip,
} from "@/app/components/Native";
import { RadioButton, RadioGroup } from "@/app/components/RadioButton";
import { SegmentControlBar } from "@/app/components/SegmentControlBar";
import { Switch } from "@/app/components/Switch";
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { Thumbnail } from "@/app/components/Thumbnail";
import { Toast, ToastContainer } from "@/app/components/Toast";
import { ListItem } from "@/app/components/patterns/ListItem";
import { StepIndicator } from "@/app/components/patterns/StepIndicator";
import { Stepper } from "@/app/components/patterns/Stepper";
import { TextBlock } from "@/app/components/patterns/TextBlock";

const SHOWCASE_DATE = new Date(2026, 5, 14, 13, 0, 0);

const SHELL_TABS = [
  { id: 0, label: "Components", icon: "SquaresFour" },
  { id: 1, label: "Home", icon: "House" },
  { id: 2, label: "Editor", icon: "PencilSimple" },
  { id: 3, label: "AI Demo", icon: "Sparkle" },
  { id: 4, label: "Login", icon: "User" },
] satisfies NavTab[];

const SHELL_ROUTES: Record<number, string> = {
  0: "/components-showcase",
  1: "/",
  2: "/editor-demo",
  3: "/ai-demo",
  4: "/login",
};

function ShowcaseSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 overflow-x-clip flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--border-muted)] bg-[var(--surfaces-base-primary)] p-[var(--space-4)]">
      <h2 className="text-[length:var(--typography-title-sm-size)] font-[var(--typography-title-sm-weight)] leading-[var(--typography-title-sm-leading)] text-[var(--typography-primary)]">
        {title}
      </h2>
      <div className="flex flex-col gap-[var(--space-3)]">{children}</div>
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0 flex flex-wrap items-center gap-[var(--space-2)]">{children}</div>;
}

function Surface({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[var(--radius-md)] bg-[var(--surfaces-base-low-contrast)] p-[var(--space-4)]">{children}</div>;
}

function SampleSlide({ title }: { title: string }) {
  return (
    <div className="flex h-32 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surfaces-brand-interactive-low-contrast)] text-[var(--typography-brand)]">
      <TextBlock title={title} body="Carousel item" />
    </div>
  );
}

// responsive: N/A - component inventory page with component-specific responsive examples
export default function ComponentsShowcasePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>(SHOWCASE_DATE);
  const [radioValue, setRadioValue] = useState("email");
  const [checks, setChecks] = useState({ notifications: true, updates: false, marketing: false });
  const [switches, setSwitches] = useState({ dark: false, notifications: true, location: false });
  const [activeTab, setActiveTab] = useState("design");
  const [segmentValue, setSegmentValue] = useState<string | string[]>("week");
  const [chipValue, setChipValue] = useState<string | string[]>("design");
  const [filterValue, setFilterValue] = useState<string | string[]>(["bold"]);
  const [pickerValue, setPickerValue] = useState("IN");
  const [dateTime, setDateTime] = useState<Date>(SHOWCASE_DATE);
  const [colorValue, setColorValue] = useState("#3b82f6");
  const [rangeValue, setRangeValue] = useState<[number, number]>([20, 80]);
  const [stepRangeValue, setStepRangeValue] = useState<[number, number]>([10, 60]);
  const [sheet, setSheet] = useState<"default" | "small" | "form" | "list" | null>(null);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [liveToast, setLiveToast] = useState<{
    message: string;
    description: string;
    variant: "default" | "success" | "warning" | "error";
  } | null>(null);

  const tabs = [
    { id: "design", label: "Design", icon: <Icon name="Palette" size="sm" /> },
    { id: "code", label: "Code", icon: <Icon name="Code" size="sm" /> },
    { id: "ship", label: "Ship", icon: <Icon name="RocketLaunch" size="sm" /> },
  ];
  const segmentItems = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ];
  const pickerOptions = [
    { label: "India", value: "IN" },
    { label: "Australia", value: "AU" },
    { label: "USA", value: "US" },
  ];
  const carouselItems = useMemo(
    () => [<SampleSlide key="1" title="Card 1" />, <SampleSlide key="2" title="Card 2" />, <SampleSlide key="3" title="Card 3" />],
    []
  );
  const allChecked = checks.notifications && checks.updates && checks.marketing;

  useEffect(() => {
    window.history.scrollRestoration = "manual";
    window.scrollTo({ left: 0, top: 0 });
  }, []);

  const handleShellTabChange = useCallback(
    (tabId: number) => {
      const route = SHELL_ROUTES[tabId];
      if (route && route !== "/components-showcase") {
        router.push(route);
      }
    },
    [router]
  );

  return (
    <AdaptiveNavShell tabs={SHELL_TABS} selectedTab={0} onTabChange={handleShellTabChange}>
      <main className="min-h-screen overflow-x-hidden overscroll-x-none bg-[var(--surfaces-base-primary)] px-[var(--space-4)] py-[var(--space-6)] md:px-[var(--space-8)]">
      <div className="mx-auto flex max-w-5xl min-w-0 flex-col gap-[var(--space-4)]">
        <header className="flex flex-col gap-[var(--space-2)] pb-[var(--space-2)]">
          <h1 className="text-[length:var(--typography-heading-lg-size)] font-[var(--typography-heading-lg-weight)] leading-[var(--typography-heading-lg-leading)] text-[var(--typography-primary)]">
            Components Showcase
          </h1>
        </header>

        <ShowcaseSection title="Button — Variants"><Row>{(["primary", "secondary", "tertiary", "success", "danger"] as const).map((variant) => <Button key={variant} label={variant} variant={variant} size="md" />)}</Row></ShowcaseSection>
        <ShowcaseSection title="Button — Sizes"><Row><Button label="Large" size="lg" /><Button label="Medium" size="md" /><Button label="Small" size="sm" /></Row></ShowcaseSection>
        <ShowcaseSection title="Button — Icons"><Row><Button label="Leading" leadingIcon={<Icon name="House" />} /><Button label="Trailing" variant="secondary" trailingIcon={<Icon name="ArrowRight" />} /><Button label="Both" variant="tertiary" leadingIcon={<Icon name="Star" />} trailingIcon={<Icon name="CaretRight" />} /><Button label="Delete" variant="danger" leadingIcon={<Icon name="Trash" />} /></Row></ShowcaseSection>
        <ShowcaseSection title="Button — States"><Row><Button label="Loading" isLoading /><Button label="Disabled" variant="secondary" disabled /><Button label="Danger disabled" variant="danger" disabled /></Row></ShowcaseSection>

        <ShowcaseSection title="IconButton — Variants"><Row>{(["primary", "secondary", "tertiary", "quarternary", "success", "danger"] as const).map((variant) => <IconButton key={variant} icon={<Icon name={variant === "danger" ? "Trash" : "Star"} />} label={variant} variant={variant} size="md" />)}</Row></ShowcaseSection>
        <ShowcaseSection title="IconButton — Sizes"><Row><IconButton icon={<Icon name="Heart" />} label="Large" size="lg" /><IconButton icon={<Icon name="Heart" />} label="Medium" size="md" /><IconButton icon={<Icon name="Heart" />} label="Small" size="sm" /></Row></ShowcaseSection>
        <ShowcaseSection title="IconButton — States"><Row><IconButton icon={<Icon name="ArrowsClockwise" />} label="Loading" isLoading /><IconButton icon={<Icon name="Heart" />} label="Disabled" disabled /><IconButton icon={<Icon name="Trash" />} label="Disabled danger" variant="danger" disabled /></Row></ShowcaseSection>
        <ShowcaseSection title="Icons — Sizes"><Row>{(["xs", "sm", "md", "lg", "xl"] as const).map((size) => <Icon key={size} name="House" size={size} label={size} />)}</Row></ShowcaseSection>
        <ShowcaseSection title="Icons — Weights"><Row>{(["thin", "light", "regular", "bold", "fill", "duotone"] as const).map((weight) => <Icon key={weight} name="Star" weight={weight} size="lg" label={weight} />)}</Row></ShowcaseSection>

        <ShowcaseSection title="Badge — Solid"><Row>{(["brand", "success", "error", "accent"] as const).map((type) => <Badge key={type} type={type} label={type[0].toUpperCase() + type.slice(1)} />)}</Row></ShowcaseSection>
        <ShowcaseSection title="Badge — Subtle"><Row>{(["brand", "success", "error", "accent"] as const).map((type) => <Badge key={type} type={type} label={type[0].toUpperCase() + type.slice(1)} subtle />)}</Row></ShowcaseSection>
        <ShowcaseSection title="Badge — Number / Tiny"><Row><Badge label={3} size="number" /><Badge label={12} size="number" type="error" /><Badge label={99} size="number" type="success" /><Badge size="tiny" /><Badge size="tiny" type="success" /><Badge size="tiny" type="accent" /></Row></ShowcaseSection>

        <ShowcaseSection title="Chip — ChipTabs (single-select)"><Row>{["design", "code", "ship"].map((id) => <Chip key={id} label={id[0].toUpperCase() + id.slice(1)} variant="chipTabs" isActive={chipValue === id} onClick={() => setChipValue(id)} />)}</Row></ShowcaseSection>
        <ShowcaseSection title="Chip — Filters (multi-select)"><Row>{["bold", "italic", "link"].map((id) => <Chip key={id} label={id[0].toUpperCase() + id.slice(1)} variant="filters" isActive={Array.isArray(filterValue) && filterValue.includes(id)} onClick={() => setFilterValue((current) => Array.isArray(current) && current.includes(id) ? current.filter((item) => item !== id) : [...(Array.isArray(current) ? current : []), id])} />)}</Row></ShowcaseSection>
        <ShowcaseSection title="Chip — Disabled"><Row><Chip label="Disabled" disabled /><Chip label="Active disabled" isActive disabled /></Row></ShowcaseSection>
        <ShowcaseSection title="Tabs — Animated indicator"><><Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} /><Surface><TabPanel id={activeTab} activeTab={activeTab}><TextBlock title="Active tab" body={activeTab} /></TabPanel></Surface></></ShowcaseSection>
        <ShowcaseSection title="Tabs — Sizes"><Row><Tabs items={tabs} size="sm" /><Tabs items={tabs} size="md" /><Tabs items={tabs} size="lg" /></Row></ShowcaseSection>
        <ShowcaseSection title="SegmentControlBar — Segment"><SegmentControlBar items={segmentItems} value={segmentValue} onChange={setSegmentValue} /></ShowcaseSection>
        <ShowcaseSection title="SegmentControlBar — Chips"><SegmentControlBar items={segmentItems} type="chips" defaultValue="week" /></ShowcaseSection>
        <ShowcaseSection title="SegmentControlBar — Filters (multi)"><SegmentControlBar items={segmentItems} type="filters" value={filterValue} onChange={setFilterValue} /></ShowcaseSection>
        <ShowcaseSection title="Divider">
          <div className="flex flex-col gap-[var(--space-5)]">
            <div className="flex flex-col gap-[var(--space-2)]">
              <p className="text-[length:var(--typography-caption-md-size)] leading-[var(--typography-caption-md-leading)] text-[var(--typography-muted)]">
                Row divider (default)
              </p>
              <TextBlock title="Item A" />
              <Divider type="row" />
              <TextBlock title="Item B" />
              <Divider type="row" />
              <TextBlock title="Item C" />
            </div>
            <div className="flex flex-col gap-[var(--space-2)]">
              <p className="text-[length:var(--typography-caption-md-size)] leading-[var(--typography-caption-md-leading)] text-[var(--typography-muted)]">
                Section divider
              </p>
              <Divider type="section" />
            </div>
            <div className="flex flex-col gap-[var(--space-2)]">
              <p className="text-[length:var(--typography-caption-md-size)] leading-[var(--typography-caption-md-leading)] text-[var(--typography-muted)]">
                Labeled divider
              </p>
              <Divider type="section" label="or" />
            </div>
            <div className="flex flex-col gap-[var(--space-2)]">
              <p className="text-[length:var(--typography-caption-md-size)] leading-[var(--typography-caption-md-leading)] text-[var(--typography-muted)]">
                Vertical divider
              </p>
              <div className="flex h-8 items-stretch gap-[var(--space-3)]">
                <TextBlock title="Left" />
                <Divider orientation="vertical" />
                <TextBlock title="Right" />
              </div>
            </div>
          </div>
        </ShowcaseSection>

        <ShowcaseSection title="Toast — Variants"><div className="flex flex-col gap-[var(--space-2)]"><Toast message="Settings saved" description="Your preferences have been updated." dismissible /><Toast message="Upload complete!" description="Your file is ready to share." variant="success" /><Toast message="Connection unstable" description="Some changes may take longer to sync." variant="warning" actionLabel="Retry" onAction={() => {}} /><Toast message="Failed to save" description="Check your connection." variant="error" dismissible /></div></ShowcaseSection>
        <ShowcaseSection title="Toast — With buttons"><div className="flex flex-col gap-[var(--space-2)]"><Toast message="Draft archived" description="The post moved to archive." actionLabel="Undo" onAction={() => {}} /><Toast message="Invite sent" description="Team members can respond from email." actionLabel="Manage" onAction={() => {}} dismissible /></div></ShowcaseSection>
        <ShowcaseSection title="Toast — Live trigger"><Row>{([{ message: "Settings saved", description: "Your preferences have been updated.", variant: "default" }, { message: "Upload complete", description: "Your file is ready to share.", variant: "success" }, { message: "Connection error", description: "Check your connection.", variant: "error" }] as const).map((toast) => <Button key={toast.message} label={toast.message} variant="secondary" size="sm" onClick={() => setLiveToast(toast)} />)}</Row></ShowcaseSection>

        <ShowcaseSection title="Input Field"><div className="grid gap-[var(--space-3)] md:grid-cols-2"><InputField label="Full Name" placeholder="Enter your name" type="text" autoComplete="name" /><InputField label="Email" type="email" inputMode="email" defaultValue="user@example.com" state="success" hint="Looks good" /><InputField label="Invite" defaultValue="EXPIRED" state="error" hint="This code is no longer valid" /><InputField label="Disabled" defaultValue="Disabled value" disabled /></div></ShowcaseSection>
        <ShowcaseSection title="Text Field (multiline)"><TextField label="Bio" placeholder="Tell us about yourself" rows={3} /></ShowcaseSection>
        <ShowcaseSection title="TextOnly Field (bare input)"><InputField variant="bare" placeholder="Bare input" /></ShowcaseSection>

        <ShowcaseSection title="Thumbnail — Square"><Row>{(["xs", "sm", "md", "lg", "xl", "xxl"] as const).map((size) => <Thumbnail key={size} size={size} alt={size}>{size.toUpperCase()}</Thumbnail>)}</Row></ShowcaseSection>
        <ShowcaseSection title="Thumbnail — Circular"><Row>{(["xs", "sm", "md", "lg", "xl", "xxl"] as const).map((size) => <Thumbnail key={size} size={size} alt={size} rounded>{size.toUpperCase()}</Thumbnail>)}</Row></ShowcaseSection>
        <ShowcaseSection title="Thumbnail — Initials fallback"><Row><Thumbnail size="lg" alt="Alice Brown" rounded>AB</Thumbnail><Thumbnail size="xl" alt="John Doe" rounded>JD</Thumbnail><Thumbnail size="xxl" alt="Maria Kim">MK</Thumbnail></Row></ShowcaseSection>
        <ShowcaseSection title="Label — Sizes × Types"><div className="flex flex-col gap-[var(--space-3)]">{(["sm", "md", "lg"] as const).map((size) => <Row key={size}>{(["secondaryAction", "primaryAction", "brandInteractive", "information"] as const).map((type) => <Label key={type} size={size} type={type} label={type} />)}</Row>)}</div></ShowcaseSection>
        <ShowcaseSection title="Label — With Icons"><Row><Label label="Large left" size="lg" type="primaryAction" leadingIcon={<Icon name="Check" />} /><Label label="Medium right" size="md" type="information" trailingIcon={<Icon name="CaretRight" />} /><Label label="Small both" size="sm" type="brandInteractive" leadingIcon={<Icon name="Info" />} trailingIcon={<Icon name="CaretRight" />} /></Row></ShowcaseSection>
        <ShowcaseSection title="Input Field — Icon Slots"><div className="grid gap-[var(--space-3)] md:grid-cols-2"><InputField label="Search" leadingIcon={<Icon name="MagnifyingGlass" />} placeholder="Search" /><InputField label="Password" trailingIcon={<Icon name="Info" />} placeholder="Password" /><InputField label="Both icons" defaultValue="query" leadingIcon={<Icon name="MagnifyingGlass" />} trailingIcon={<Icon name="X" />} /></div></ShowcaseSection>
        <ShowcaseSection title="Input Field — Picker Slots"><div className="grid gap-[var(--space-3)] md:grid-cols-2"><InputField label="Amount" defaultValue="42" leadingPicker={<AppNativePicker embedded value={pickerValue} onChange={setPickerValue} options={pickerOptions} />} leadingSeparator /><InputField label="Unit" defaultValue="12" trailingPicker={<AppNativePicker embedded value={pickerValue} onChange={setPickerValue} options={pickerOptions} />} trailingSeparator /></div></ShowcaseSection>
        <ShowcaseSection title="Input Field — Static Labels"><div className="grid gap-[var(--space-3)] md:grid-cols-2"><InputField label="Amount" defaultValue="42.00" leadingLabel={<Label label="USD" />} leadingSeparator /><InputField label="Invite" defaultValue="abhishek" trailingLabel={<Label label=".com" />} trailingSeparator /></div></ShowcaseSection>
        <ShowcaseSection title="Form — Pickers + Input Fields"><div className="grid gap-[var(--space-3)] md:grid-cols-2"><InputField label="Full Name" type="text" autoComplete="name" leadingIcon={<Icon name="User" />} /><InputField label="Email" type="email" inputMode="email" leadingIcon={<Icon name="Envelope" />} /><InputField label="Phone" type="tel" inputMode="tel" leadingIcon={<Icon name="Phone" />} /><AppNativePicker label="Country" value={pickerValue} onChange={setPickerValue} options={pickerOptions} /><AppDateTimePicker label="Date of Birth" value={dateTime} onChange={setDateTime} /></div></ShowcaseSection>

        <ShowcaseSection title="TextBlock — All slots"><TextBlock overline="Recent" title="Trip planning" subtext="Updated 2 hours ago" body="A compact text stack." metadata="Owner: Abhishek" /></ShowcaseSection>
        <ShowcaseSection title="TextBlock — Combinations"><div className="grid gap-[var(--space-3)] md:grid-cols-2"><TextBlock title="Title only" /><TextBlock title="Title and body" body="Supporting copy." /></div></ShowcaseSection>
        <ShowcaseSection title="StepIndicator"><Row><StepIndicator completed /><StepIndicator /></Row></ShowcaseSection>
        <ShowcaseSection title="Stepper — All completed"><Stepper steps={[{ title: "Draft", completed: true }, { title: "Review", completed: true }, { title: "Publish", completed: true }]} /></ShowcaseSection>
        <ShowcaseSection title="Stepper — Mixed state"><Stepper steps={[{ title: "Draft", completed: true }, { title: "Review", subtitle: "In progress", completed: true }, { title: "Publish" }]} /></ShowcaseSection>
        <ShowcaseSection title="Stepper — Single step with body"><Stepper steps={[{ title: "Review", subtitle: "In progress", body: "Design and copy review are underway." }]} /></ShowcaseSection>
        <ShowcaseSection title="ListItem — Variants"><div className="flex flex-col gap-[var(--space-2)]"><ListItem title="Project Alpha" subtitle="Badge trailing slot" body="List item composition." trailing={{ type: "badge", label: "New", badgeVariant: "accent" }} divider /><ListItem title="Select all" trailing={{ type: "checkbox", checked: allChecked, onChange: (checked) => setChecks({ notifications: checked, updates: checked, marketing: checked }) }} divider /><ListItem title="Notifications" trailing={{ type: "switch", checked: switches.notifications, onChange: (checked) => setSwitches((next) => ({ ...next, notifications: checked })) }} /></div></ShowcaseSection>

        <ShowcaseSection title="Radio Buttons — Standalone"><Row><RadioButton value="email" checked={radioValue === "email"} onChange={() => setRadioValue("email")} label="Email" /><RadioButton value="sms" checked={radioValue === "sms"} onChange={() => setRadioValue("sms")} label="SMS" /><RadioButton value="disabled-selected" checked disabled label="Disabled selected" /></Row></ShowcaseSection>
        <ShowcaseSection title="Radio Buttons — Group"><RadioGroup value={radioValue} onChange={setRadioValue}><RadioButton value="email" label="Email" /><RadioButton value="sms" label="SMS" /><RadioButton value="push" label="Push" /></RadioGroup></ShowcaseSection>
        <ShowcaseSection title="Radio Buttons — As ListItem"><ListItem title="Email updates" trailing={{ type: "radio", checked: radioValue === "email", onChange: () => setRadioValue("email") }} /></ShowcaseSection>
        <ShowcaseSection title="Checkboxes — Standalone"><Row><Checkbox checked label="Checked" /><Checkbox indeterminate label="Indeterminate" /><Checkbox label="Unchecked" /></Row></ShowcaseSection>
        <ShowcaseSection title="Checkboxes — Email Preferences"><div className="flex flex-col gap-[var(--space-2)]"><Checkbox checked={checks.notifications} onChange={(notifications) => setChecks((next) => ({ ...next, notifications }))} label="Notifications" /><Checkbox checked={checks.updates} onChange={(updates) => setChecks((next) => ({ ...next, updates }))} label="Product updates" /><Checkbox checked={checks.marketing} onChange={(marketing) => setChecks((next) => ({ ...next, marketing }))} label="Marketing" /></div></ShowcaseSection>
        <ShowcaseSection title="Switches — Standalone"><Row><Switch checked={switches.dark} onChange={(dark) => setSwitches((next) => ({ ...next, dark }))} label="Dark mode" /><Switch checked label="On" /><Switch checked disabled label="Disabled on" /></Row></ShowcaseSection>
        <ShowcaseSection title="Switches — Settings"><div className="flex flex-col gap-[var(--space-2)]"><Switch checked={switches.notifications} onChange={(notifications) => setSwitches((next) => ({ ...next, notifications }))} label="Notifications" /><Switch checked={switches.location} onChange={(location) => setSwitches((next) => ({ ...next, location }))} label="Location services" /></div></ShowcaseSection>

        <ShowcaseSection title="Native Picker — Menu"><div className="grid gap-[var(--space-3)] md:grid-cols-2"><AppNativePicker label="Country" value={pickerValue} onChange={setPickerValue} options={pickerOptions} /><AppNativePicker label="Region (disabled)" value="IN" onChange={() => {}} options={pickerOptions} disabled /></div></ShowcaseSection>
        <ShowcaseSection title="Picker — Triggered from Components"><div className="grid gap-[var(--space-3)] md:grid-cols-2"><InputField label="Embedded picker" defaultValue="12" leadingPicker={<AppNativePicker embedded value={pickerValue} onChange={setPickerValue} options={pickerOptions} />} leadingSeparator /><Button label={`Picker action: ${pickerValue}`} variant="secondary" onClick={() => { const values = pickerOptions.map((option) => option.value); const nextIndex = (values.indexOf(pickerValue) + 1) % values.length; setPickerValue(values[nextIndex]); }} /></div></ShowcaseSection>
        <ShowcaseSection title="DateTimePicker — Compact"><AppDateTimePicker label="Date" value={dateTime} onChange={setDateTime} mode="date" /></ShowcaseSection>
        <ShowcaseSection title="DateTimePicker — Graphical"><AppDateTimePicker label="Calendar" value={dateTime} onChange={setDateTime} mode="dateAndTime" displayStyle="inline" /></ShowcaseSection>
        <ShowcaseSection title="DateTimePicker — Wheel (time)"><AppDateTimePicker label="Alarm" value={dateTime} onChange={setDateTime} mode="time" /></ShowcaseSection>
        <ShowcaseSection title="ProgressLoader"><div className="flex flex-col gap-[var(--space-5)]"><AppProgressLoader variant="indefinite" label="Loading" /><AppProgressLoader variant="definite" value={65} total={100} label="65%" /></div></ShowcaseSection>
        <ShowcaseSection title="ColorPicker"><div className="grid gap-[var(--space-3)] md:grid-cols-2"><AppColorPicker value={colorValue} onChange={setColorValue} label="Accent Color" /><AppColorPicker value={colorValue} onChange={setColorValue} label="Background" /></div></ShowcaseSection>
        <ShowcaseSection title="BottomSheet — Default"><Button label="Open Sheet" variant="secondary" onClick={() => setSheet("default")} /></ShowcaseSection>
        <ShowcaseSection title="BottomSheet — Small (30%)"><Button label="Open Small Sheet" variant="secondary" size="sm" onClick={() => setSheet("small")} /></ShowcaseSection>
        <ShowcaseSection title="BottomSheet — Form"><Button label="Open Form Sheet" variant="secondary" size="sm" onClick={() => setSheet("form")} /></ShowcaseSection>
        <ShowcaseSection title="BottomSheet — List"><Button label="Open List Sheet" variant="secondary" size="sm" onClick={() => setSheet("list")} /></ShowcaseSection>
        <ShowcaseSection title="ActionSheet"><Button label="Show Action Sheet" variant="secondary" onClick={() => setActionSheetOpen(true)} /></ShowcaseSection>
        <ShowcaseSection title="Alert Popup"><Button label="Show Alert" variant="danger" onClick={() => setAlertOpen(true)} /></ShowcaseSection>
        <ShowcaseSection title="Context Menu — Long press"><AppContextMenu items={[{ label: "Edit", icon: <Icon name="PencilSimple" /> }, { label: "Share", icon: <Icon name="Share" /> }, { label: "Delete", icon: <Icon name="Trash" />, destructive: true, separatorAbove: true }]}><Surface>Right-click or long-press area</Surface></AppContextMenu></ShowcaseSection>
        <ShowcaseSection title="Context Menu — Popover (tap)"><AppContextMenu mode="dropdown" items={[{ label: "Edit", icon: <Icon name="PencilSimple" /> }, { label: "Share", icon: <Icon name="Share" /> }, { label: "Delete", icon: <Icon name="Trash" />, destructive: true }]}><Button label="Tap for menu" variant="tertiary" /></AppContextMenu></ShowcaseSection>
        <ShowcaseSection title="Carousel — Paged"><AppCarousel items={carouselItems} style="paged" showDots /></ShowcaseSection>
        <ShowcaseSection title="Carousel — Scroll Snap"><AppCarousel items={carouselItems} style="scrollSnap" showDots showNavButtons={false} /></ShowcaseSection>
        <ShowcaseSection title="Tooltip"><AppTooltip tipText="Tap the heart to like this post" side="top"><Button label="Hover me" variant="secondary" /></AppTooltip></ShowcaseSection>
        <ShowcaseSection title="RangeSlider — Continuous"><AppRangeSlider lowerValue={rangeValue[0]} upperValue={rangeValue[1]} onChange={setRangeValue} showLabels /></ShowcaseSection>
        <ShowcaseSection title="RangeSlider — Step 10"><AppRangeSlider lowerValue={stepRangeValue[0]} upperValue={stepRangeValue[1]} onChange={setStepRangeValue} step={10} showLabels /></ShowcaseSection>
        <ShowcaseSection title="DateGrid — Full week strip"><DateGrid /></ShowcaseSection>
        <ShowcaseSection title="DateGrid — Controlled selection"><DateGrid selectedDate={selectedDate} onSelect={setSelectedDate} /></ShowcaseSection>
        <ShowcaseSection title="DateGrid — Individual cells"><Row>{[-2, -1, 0, 1, 2].map((offset) => { const date = new Date(SHOWCASE_DATE); date.setDate(date.getDate() + offset); return <DateItem key={offset} date={date} isActive={offset === 0} isToday={offset === 0} onSelect={setSelectedDate} />; })}</Row></ShowcaseSection>
      </div>

      <AppBottomSheet isPresented={sheet !== null} onClose={() => setSheet(null)} title={sheet === "small" ? "Small Sheet" : sheet === "form" ? "Quick Feedback" : sheet === "list" ? "Select Option" : "Default Sheet"} snapPoints={sheet === "small" ? [0.3] : [0.45, 0.85]}>
        {sheet === "form" ? (
          <div className="flex flex-col gap-[var(--space-3)]"><InputField label="Name" placeholder="Enter your name" /><InputField label="Email" placeholder="you@example.com" /><Button label="Submit" onClick={() => setSheet(null)} /></div>
        ) : sheet === "list" ? (
          <div className="flex flex-col gap-[var(--space-2)]">{["Favourites", "Recent", "Documents", "Photos"].map((title) => <ListItem key={title} title={title} trailing={{ type: "button", label: "Select", onPress: () => setSheet(null) }} divider />)}</div>
        ) : (
          <TextBlock title="Sheet content" body="Presented by AppBottomSheet." />
        )}
      </AppBottomSheet>

      <AppActionSheet
        isPresented={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        title="Post Options"
        message="Choose an action for this post."
        actions={[{ label: "Edit" }, { label: "Share" }, { label: "Delete", role: "destructive" }, { label: "Cancel", role: "cancel" }]}
      />
      <AppAlertPopup
        isPresented={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Delete item?"
        message="This action cannot be undone."
        buttons={[{ label: "Cancel", role: "cancel" }, { label: "Delete", role: "destructive" }]}
      />
      {liveToast && (
        <ToastContainer position="bottom-center">
          <Toast
            message={liveToast.message}
            description={liveToast.description}
            variant={liveToast.variant}
            dismissible
            duration={3000}
            onDismiss={() => setLiveToast(null)}
          />
        </ToastContainer>
      )}
      </main>
    </AdaptiveNavShell>
  );
}
