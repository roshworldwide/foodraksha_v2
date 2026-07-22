import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Button,
  Card,
  Field,
  Input,
  Label,
  List,
  ListGroupHeader,
  ListIcon,
  ListRow,
  Progress,
  Select,
  StatusPill,
  Textarea,
  Toggle,
} from "@/components/ui";
import { SlideOverDemo } from "./SlideOverDemo";

export const metadata: Metadata = {
  title: "Design System — FoodRaksha",
  description:
    "Every primitive in every state. Compare side by side with docs/prototype.html.",
};

/* ------------------------------------------------------------ page bits */

function Spec({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[12px] tracking-normal text-label-2">
      {children}
    </span>
  );
}

function Swatch({
  name,
  value,
  swatchClass,
}: {
  name: string;
  value: string;
  swatchClass: string;
}) {
  return (
    <div className="overflow-hidden rounded-[14px] bg-surface shadow-1">
      <div className={`h-24 ${swatchClass}`} />
      <div className="px-[14px] py-3">
        <b className="block text-[14px] font-semibold tracking-[-0.008em]">
          {name}
        </b>
        <Spec>{value}</Spec>
      </div>
    </div>
  );
}

function Note({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[0_12px_12px_0] border-l-[3px] border-nat-titanium-deep bg-white-titanium-lt px-[18px] py-[14px] text-[14px] leading-[1.55] text-label-2">
      {children}
    </div>
  );
}

function Rule() {
  return (
    <hr className="my-[30px] border-0 border-t-[0.5px] border-separator" />
  );
}

/* ----------------------------------------------------------------- page */

