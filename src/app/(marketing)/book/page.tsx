import type { Metadata } from "next";
import { Suspense } from "react";
import { LeadForm } from "@/components/marketing/LeadForm";
import { SectionHeading, TrustRow } from "@/components/marketing/primitives";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Book a consultation",
  description:
    "Book a free FoodRaksha consultation. Tell us your turnover and we'll tell you which FSSAI licence you need — then leave your number for a callback.",
  path: "/book",
});

export default function BookPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-16">
      <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-start">
        <div>
          <SectionHeading
            eyebrow="Free consultation"
            title="Let's get your licence sorted"
            accent="licence"
            lede="Tell us your turnover and kind of business — we'll tell you exactly which FSSAI licence you need and what it costs. Leave your number and an adviser calls you back."
          />
          <div className="mt-10">
            <TrustRow
              items={[
                { value: "Free", label: "First consultation" },
                { value: "Same day", label: "Callback" },
                { value: "No spam", label: "Just your enquiry" },
              ]}
            />
          </div>
        </div>

        <Suspense
          fallback={
            <div className="h-[560px] rounded-fr-card border-[0.5px] border-fr-sep bg-fr-panel" />
          }
        >
          <LeadForm serviceInterest="Book a consultation" />
        </Suspense>
      </div>
    </div>
  );
}
