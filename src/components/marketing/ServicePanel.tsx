"use client";

import { useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import {
  FOOD_LICENCE_SAVING,
  FOOD_LICENCE_SERVICE,
  PROCESS_STEPS,
  REGISTRATION_DOCUMENTS,
} from "@/content/services";
import { TRUST } from "@/content/trust";
import { formatInr } from "@/lib/marketing/qualifier";
import { ButtonLink } from "./Button";

/**
 * The "Food License" service panel — home page section 5 in
 * docs/Website-Structure-Teardown.md: price, Overview / Process & Documents
 * tabs, and the two calls to action.
 *
 * The tabs are a real ARIA tablist: arrow keys move between them, Home/End jump
 * to the ends, and only the selected panel is in the accessibility tree. Every
 * figure and list comes from @/content/services.
 */

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "process", label: "Process & Documents" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * What the fee covers. Lives in the Overview tab rather than beside the price:
 * the two tabs share one grid cell so the card never resizes, and putting this
 * here balances their heights instead of leaving Overview half empty.
 */
const INCLUDED = [
  "Perpetual validity — no renewals",
  "Filed in 24 hours",
  "Every document prepared for you",
];

export function ServicePanel({ className }: { className?: string }) {
  const uid = useId();
  const [active, setActive] = useState<TabId>("overview");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const index = TABS.findIndex((tab) => tab.id === active);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % TABS.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + TABS.length) % TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = TABS.length - 1;
    else return;

    event.preventDefault();
    const id = TABS[next].id;
    setActive(id);
    tabRefs.current[id]?.focus();
  }

  return (
    /* One product card, split into the offer and its detail — rather than two
       loose halves floating on the section background with nothing holding
       them together. */
    <div
      className={cn(
        "overflow-hidden rounded-[28px] border-[0.5px] border-fr-sep bg-fr-bg shadow-fr-lift",
        "grid lg:grid-cols-[0.82fr_1fr]",
        className,
      )}
    >
      {/* ── Left: the offer, on a soft corner wash (the same technique as the
             hero) so it reads as the feature side of the card. */}
      <div
        className={cn(
          "flex flex-col justify-center px-7 py-8 sm:px-9 sm:py-10",
          "bg-[radial-gradient(130%_100%_at_0%_0%,var(--color-fr-blue-050),transparent_62%)]",
          "border-b-[0.5px] border-fr-sep lg:border-r-[0.5px] lg:border-b-0",
        )}
      >
        <p className="text-[12px] font-bold tracking-[0.055em] text-fr-blue uppercase">
          Our most-requested service
        </p>
        <h2 className="mt-2.5 text-[32px] leading-[1.05] font-bold tracking-[-0.03em] text-balance text-fr-ink sm:text-[38px]">
          {FOOD_LICENCE_SERVICE.name}
        </h2>

        {/* Price as a labelled block: the figure people actually read stands
            alone, with what it replaces and what they save stacked beside it,
            instead of four things sharing one baseline. */}
        <div className="mt-6">
          <p className="text-[11.5px] font-bold tracking-[0.055em] text-fr-ink-2 uppercase">
            Starts from
          </p>
          <div className="mt-1.5 flex items-center gap-3.5">
            <span className="text-[46px] leading-none font-bold tracking-[-0.035em] text-fr-ink">
              {formatInr(FOOD_LICENCE_SERVICE.priceFrom)}
            </span>
            <span className="flex flex-col items-start gap-1">
              <span className="text-[15px] font-medium text-fr-ink-2 line-through decoration-fr-ink-2/50">
                {formatInr(FOOD_LICENCE_SERVICE.priceWas)}
              </span>
              <span className="rounded-pill bg-fr-green-050 px-2 py-0.5 text-[11.5px] font-bold text-fr-green-deep">
                Save {formatInr(FOOD_LICENCE_SAVING)}
              </span>
            </span>
          </div>
        </div>

        <p className="mt-4 text-[13.5px] leading-relaxed text-fr-ink-2">
          Our professional fee. The government fee depends on your licence —{" "}
          <a
            href="/fssai-calculator"
            className="font-semibold text-fr-blue underline decoration-fr-blue/30 underline-offset-2"
          >
            check it in the calculator
          </a>
          .
        </p>

        {/* Full width while stacked on a phone, so the two do not sit at
            ragged different widths. */}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
          <ButtonLink
            href="/get-started"
            variant="blue"
            size="base"
            className="w-full shadow-fr-blue sm:w-auto"
          >
            Avail Service
            <span aria-hidden="true">›</span>
          </ButtonLink>
          <ButtonLink
            href="#qualifier"
            variant="soft"
            size="base"
            className="w-full sm:w-auto"
          >
            <PhoneGlyph />
            Request a callback
          </ButtonLink>
        </div>

        {/* Real numbers from @/content/trust, filling what was dead space. */}
        <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 border-t-[0.5px] border-fr-sep pt-5">
          {TRUST.chips.slice(0, 2).map((chip) => (
            <span
              key={chip}
              className="flex items-center gap-1.5 text-[13px] font-medium text-fr-ink-2"
            >
              <span aria-hidden="true" className="text-[9px] text-fr-green">
                ●
              </span>
              {chip}
            </span>
          ))}
        </div>
      </div>

      {/* ── Right: the tabbed detail */}
      <div>
        <div
          role="tablist"
          aria-label={`${FOOD_LICENCE_SERVICE.name} details`}
          className="flex gap-1 border-b-[0.5px] border-fr-sep px-4 pt-3 sm:px-5"
        >
          {TABS.map((tab) => {
            const selected = active === tab.id;
            return (
              <button
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[tab.id] = node;
                }}
                id={tabId(tab.id)}
                role="tab"
                type="button"
                aria-selected={selected}
                aria-controls={panelId(tab.id)}
                tabIndex={selected ? 0 : -1}
                onClick={() => setActive(tab.id)}
                onKeyDown={onKeyDown}
                className={cn(
                  "-mb-[0.5px] cursor-pointer rounded-t-[12px] px-4 pt-2.5 pb-3",
                  "text-[15px] font-semibold tracking-[-0.01em] whitespace-nowrap",
                  "transition-colors duration-200",
                  "focus-visible:ring-[3px] focus-visible:ring-fr-blue/35 focus-visible:outline-none",
                  selected
                    ? "border-b-2 border-fr-blue bg-fr-bg text-fr-blue"
                    : "text-fr-ink-2 hover:text-fr-ink",
                )}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Both panels live in the SAME grid cell, so the card is always as
            tall as the taller one and switching tabs cannot move anything below
            it. The inactive panel uses visibility:hidden (via `invisible`),
            which keeps its space but takes it out of the accessibility tree and
            out of the tab order — so it is hidden properly, not just faded. */}
        <div className="grid px-5 py-5 sm:px-6">
          <div
            id={panelId("overview")}
            role="tabpanel"
            aria-labelledby={tabId("overview")}
            tabIndex={active === "overview" ? 0 : -1}
            className={cn(
              "[grid-area:1/1] transition-opacity duration-200 ease-ios",
              "focus-visible:outline-none",
              active === "overview"
                ? "opacity-100"
                : "invisible opacity-0 pointer-events-none",
            )}
          >
            <SectionLabel>Benefits</SectionLabel>
            <ol className="mt-3 flex flex-col gap-3">
              {FOOD_LICENCE_SERVICE.benefits.map((benefit, index) => (
                <li key={benefit} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-fr-blue-050 text-[12px] font-bold text-fr-blue"
                  >
                    {index + 1}
                  </span>
                  <span className="text-[15px] leading-relaxed text-fr-ink">
                    {benefit}
                  </span>
                </li>
              ))}
            </ol>

            <SectionLabel className="mt-5">What&rsquo;s included</SectionLabel>
            <ul className="mt-3 flex flex-col gap-2">
              {INCLUDED.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-[15px] text-fr-ink"
                >
                  <span
                    aria-hidden="true"
                    className="mt-px flex size-[18px] shrink-0 items-center justify-center rounded-full bg-fr-green-050 text-[11px] font-bold text-fr-green-deep"
                  >
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <SectionLabel className="mt-5">Description</SectionLabel>
            <p className="mt-2.5 text-[15px] leading-relaxed text-fr-ink-2">
              {FOOD_LICENCE_SERVICE.description}
            </p>
          </div>

          <div
            id={panelId("process")}
            role="tabpanel"
            aria-labelledby={tabId("process")}
            tabIndex={active === "process" ? 0 : -1}
            className={cn(
              "[grid-area:1/1] transition-opacity duration-200 ease-ios",
              "focus-visible:outline-none",
              active === "process"
                ? "opacity-100"
                : "invisible opacity-0 pointer-events-none",
            )}
          >
            <SectionLabel>How it works</SectionLabel>
            <ol className="mt-3 flex flex-col gap-3.5">
              {PROCESS_STEPS.map((step, index) => (
                <li key={step.title} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-fr-blue-050 text-[12px] font-bold text-fr-blue"
                  >
                    {index + 1}
                  </span>
                  <span>
                    <span className="block text-[15px] font-semibold text-fr-ink">
                      {step.title}
                    </span>
                    <span className="mt-0.5 block text-[14px] leading-relaxed text-fr-ink-2">
                      {step.body}
                    </span>
                  </span>
                </li>
              ))}
            </ol>

            <SectionLabel className="mt-5">
              Documents for a Registration
            </SectionLabel>
            <ul className="mt-3 flex flex-wrap gap-2">
              {REGISTRATION_DOCUMENTS.map((document) => (
                <li
                  key={document}
                  className="rounded-pill bg-fr-panel px-3 py-1.5 text-[13px] font-medium text-fr-ink"
                >
                  {document}
                </li>
              ))}
            </ul>
            <p className="mt-3.5 text-[13.5px] leading-relaxed text-fr-ink-2">
              A State or Central licence needs more — Form B, a premises layout
              plan and a water test report among them.{" "}
              <a
                href="/services"
                className="font-semibold text-fr-blue underline decoration-fr-blue/30 underline-offset-2"
              >
                See the full list per licence
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h3
      className={cn(
        "text-[11.5px] font-bold tracking-[0.05em] text-fr-ink-2 uppercase",
        className,
      )}
    >
      {children}
    </h3>
  );
}

function PhoneGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="size-[17px]"
    >
      <path
        d="M6.5 3.5h3l1.5 4-2 1.5a10 10 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