export default function DesignSystemPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-9 pb-15">
      <header className="mb-[26px] max-w-[660px]">
        <h1 className="text-[24px] font-bold tracking-[-0.02em]">
          Design System
        </h1>
        <p className="mt-1.5 text-subhead leading-[1.5] text-label-2">
          Apple iOS visual language. Titanium palette, SF Pro type scale, 980px
          capsule buttons, inset grouped lists, 44pt minimum tap targets.
        </p>
      </header>

      {/* ------------------------------------------------------- palette */}
      <ListGroupHeader>Titanium palette</ListGroupHeader>
      <div className="mb-[30px] grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
        <Swatch
          name="Natural Titanium"
          value="#C3BCB1"
          swatchClass="bg-nat-titanium"
        />
        <Swatch
          name="Titanium Deep"
          value="#6E6960"
          swatchClass="bg-nat-titanium-deep"
        />
        <Swatch
          name="White Titanium"
          value="#F0EEE9"
          swatchClass="bg-white-titanium"
        />
        <Swatch
          name="Graphite — actions"
          value="#1D1D1F"
          swatchClass="bg-graphite"
        />
      </div>

      <ListGroupHeader>Surfaces &amp; text</ListGroupHeader>
      <div className="mb-[30px] grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
        <Swatch
          name="Titanium Mid — hover"
          value="#A8A197"
          swatchClass="bg-nat-titanium-mid"
        />
        <Swatch
          name="White Titanium Light"
          value="#F7F6F3"
          swatchClass="bg-white-titanium-lt"
        />
        <Swatch name="Background" value="#EFEDE8" swatchClass="bg-bg" />
        <Swatch name="Surface" value="#FFFFFF" swatchClass="bg-surface" />
        <Swatch
          name="Surface Sunk"
          value="#E8E5DF"
          swatchClass="bg-surface-sunk"
        />
        <Swatch name="Label" value="#1D1D1F" swatchClass="bg-label" />
        <Swatch
          name="Label 2"
          value="rgba(60,60,67,.60)"
          swatchClass="bg-label-2"
        />
        <Swatch
          name="Label 3"
          value="rgba(60,60,67,.32)"
          swatchClass="bg-label-3"
        />
        <Swatch
          name="Separator"
          value="rgba(60,60,67,.16)"
          swatchClass="bg-separator"
        />
      </div>

      <div className="mb-[30px]">
        <Note>
          <b className="text-label">Colour discipline.</b> The interface is
          titanium and graphite only. Colour appears in exactly one place —
          application status — because a pipeline is unusable if every state
          looks the same. Those three tones are desaturated to sit inside the
          palette rather than fight it.
        </Note>
      </div>

      {/* -------------------------------------------------------- status */}
      <ListGroupHeader>Status tones</ListGroupHeader>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusPill tone="ok">Licence Issued</StatusPill>
        <StatusPill tone="wait">Query Raised</StatusPill>
        <StatusPill tone="stop">Action Needed</StatusPill>
        <StatusPill tone="idle">Not Logged In</StatusPill>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <StatusPill tone="ok">Filed</StatusPill>
        <StatusPill tone="wait">Under Review</StatusPill>
        <StatusPill tone="stop">Rejected</StatusPill>
        <StatusPill tone="idle">Draft</StatusPill>
      </div>
      <div className="mb-[30px] grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(210px,1fr))]">
        <Swatch
          name="ok — issued"
          value="#34785A · bg #E4EFE9"
          swatchClass="bg-ok"
        />
        <Swatch
          name="wait — awaiting"
          value="#9A7B3F · bg #F5EEDF"
          swatchClass="bg-wait"
        />
        <Swatch
          name="stop — action needed"
          value="#A2453C · bg #F6E5E3"
          swatchClass="bg-stop"
        />
      </div>

      <Rule />

      {/* ---------------------------------------------------------- type */}
      <ListGroupHeader>Type scale — SF Pro</ListGroupHeader>
      <Card className="mb-[30px]">
        <div className="text-large-title">
          Large Title <Spec>34 · Bold · −.026em</Spec>
        </div>
        <div className="mt-3.5 text-title-1">
          Title 1 <Spec>28 · Bold · −.022em</Spec>
        </div>
        <div className="mt-3.5 text-title-2">
          Title 2 <Spec>22 · Bold · −.018em</Spec>
        </div>
        <div className="mt-3.5 text-title-3">
          Title 3 <Spec>20 · Semibold · −.014em</Spec>
        </div>
        <div className="mt-3.5 text-headline">
          Headline <Spec>17 · Semibold · −.012em</Spec>
        </div>
        <div className="mt-2.5 text-body">
          Body — the default reading size for all form content.{" "}
          <Spec>17 · Regular · −.011em</Spec>
        </div>
        <div className="mt-2.5 text-callout">
          Callout — secondary content. <Spec>16 · Regular · −.010em</Spec>
        </div>
        <div className="mt-2.5 text-subhead">
          Subhead — supporting text. <Spec>15 · Regular · −.008em</Spec>
        </div>
        <div className="mt-2.5 text-footnote text-label-2">
          Footnote — helper text and metadata.{" "}
          <Spec>13 · Regular · −.004em</Spec>
        </div>
        <div className="mt-2.5 text-caption text-label-2">
          CAPTION — badges and labels. <Spec>12 · Medium · 0</Spec>
        </div>
      </Card>

      {/* ------------------------------------------------------- buttons */}
      <ListGroupHeader>Buttons — 980px capsule</ListGroupHeader>
      <Card className="mb-[30px]">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button variant="primary">Continue</Button>
          <Button variant="secondary">Save Draft</Button>
          <Button variant="quiet">Cancel</Button>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm">
            Small
          </Button>
          <Button variant="secondary" size="sm">
            Small
          </Button>
          <Button variant="quiet" size="xs">
            Extra small
          </Button>
        </div>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Button variant="primary" disabled>
            Disabled
          </Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
          <Button variant="quiet" disabled>
            Disabled
          </Button>
        </div>
        <div className="mb-4 max-w-[360px]">
          <Button variant="primary" fullWidth>
            Full width
          </Button>
        </div>
        <Spec>
          border-radius: 980px · min-height: 50px · active: scale(.965)
        </Spec>
      </Card>

      {/* --------------------------------------------------------- lists */}
      <div className="mb-[30px] grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
        <div>
          <ListGroupHeader>Inset grouped list</ListGroupHeader>
          <List>
            <ListRow
              chevron
              href="/design-system"
              icon={<ListIcon tone="done">✓</ListIcon>}
              title="Business Details"
              subtitle="Completed"
            />
            <ListRow
              chevron
              href="/design-system"
              icon={<ListIcon tone="current">3</ListIcon>}
              title="Premises & Address"
              subtitle="In progress"
            />
            <ListRow
              chevron
              href="/design-system"
              icon={<ListIcon tone="pending">4</ListIcon>}
              title="Food Categories"
              subtitle="Not started"
            />
          </List>

          <div className="mt-[18px]">
            <ListGroupHeader>Rows without icons</ListGroupHeader>
            <List>
              <ListRow title="Plain row" />
              <ListRow
                title="With trailing value"
                trailing={
                  <span className="text-[15px] text-label-2">
                    State Licence
                  </span>
                }
              />
              <ListRow
                title="With status"
                trailing={<StatusPill tone="ok">Approved</StatusPill>}
              />
              <ListRow
                chevron
                href="/design-system"
                title="Last row — no separator"
              />
            </List>
          </div>
        </div>

        <div>
          <ListGroupHeader>Controls</ListGroupHeader>
          <List>
            <ListRow
              title="SMS notifications"
              trailing={<Toggle defaultChecked label="SMS notifications" />}
            />
            <ListRow
              title="Email updates"
              trailing={<Toggle label="Email updates" />}
            />
            <ListRow
              title="Weekly digest"
              subtitle="Unavailable on this plan"
              trailing={<Toggle disabled label="Weekly digest" />}
            />
          </List>

          <div className="mt-[18px]">
            <Field htmlFor="ds-name" label="Business Name">
              <Input
                id="ds-name"
                placeholder="As per GST certificate"
                defaultValue=""
              />
            </Field>
          </div>
        </div>
      </div>

      <Rule />

      {/* --------------------------------------------------------- forms */}
      <ListGroupHeader>Form controls</ListGroupHeader>
      <Card className="mb-[30px]">
        <div className="grid gap-x-5 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          <Field
            htmlFor="ds-i1"
            label="Business Name"
            hint="Exactly as printed on the GST certificate."
          >
            <Input
              id="ds-i1"
              aria-describedby="ds-i1-hint"
              placeholder="Spice Route Kitchen"
            />
          </Field>

          <Field htmlFor="ds-i2" label="Filled value">
            <Input id="ds-i2" defaultValue="Spice Route Kitchen Pvt Ltd" />
          </Field>

          <Field
            htmlFor="ds-i3"
            label="Mobile number"
            error="enter 10 digits after +91."
          >
            <Input
              id="ds-i3"
              defaultValue="+91 9845"
              aria-invalid
              aria-describedby="ds-i3-error"
            />
          </Field>

          <Field htmlFor="ds-i4" label="Disabled">
            <Input id="ds-i4" defaultValue="Locked after submission" disabled />
          </Field>

          <Field htmlFor="ds-s1" label="Licence type">
            <Select id="ds-s1" defaultValue="state">
              <option value="basic">Basic Registration</option>
              <option value="state">State Licence</option>
              <option value="central">Central Licence</option>
            </Select>
          </Field>

          <Field htmlFor="ds-s2" label="Select — disabled">
            <Select id="ds-s2" defaultValue="state" disabled>
              <option value="state">State Licence</option>
            </Select>
          </Field>
        </div>

        <Field
          htmlFor="ds-t1"
          label="Nature of business"
          hint="Describe what is prepared, stored or sold."
        >
          <Textarea
            id="ds-t1"
            aria-describedby="ds-t1-hint"
            placeholder="Preparation and sale of cooked meals for dine-in and delivery."
          />
        </Field>

        <div className="mb-[18px]">
          <Label htmlFor="ds-standalone">Standalone label</Label>
          <div className="mt-[7px]">
            <Input id="ds-standalone" placeholder="13px / 600 / --label-2" />
          </div>
        </div>

        <Spec>
          17px · padding 14/16 · radius 12 · focus: titanium-deep border + 3.5px
          ring
        </Spec>
      </Card>

      {/* --------------------------------------------------------- cards */}
      <ListGroupHeader>Cards</ListGroupHeader>
      <div className="mb-[30px] grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(290px,1fr))]">
        <Card>
          <div className="text-title-3">Surface card</div>
          <p className="mt-1.5 text-subhead text-label-2">
            White surface, 18px radius, shadow 1. Never nested inside another
            card.
          </p>
        </Card>
        <Card tone="dark">
          <div className="text-title-3">Graphite card</div>
          <p className="mt-1.5 text-subhead text-white/[0.62]">
            Used sparingly — one per screen at most, for the single thing that
            matters right now.
          </p>
        </Card>
      </div>

      {/* ------------------------------------------------------ progress */}
      <ListGroupHeader>Progress</ListGroupHeader>
      <Card className="mb-[30px]">
        <div className="flex flex-col gap-4">
          <div>
            <div className="mb-2 text-footnote text-label-2">0%</div>
            <Progress value={0} label="Example progress, 0 percent" />
          </div>
          <div>
            <div className="mb-2 text-footnote text-label-2">45%</div>
            <Progress value={45} label="Example progress, 45 percent" />
          </div>
          <div>
            <div className="mb-2 text-footnote text-label-2">100%</div>
            <Progress value={100} label="Example progress, 100 percent" />
          </div>
          <div>
            <div className="mb-2 text-footnote text-label-2">Thin — 4px</div>
            <Progress thin value={64} label="Example thin progress" />
          </div>
        </div>
      </Card>

      {/* -------------------------------------------------------- toggle */}
      <ListGroupHeader>Toggle</ListGroupHeader>
      <Card className="mb-[30px]">
        <div className="flex flex-wrap items-center gap-8">
          <div className="flex items-center gap-3">
            <Toggle defaultChecked label="On" />
            <Spec>on</Spec>
          </div>
          <div className="flex items-center gap-3">
            <Toggle label="Off" />
            <Spec>off</Spec>
          </div>
          <div className="flex items-center gap-3">
            <Toggle disabled label="Disabled off" />
            <Spec>disabled</Spec>
          </div>
          <div className="flex items-center gap-3">
            <Toggle disabled defaultChecked label="Disabled on" />
            <Spec>disabled · on</Spec>
          </div>
        </div>
      </Card>

      {/* ----------------------------------------------------- slideover */}
      <ListGroupHeader>Slide-over</ListGroupHeader>
      <Card className="mb-[30px]">
        <p className="mb-4 text-subhead text-label-2">
          560px, right-anchored, scrim with 3px blur. Escape or scrim click
          closes it; focus is trapped inside and returns to this button on
          close.
        </p>
        <SlideOverDemo />
      </Card>

      <Note>
        <b className="text-label">Reference.</b> Compare against{" "}
        <code className="font-mono text-[13px]">docs/prototype.html</code> — the
        approved implementation. Every value here comes from{" "}
        <code className="font-mono text-[13px]">docs/DESIGN-SYSTEM.md</code>.
      </Note>
    </main>
  );
}
