import type { Metadata } from "next";
import { Suspense } from "react";
import { Button, ButtonLink } from "@/components/marketing/Button";
import { Field, Input, Select, Textarea } from "@/components/marketing/Field";
import { LeadForm } from "@/components/marketing/LeadForm";
import {
  Card,
  CTABand,
  LinkArrow,
  LogoStrip,
  SectionHeading,
  TrustRow,
} from "@/components/marketing/primitives";
import { TierCard } from "@/components/marketing/TierCard";
import { CONTACT_IS_PLACEHOLDER } from "@/lib/marketing/contact";
import {
  formatPriceFrom,
  LICENCE_INFO,
  PRICING_IS_PLACEHOLDER,
} from "@/lib/marketing/qualifier";

export const metadata: Metadata = {
  title: "Components — FoodRaksha Website",
  robots: { index: false, follow: false },
};

/** Every website primitive in every state, for review — the website's design-system page. */
export default function ComponentsPreview() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-14">
      <SectionHeading
        eyebrow="Website design system"
        title="Components preview"
        accent="Components"
        lede="Every marketing primitive, in the blue/green Apple theme. This page is noindex."
      />

      {(CONTACT_IS_PLACEHOLDER || PRICING_IS_PLACEHOLDER) && (
        <div className="mt-8 rounded-fr-card border-[0.5px] border-fr-blue/30 bg-fr-blue-050 p-5 text-[14px] text-fr-ink">
          <strong className="font-semibold">Placeholder data in use.</strong>{" "}
          {CONTACT_IS_PLACEHOLDER &&
            "Contact details are [PLACEHOLDER] (docs/CONTACT.md missing). "}
          {PRICING_IS_PLACEHOLDER &&
            "Pricing is indicative placeholder (docs/Website-Structure-Teardown.md missing)."}
        </div>
      )}

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="blue">Blue</Button>
          <Button variant="green">Green</Button>
          <Button variant="soft">Soft</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="blue" disabled>
            Disabled
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button variant="blue" size="lg">
            Large
          </Button>
          <Button variant="blue" size="base">
            Base
          </Button>
          <Button variant="blue" size="sm">
            Small
          </Button>
          <ButtonLink href="#" variant="green">
            Link button
          </ButtonLink>
        </div>
      </Section>

      <Section title="LinkArrow">
        <div className="flex flex-wrap gap-8">
          <LinkArrow href="#">Learn more</LinkArrow>
          <LinkArrow href="#" accent="green">
            Get started
          </LinkArrow>
          <LinkArrow href="#" accent="ink">
            Read the guide
          </LinkArrow>
        </div>
      </Section>

      <Section title="Section heading">
        <SectionHeading
          eyebrow="Eyebrow"
          title="A heading with an accented word"
          accent="accented"
          lede="An optional lede sits beneath, in the secondary ink colour, at a comfortable reading measure."
        />
      </Section>

      <Section title="Cards">
        <div className="grid gap-5 sm:grid-cols-3">
          <Card>
            <h3 className="text-title-3">Static card</h3>
            <p className="mt-2 text-[15px] text-fr-ink-2">
              Soft shadow, hairline border.
            </p>
          </Card>
          <Card hover>
            <h3 className="text-title-3">Hover-lift card</h3>
            <p className="mt-2 text-[15px] text-fr-ink-2">Lifts on hover.</p>
          </Card>
          <Card>
            <h3 className="text-title-3">With a link</h3>
            <p className="mt-2 text-[15px] text-fr-ink-2">
              Cards compose freely.
            </p>
            <div className="mt-3">
              <LinkArrow href="#">Open</LinkArrow>
            </div>
          </Card>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid max-w-[560px] gap-4">
          <Field htmlFor="c-name" label="Text input" hint="With a hint line.">
            <Input id="c-name" placeholder="Placeholder text" />
          </Field>
          <Field htmlFor="c-sel" label="Select">
            <Select id="c-sel" defaultValue="">
              <option value="" disabled>
                Choose…
              </option>
              <option>Option one</option>
              <option>Option two</option>
            </Select>
          </Field>
          <Field
            htmlFor="c-err"
            label="Input with error"
            error="This field is required."
          >
            <Input id="c-err" placeholder="Invalid" />
          </Field>
          <Field htmlFor="c-msg" label="Textarea">
            <Textarea id="c-msg" placeholder="Multiple lines…" />
          </Field>
        </div>
      </Section>

      <Section title="Tier / pricing cards">
        <div className="grid gap-6 lg:grid-cols-3">
          {(["BASIC", "STATE", "CENTRAL"] as const).map((kind) => (
            <TierCard
              key={kind}
              name={LICENCE_INFO[kind].name}
              priceFrom={formatPriceFrom(kind)}
              timeline={LICENCE_INFO[kind].timeline}
              summary={LICENCE_INFO[kind].summary}
              featured={kind === "STATE"}
            />
          ))}
        </div>
      </Section>

      <Section title="Trust row">
        <TrustRow
          items={[
            { value: "2,000+", label: "Licences filed" },
            { value: "4.9★", label: "Rating" },
            { value: "17", label: "Forms" },
            { value: "100%", label: "Online" },
          ]}
        />
      </Section>

      <Section title="Logo strip">
        <LogoStrip
          label="As trusted by"
          logos={["Restaurants", "Cloud kitchens", "Manufacturers", "Traders"]}
        />
      </Section>

      <Section title="Lead form (interactive)">
        <div className="max-w-[620px]">
          <Suspense
            fallback={<div className="h-[520px] rounded-fr-card bg-fr-panel" />}
          >
            <LeadForm serviceInterest="Components preview" />
          </Suspense>
        </div>
      </Section>

      <Section title="CTA band">
        <CTABand
          title="A full-width call to action"
          lede="With a supporting line."
          tone="blue"
        >
          <ButtonLink href="#" variant="green" size="lg">
            Primary action
          </ButtonLink>
        </CTABand>
        <div className="mt-5">
          <CTABand title="Green tone" tone="green">
            <ButtonLink href="#" variant="soft" size="lg">
              Action
            </ButtonLink>
          </CTABand>
        </div>
      </Section>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-14 border-t-[0.5px] border-fr-sep pt-10">
      <h2 className="mb-6 text-[13px] font-semibold tracking-[0.06em] text-fr-ink-3 uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}
