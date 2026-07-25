import type { Metadata } from "next";
import { ButtonLink } from "@/components/marketing/Button";
import {
  CTABand,
  SectionHeading,
  TestimonialCard,
} from "@/components/marketing/primitives";
import { TRUST } from "@/content/trust";
import { pageMeta } from "@/lib/marketing/seo";

export const metadata: Metadata = pageMeta({
  title: "Reviews",
  description:
    "What food businesses say about working with Food Raksha on their FSSAI licensing.",
  path: "/reviews",
});

export default function ReviewsPage() {
  const hasReviews = TRUST.testimonials.length > 0;

  return (
    <div className="mx-auto max-w-[1120px] px-6 py-14">
      <SectionHeading
        level={1}
        eyebrow="Reviews"
        title="What our clients say"
        accent="clients"
        accentColor="green"
        align="center"
        className="mb-12"
      />

      {hasReviews ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {TRUST.testimonials.map((t) => (
            <TestimonialCard key={t.name} {...t} />
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-[520px] rounded-fr-card border-[0.5px] border-fr-sep bg-fr-panel px-6 py-14 text-center">
          <p className="text-[17px] font-semibold text-fr-ink">
            Reviews are on the way.
          </p>
          <p className="mx-auto mt-2 max-w-[400px] text-[15px] leading-relaxed text-fr-ink-2">
            We&rsquo;re gathering verified reviews from our clients. In the
            meantime, talk to us directly and see how we work.
          </p>
          <div className="mt-6">
            <ButtonLink href="/book" variant="blue" size="base">
              Book a free consultation
            </ButtonLink>
          </div>
        </div>
      )}

      {hasReviews && (
        <div className="mt-14">
          <CTABand title="Join them" tone="blue">
            <ButtonLink href="/book" variant="green" size="lg">
              Book a free consultation
            </ButtonLink>
          </CTABand>
        </div>
      )}
    </div>
  );
}
