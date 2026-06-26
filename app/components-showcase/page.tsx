"use client";

import React, { useMemo, useState } from "react";
import { AdaptiveNavShell, AdaptiveSheet } from "@/app/components/Adaptive";
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
import { MarkdownEditor } from "@/app/components/MarkdownEditor";
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
import { Toast } from "@/app/components/Toast";
import { ListItem } from "@/app/components/patterns/ListItem";
import { StepIndicator } from "@/app/components/patterns/StepIndicator";
import { Stepper } from "@/app/components/patterns/Stepper";
import { TextBlock } from "@/app/components/patterns/TextBlock";

// --- Helpers -----------------------------------------------------------------

const SHOWCASE_DATE = new Date(2026, 5, 14, 13, 0, 0);

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-[var(--space-4)]">
      <div>
        <h2 className="text-[length:var(--typography-title-md-size)] font-[var(--typography-title-md-weight)] leading-[var(--typography-title-md-leading)] text-[var(--typography-primary)]">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function DemoGroup({
  title,
  children,
  wide = false,
}: {
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-col gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--border-muted)] bg-[var(--surfaces-base-primary)] p-[var(--space-4)]",
        wide ? "md:col-span-2" : "",
      ].join(" ")}
    >
      <h3 className="text-[length:var(--typography-body-md-em-size)] font-[var(--typography-body-md-em-weight)] leading-[var(--typography-body-md-em-leading)] text-[var(--typography-primary)]">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-[var(--space-4)] md:grid-cols-2">
      {children}
    </div>
  );
}

function DemoSurface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "rounded-[var(--radius-md)] bg-[var(--surfaces-base-low-contrast)] p-[var(--space-4)]",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function SampleSlide({ title, tone }: { title: string; tone: "brand" | "success" | "accent" }) {
  const toneClasses = {
    brand: "bg-[var(--surfaces-brand-interactive-low-contrast)] text-[var(--typography-brand)]",
    success: "bg-[var(--surfaces-success-subtle)] text-[var(--typography-success)]",
    accent: "bg-[var(--surfaces-accent-low-contrast)] text-[var(--typography-accent)]",
  };

  return (
    <div
      className={[
        "flex h-28 items-center justify-center rounded-[var(--radius-md)] px-[var(--space-4)] text-center",
        "text-[length:var(--typography-body-lg-em-size)] font-[var(--typography-body-lg-em-weight)]",
        toneClasses[tone],
      ].join(" ")}
    >
      {title}
    </div>
  );
}

// responsive: N/A - showcase/demo page with component-specific responsive demos

