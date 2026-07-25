"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { buttonClass } from "./Button";
import { DocumentChecker } from "./DocumentChecker";
import { FssaiCalculator } from "./FssaiCalculator";

/**
 * The two /services tools in one slot directly below the hero: the licence + fee
 * calculator and the document requirements checker.
 *
 * Why they share a slot rather than sitting as two sections: the checker used to
 * live below the three-licence explainer, so "Check my documents" in the hero
 * meant a two-viewport scroll. Here either hero button shows its tool in place,
 * immediately under the fold.
 *
 * These two pill buttons ARE the tabs. They used to be duplicated as hero
 * anchors (#find / #documents) driving this component through the hash, and that
 * broke in two ways: clicking the button for the already-active tool did nothing
 * visible, and once the user switched with the tab bar the hash went stale — so
 * re-clicking the hero button fired no `hashchange` and the button was simply
 * dead. One control owning the state removes the whole class of bug.
 *
 * The hash is still read (on mount, and on hashchange) so /services#documents
 * from anywhere else opens the checker — but nothing on this page depends on it.
 *
 * Both panels are server-rendered; the inactive one is `hidden`, not
 * visibility-hidden. That keeps the document checklist in the HTML for crawlers
 * without reserving the taller panel's height as dead space under the shorter
 * one — the two differ by roughly 600px, so reserving would be worse than the
 * height change on switch.
 */

const TABS = [
  { id: "licence", label: "Find my licence & fee", hash: "find", step: "1" },
  {
    id: "documents",
    label: "Check my documents",
    hash: "documents",
    step: "2",
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

function tabForHash(hash: string): TabId | null {
  const clean = hash.replace(/^#/, "");
  return TABS.find((tab) => tab.hash === clean)?.id ?? null;
}

export function ServiceTools({ className }: { className?: string }) {
  const uid = useId();
  const [active, setActive] = useState<TabId>("licence");
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  // Follow the hash, so the hero's "Check my documents" selects the right tool.
  useEffect(() => {
    const sync = () => {
      const next = tabForHash(window.location.hash);
      if (next) setActive(next);
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

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
    <div className={className}>
      {/* Styled with the shared buttonClass so these read as the page's primary
          actions — the blue/ghost pair the hero used to show — while actually
          being a tablist that reflects which tool is open. */}
      <div
        role="tablist"
        aria-label="FSSAI tools"
        className="flex flex-wrap items-center justify-center gap-3"
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
              className={buttonClass({
                variant: selected ? "blue" : "ghost",
                size: "lg",
                className: selected ? "shadow-fr-blue" : undefined,
              })}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-[11px] font-bold",
                  selected
                    ? "bg-white/25 text-white"
                    : "bg-fr-bg text-fr-ink-2",
                )}
              >
                {tab.step}
              </span>
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-[13.5px] text-fr-ink-2">
        {active === "licence"
          ? "Step 1 — find your licence and the government fee."
          : "Step 2 — see exactly which documents it takes."}
      </p>

      <div
        id={panelId("licence")}
        role="tabpanel"
        aria-labelledby={tabId("licence")}
        hidden={active !== "licence"}
        className="mt-7"
      >
        <div className="grid gap-9 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-12">
          <div>
            <h3 className="text-title-1 tracking-[-0.02em] text-fr-ink">
              Your licence and the exact government fee
            </h3>
            <p className="mt-3 max-w-[520px] text-[16px] leading-relaxed text-fr-ink-2">
              Most kinds of business follow turnover, but plenty do not — an
              importer, a 5-star hotel and a caterer are all decided by what
              they do, not what they earn. The calculator applies the full
              official matrix, all 48 FoSCoS categories, on the fee schedule
              updated 1 April 2026.
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {[
                "Registration, State or Central — the right one for your category",
                "The government fee per year, shown separately from our fee",
                "Concessional fees where they apply, and waived fees where they do",
              ].map((item) => (
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
          </div>
          <FssaiCalculator
            title="Which licence do you need?"
            headingLevel="h3"
          />
        </div>
      </div>

      <div
        id={panelId("documents")}
        role="tabpanel"
        aria-labelledby={tabId("documents")}
        hidden={active !== "documents"}
        className="mt-7"
      >
        <DocumentChecker />
      </div>
    </div>
  );
}
