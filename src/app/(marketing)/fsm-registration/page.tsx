import type { Metadata } from "next";
import { PageHero } from "@/components/marketing/PageHero";
import { Card, LogoStrip } from "@/components/marketing/primitives";
import { StickyLeadSidebar } from "@/components/marketing/StickyLeadSidebar";
import { TRUST } from "@/content/trust";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "FSM registration — Food Safety Management & supervisor training",
  description:
    "Food Safety Management registration and supervisor certification (FoSTaC) for your FSSAI-licensed business — arranged and tracked for you.",
  path: "/fsm-registration",
});

const WHATS_INCLUDED = [
  "Assessment of how many trained supervisors your premises needs",
  "Enrolment in the right FoSTaC course for your business category",
  "Scheduling, tracking and certificates — handled for you",
  "Guidance on keeping your food-safety management compliant",
];

export default function FsmRegistrationPage() {
  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="FSM Registration"
        title="Food Safety Management, sorted."
        accent="sorted."
        lede="Every FSSAI-licensed business needs trained Food Safety Supervisors. We assess how many you need, enrol them in the right FoSTaC course, and handle the certification end to end."
      />
      <div className="mx-auto max-w-[1120px] px-6 pt-14 pb-16">
      <div className="grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">
        <div className="order-last lg:order-first">
          <section>
            <h2 className="text-title-2 tracking-[-0.02em] text-fr-ink">
              Who needs it
            </h2>
            <p className="mt-3 max-w-[560px] text-[16px] leading-relaxed text-fr-ink-2">
              Under FSSAI rules, licensed food businesses must have at least one
              trained and certified Food Safety Supervisor per premises — more
              as the number of food handlers grows. It applies to restaurants,
              manufacturers, caterers, cloud kitchens and more.
            </p>
          </section>

          <section className="mt-10">
            <h2 className="text-title-2 tracking-[-0.02em] text-fr-ink">
              What&rsquo;s included
            </h2>
            <div className="mt-5">
              <Card>
                <ul className="flex flex-col gap-3">
                  {WHATS_INCLUDED.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-[15px] text-fr-ink"
                    >
                      <span aria-hidden="true" className="mt-0.5 text-fr-green">
                        ✓
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </section>

          {TRUST.clientLogos.length > 0 && (
            <section className="mt-12">
              <LogoStrip
                label="Trusted by"
                logos={TRUST.clientLogos}
                className="sm:text-left"
              />
            </section>
          )}
        </div>

        <StickyLeadSidebar
          qualifier={false}
          serviceInterest="FSM registration"
          submitVariant="green"
          submitLabel="Get a free callback"
          title="Get started with FSM"
        />
      </div>
      </div>
    </>
  );
}