export default function ComponentsShowcasePage() {
  const [selectedDate, setSelectedDate] = useState<Date>(SHOWCASE_DATE);
  const [radioValue, setRadioValue] = useState("email");
  const [checkNotifications, setCheckNotifications] = useState(true);
  const [checkUpdates, setCheckUpdates] = useState(false);
  const [checkMarketing, setCheckMarketing] = useState(false);
  const [switchDarkMode, setSwitchDarkMode] = useState(false);
  const [switchNotifications, setSwitchNotifications] = useState(true);
  const [switchLocation, setSwitchLocation] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [segmentValue, setSegmentValue] = useState<string | string[]>("month");
  const [filterValue, setFilterValue] = useState<string | string[]>(["active"]);
  const [pickerValue, setPickerValue] = useState("standard");
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(SHOWCASE_DATE);
  const [colorValue, setColorValue] = useState("#4f46e5");
  const [rangeValue, setRangeValue] = useState<[number, number]>([24, 72]);
  const [markdown, setMarkdown] = useState("## Notes\n\n- This editor renders markdown inline.\n- Tables, tasks, and links are supported.");
  const [navTab, setNavTab] = useState(0);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);
  const [adaptiveSheetOpen, setAdaptiveSheetOpen] = useState(false);
  const [actionSheetOpen, setActionSheetOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);

  const allChecked = checkNotifications && checkUpdates && checkMarketing;
  const someChecked = checkNotifications || checkUpdates || checkMarketing;

  const pickerOptions = [
    { label: "Standard", value: "standard" },
    { label: "Express", value: "express" },
    { label: "Priority", value: "priority" },
  ];

  const tabs = [
    { id: "overview", label: "Overview", icon: <Icon name="SquaresFour" size="sm" /> },
    { id: "activity", label: "Activity", icon: <Icon name="ChartLineUp" size="sm" /> },
    { id: "settings", label: "Settings", icon: <Icon name="Gear" size="sm" /> },
  ];

  const segmentItems = [
    { id: "week", label: "Week" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
  ];

  const carouselItems = useMemo(
    () => [
      <SampleSlide key="one" title="Paged slide" tone="brand" />,
      <SampleSlide key="two" title="Second slide" tone="success" />,
      <SampleSlide key="three" title="Third slide" tone="accent" />,
    ],
    []
  );

  return (
    <main className="min-h-screen bg-[var(--surfaces-base-primary)] px-[var(--space-4)] py-[var(--space-6)] md:px-[var(--space-8)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-[var(--space-8)]">
        <header className="flex flex-col gap-[var(--space-2)]">
          <h1 className="text-[length:var(--typography-heading-lg-size)] font-[var(--typography-heading-lg-weight)] leading-[var(--typography-heading-lg-leading)] text-[var(--typography-primary)]">
            Components Showcase
          </h1>
          <p className="max-w-3xl text-[length:var(--typography-body-md-size)] leading-[var(--typography-body-md-leading)] text-[var(--typography-secondary)]">
            Every implemented web design-system component is represented here, with registry-only gaps called out at the end.
          </p>
        </header>

        <Section title="Core Actions">
          <Grid>
            <DemoGroup title="Button">
              <div className="flex flex-wrap gap-[var(--space-2)]">
                {(["primary", "secondary", "tertiary", "success", "danger"] as const).map((variant) => (
                  <Button
                    key={variant}
                    label={variant}
                    variant={variant}
                    size="md"
                    leadingIcon={variant === "primary" ? <Icon name="Sparkle" /> : undefined}
                  />
                ))}
                <Button label="Loading" variant="primary" size="md" isLoading />
                <Button label="Disabled" variant="secondary" size="md" disabled />
              </div>
            </DemoGroup>

            <DemoGroup title="IconButton and Icon">
              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                {(["primary", "secondary", "tertiary", "quarternary", "success", "danger"] as const).map((variant) => (
                  <IconButton
                    key={variant}
                    icon={<Icon name={variant === "danger" ? "Trash" : "Star"} />}
                    label={`${variant} icon button`}
                    variant={variant}
                    size="md"
                  />
                ))}
                <IconButton icon={<Icon name="ArrowsClockwise" />} label="Loading icon button" size="md" isLoading />
                <Icon name="Heart" weight="fill" size="xl" color="var(--icons-error)" label="Heart icon" />
              </div>
            </DemoGroup>
          </Grid>
        </Section>

        <Section title="Badges, Labels, Media">
          <Grid>
            <DemoGroup title="Badge">
              <div className="flex flex-wrap items-center gap-[var(--space-2)]">
                {(["brand", "success", "error", "accent"] as const).map((type) => (
                  <React.Fragment key={type}>
                    <Badge type={type} label={type} size="md" />
                    <Badge type={type} label={12} size="number" subtle />
                    <Badge type={type} size="tiny" />
                  </React.Fragment>
                ))}
              </div>
            </DemoGroup>

            <DemoGroup title="Label">
              <div className="flex flex-wrap items-center gap-[var(--space-3)]">
                {(["secondaryAction", "primaryAction", "brandInteractive", "information"] as const).map((type) => (
                  <Label
                    key={type}
                    type={type}
                    size="md"
                    label={type}
                    leadingIcon={<Icon name="Tag" />}
                    trailingIcon={<Icon name="CaretRight" />}
                  />
                ))}
              </div>
            </DemoGroup>

            <DemoGroup title="Thumbnail" wide>
              <div className="flex flex-wrap items-center gap-[var(--space-3)]">
                {(["xs", "sm", "md", "lg", "xl", "xxl"] as const).map((size) => (
                  <Thumbnail key={size} size={size} alt={`${size} initials`} rounded>
                    {size.toUpperCase()}
                  </Thumbnail>
                ))}
                <Thumbnail
                  size="xl"
                  alt="Gradient sample"
                  src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23f97316'/%3E%3Ccircle cx='112' cy='42' r='52' fill='%2322c55e'/%3E%3Cpath d='M0 132C42 78 86 74 160 118V160H0Z' fill='%234f46e5'/%3E%3C/svg%3E"
                />
              </div>
            </DemoGroup>
          </Grid>
        </Section>

        <Section title="Selection">
          <Grid>
            <DemoGroup title="Chip">
              <div className="flex flex-wrap gap-[var(--space-2)]">
                <Chip label="Chip tab" variant="chipTabs" isActive leadingIcon={<Icon name="House" />} />
                <Chip label="Filter" variant="filters" isActive trailingIcon={<Icon name="X" />} />
                <Chip label="Segment" variant="segmentControl" isActive />
                <Chip label="Disabled" variant="filters" disabled />
              </div>
            </DemoGroup>

            <DemoGroup title="SegmentControlBar">
              <div className="flex flex-col gap-[var(--space-3)]">
                <SegmentControlBar items={segmentItems} value={segmentValue} onChange={setSegmentValue} />
                <SegmentControlBar items={segmentItems} type="chips" size="sm" defaultValue="week" />
                <SegmentControlBar items={segmentItems} type="filters" value={filterValue} onChange={setFilterValue} />
              </div>
            </DemoGroup>

            <DemoGroup title="Tabs and TabPanel" wide>
              <Tabs items={tabs} activeTab={activeTab} onChange={setActiveTab} />
              <DemoSurface>
                <TabPanel id="overview" activeTab={activeTab}>
                  <TextBlock title="Overview panel" body="The active panel is connected to the tab state." />
                </TabPanel>
                <TabPanel id="activity" activeTab={activeTab}>
                  <TextBlock title="Activity panel" body="Keyboard navigation and tab semantics are handled by the component." />
                </TabPanel>
                <TabPanel id="settings" activeTab={activeTab}>
                  <TextBlock title="Settings panel" body="Panels stay mounted in this compact showcase example." />
                </TabPanel>
              </DemoSurface>
            </DemoGroup>
          </Grid>
        </Section>

        <Section title="Forms">
          <Grid>
            <DemoGroup title="InputField and TextField">
              <div className="flex flex-col gap-[var(--space-3)]">
                <InputField
                  label="Email"
                  placeholder="you@example.com"
                  leadingIcon={<Icon name="Envelope" />}
                  trailingLabel={<Label label="Work" size="sm" type="information" />}
                />
                <InputField label="Amount" defaultValue="42.00" leadingLabel={<Label label="USD" />} leadingSeparator state="success" hint="Ready to submit" />
                <InputField label="Invite code" defaultValue="EXPIRED" state="error" hint="This code is no longer valid" />
                <TextField label="Description" placeholder="Write a longer note" rows={3} state="warning" hint="Keep it concise." />
              </div>
            </DemoGroup>

            <DemoGroup title="Checkbox, RadioButton, Switch">
              <div className="flex flex-col gap-[var(--space-4)]">
                <div className="flex flex-col gap-[var(--space-2)]">
                  <Checkbox checked label="Checked" />
                  <Checkbox checked indeterminate label="Indeterminate" />
                  <Checkbox label="Unchecked" />
                </div>
                <RadioGroup value={radioValue} onChange={setRadioValue}>
                  <RadioButton value="email" label="Email" />
                  <RadioButton value="sms" label="SMS" />
                  <RadioButton value="push" label="Push notification" />
                </RadioGroup>
                <div className="flex flex-col gap-[var(--space-2)]">
                  <Switch checked={switchDarkMode} onChange={setSwitchDarkMode} label="Dark mode" />
                  <Switch checked label="Disabled on" disabled />
                </div>
              </div>
            </DemoGroup>

            <DemoGroup title="MarkdownEditor" wide>
              <MarkdownEditor
                label="Rich notes"
                value={markdown}
                onChange={setMarkdown}
                placeholder="Write markdown..."
                minHeight={180}
                maxHeight={260}
              />
            </DemoGroup>
          </Grid>
        </Section>

        <Section title="Date and Time">
          <Grid>
            <DemoGroup title="DateGrid and DateItem">
              <DateGrid selectedDate={selectedDate} onSelect={setSelectedDate} />
              <div className="flex gap-[var(--space-1)]">
                {[-2, -1, 0, 1, 2].map((offset) => {
                  const date = new Date(SHOWCASE_DATE);
                  date.setDate(date.getDate() + offset);
                  return (
                    <DateItem
                      key={offset}
                      date={date}
                      isActive={offset === 0}
                      isToday={offset === 0}
                      onSelect={setSelectedDate}
                    />
                  );
                })}
              </div>
            </DemoGroup>

            <DemoGroup title="AppDateTimePicker">
              <div className="grid gap-[var(--space-3)] md:grid-cols-2">
                <AppDateTimePicker label="Date" value={selectedDateTime} onChange={setSelectedDateTime} mode="date" />
                <AppDateTimePicker label="Date and time" value={selectedDateTime} onChange={setSelectedDateTime} mode="dateAndTime" />
              </div>
            </DemoGroup>
          </Grid>
        </Section>

        <Section title="Feedback">
          <Grid>
            <DemoGroup title="Toast">
              <div className="flex flex-col gap-[var(--space-2)]">
                <Toast message="Default toast" description="Secondary detail text" actionLabel="Undo" onAction={() => {}} dismissible />
                <Toast message="Success toast" variant="success" description="Your changes were saved." />
                <Toast message="Warning toast" variant="warning" />
                <Toast message="Error toast" variant="error" />
              </div>
            </DemoGroup>

            <DemoGroup title="AppProgressLoader">
              <div className="flex flex-col gap-[var(--space-5)]">
                <AppProgressLoader variant="indefinite" label="Loading" />
                <AppProgressLoader variant="definite" value={64} total={100} label="64% complete" />
              </div>
            </DemoGroup>

            <DemoGroup title="Divider" wide>
              <div className="flex flex-col gap-[var(--space-4)]">
                <Divider type="section" />
                <Divider type="row" label="Row divider with label" />
                <div className="flex h-16 items-stretch gap-[var(--space-4)]">
                  <TextBlock title="Left" body="Vertical separator" />
                  <Divider orientation="vertical" />
                  <TextBlock title="Right" body="Section boundary" />
                </div>
              </div>
            </DemoGroup>
          </Grid>
        </Section>

        <Section title="Native Web Wrappers">
          <Grid>
            <DemoGroup title="AppNativePicker">
              <div className="flex flex-col gap-[var(--space-3)]">
                <AppNativePicker label="Shipping speed" value={pickerValue} onChange={setPickerValue} options={pickerOptions} size="md" />
                <InputField
                  label="Embedded picker"
                  defaultValue="12"
                  leadingPicker={<AppNativePicker label="Unit" value={pickerValue} onChange={setPickerValue} options={pickerOptions} embedded />}
                  leadingSeparator
                />
              </div>
            </DemoGroup>

            <DemoGroup title="AppColorPicker and AppRangeSlider">
              <div className="flex flex-col gap-[var(--space-4)]">
                <AppColorPicker value={colorValue} onChange={setColorValue} label="Accent color" />
                <AppRangeSlider lowerValue={rangeValue[0]} upperValue={rangeValue[1]} onChange={setRangeValue} showLabels />
              </div>
            </DemoGroup>

            <DemoGroup title="AppCarousel" wide>
              <div className="grid gap-[var(--space-4)] md:grid-cols-2">
                <AppCarousel items={carouselItems} style="paged" showDots />
                <AppCarousel items={carouselItems} style="scrollSnap" showDots showNavButtons={false} />
              </div>
            </DemoGroup>

            <DemoGroup title="Menus and Tooltips">
              <div className="flex flex-wrap items-center gap-[var(--space-3)]">
                <AppTooltip tipText="Tooltip content" side="top">
                  <Button label="Hover me" variant="secondary" size="md" />
                </AppTooltip>
                <AppContextMenu
                  mode="dropdown"
                  items={[
                    { label: "Duplicate", icon: <Icon name="Copy" /> },
                    { label: "Archive", icon: <Icon name="Archive" /> },
                    { label: "Delete", icon: <Icon name="Trash" />, destructive: true, separatorAbove: true },
                  ]}
                >
                  <Button label="Open menu" variant="tertiary" size="md" />
                </AppContextMenu>
                <AppContextMenu
                  items={[
                    { label: "Open", icon: <Icon name="ArrowSquareOut" /> },
                    { label: "Rename", icon: <Icon name="PencilSimple" /> },
                  ]}
                >
                  <DemoSurface className="select-none">Right-click area</DemoSurface>
                </AppContextMenu>
              </div>
            </DemoGroup>

            <DemoGroup title="Sheets and Alerts">
              <div className="flex flex-wrap gap-[var(--space-2)]">
                <Button label="Bottom sheet" size="md" onClick={() => setBottomSheetOpen(true)} />
                <Button label="Action sheet" variant="secondary" size="md" onClick={() => setActionSheetOpen(true)} />
                <Button label="Alert popup" variant="danger" size="md" onClick={() => setAlertOpen(true)} />
              </div>
            </DemoGroup>
          </Grid>
        </Section>

        <Section title="Patterns">
          <Grid>
            <DemoGroup title="TextBlock">
              <TextBlock
                overline="Recent"
                title="Trip planning"
                subtext="Updated 2 hours ago"
                body="A compact text stack for repeated rows, timelines, and content summaries."
                metadata="Owner: Abhishek"
              />
            </DemoGroup>

            <DemoGroup title="StepIndicator and Stepper">
              <div className="flex flex-col gap-[var(--space-4)]">
                <div className="flex items-center gap-[var(--space-3)]">
                  <StepIndicator completed />
                  <StepIndicator />
                </div>
                <Stepper
                  steps={[
                    { title: "Draft", subtitle: "Complete", completed: true },
                    { title: "Review", subtitle: "In progress", body: "Design and copy review are underway.", completed: true },
                    { title: "Publish", subtitle: "Next step" },
                  ]}
                />
              </div>
            </DemoGroup>

            <DemoGroup title="ListItem" wide>
              <div className="flex flex-col gap-[var(--space-3)]">
                <ListItem
                  thumbnail={{
                    src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='96' height='96' viewBox='0 0 96 96'%3E%3Crect width='96' height='96' fill='%23e4e4e7'/%3E%3Cpath d='M18 66C30 40 50 26 78 24v42z' fill='%2309090b'/%3E%3C/svg%3E",
                    alt: "Abstract thumbnail",
                  }}
                  title="Project Alpha"
                  subtitle="Badge trailing slot"
                  body="ListItem composes Thumbnail, TextBlock, Badge, Button, IconButton, Checkbox, RadioButton, Switch, and Divider."
                  trailing={{ type: "badge", label: "New", badgeVariant: "accent" }}
                  divider
                />
                <ListItem title="Select all" trailing={{ type: "checkbox", checked: allChecked, indeterminate: !allChecked && someChecked, onChange: (checked) => {
                  setCheckNotifications(checked);
                  setCheckUpdates(checked);
                  setCheckMarketing(checked);
                } }} divider />
                <ListItem title="Notifications" subtitle="Transaction alerts and reminders" trailing={{ type: "switch", checked: switchNotifications, onChange: setSwitchNotifications }} divider />
                <ListItem title="Location services" subtitle="Allow access to your location" trailing={{ type: "radio", checked: switchLocation, onChange: setSwitchLocation }} />
              </div>
            </DemoGroup>
          </Grid>
        </Section>

        <Section title="Adaptive Wrappers">
          <Grid>
            <DemoGroup title="AdaptiveNavShell" wide>
              <div className="h-[420px] overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-muted)]">
                <AdaptiveNavShell
                  selectedTab={navTab}
                  onTabChange={setNavTab}
                  tabs={[
                    { id: 0, label: "Home", icon: "House", badge: 2 },
                    { id: 1, label: "Search", icon: "MagnifyingGlass" },
                    { id: 2, label: "Settings", icon: "Gear" },
                  ]}
                >
                  <div className="flex h-full items-center justify-center bg-[var(--surfaces-base-low-contrast)] p-[var(--space-6)]">
                    <TextBlock title={`Tab ${navTab + 1}`} body="Resize the viewport to see sidebar and bottom navigation variants." />
                  </div>
                </AdaptiveNavShell>
              </div>
            </DemoGroup>

            <DemoGroup title="AdaptiveSheet">
              <Button label="Open adaptive sheet" size="md" onClick={() => setAdaptiveSheetOpen(true)} />
            </DemoGroup>
          </Grid>
        </Section>

        <Section title="Registry Gaps">
          <Grid>
            <DemoGroup title="StreakChecks">
              <DemoSurface>
                <TextBlock title="No web implementation yet" body="The registry lists StreakChecks as Not started, so the showcase records the gap instead of inventing an unregistered component." />
              </DemoSurface>
            </DemoGroup>
            <DemoGroup title="Waveform">
              <DemoSurface>
                <TextBlock title="No web implementation yet" body="The registry lists Waveform as Not started. Add the component first, then this page can render it." />
              </DemoSurface>
            </DemoGroup>
            <DemoGroup title="AdaptiveSplitView">
              <DemoSurface>
                <TextBlock title="No web file in this repo" body="The registry references AdaptiveSplitView, but app/components/Adaptive currently exports only AdaptiveNavShell and AdaptiveSheet." />
              </DemoSurface>
            </DemoGroup>
          </Grid>
        </Section>
      </div>

      <AppBottomSheet
        isPresented={bottomSheetOpen}
        onClose={() => setBottomSheetOpen(false)}
        title="Bottom Sheet"
        description="Presented by AppBottomSheet."
        snapPoints={[0.45, 0.85]}
      >
        <TextBlock title="Sheet content" body="This is the web equivalent of the native bottom sheet wrapper." />
      </AppBottomSheet>

      <AdaptiveSheet
        isPresented={adaptiveSheetOpen}
        onClose={() => setAdaptiveSheetOpen(false)}
        title="Adaptive Sheet"
        description="Drawer on mobile, dialog on desktop."
      >
        <TextBlock title="Responsive presentation" body="AdaptiveSheet chooses the presentation based on the current breakpoint." />
      </AdaptiveSheet>

      <AppActionSheet
        isPresented={actionSheetOpen}
        onClose={() => setActionSheetOpen(false)}
        title="Choose an action"
        message="ActionSheet renders iOS-style action rows."
        actions={[
          { label: "Duplicate" },
          { label: "Delete", role: "destructive" },
          { label: "Cancel", role: "cancel" },
        ]}
      />

      <AppAlertPopup
        isPresented={alertOpen}
        onClose={() => setAlertOpen(false)}
        title="Delete item?"
        message="This demonstrates the alert popup wrapper."
        buttons={[
          { label: "Cancel", role: "cancel" },
          { label: "Delete", role: "destructive" },
        ]}
      />
    </main>
  );
}
