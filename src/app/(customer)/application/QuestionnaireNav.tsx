"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { List, ListGroupHeader, ListIcon, ListRow } from "@/components/ui";
import type { SectionProgress } from "@/lib/questionnaire/application";

/**
 * Always-visible section list, 260px. Click any section to jump — nothing is
 * locked, because people fill these forms out of order.
 */
export function QuestionnaireNav({
  sections,
  applicationNo,
}: {
  sections: SectionProgress[];
  applicationNo: string;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Application sections"
      className="sticky top-20 hidden w-[260px] shrink-0 self-start lg:block"
    >
      <ListGroupHeader>{applicationNo}</ListGroupHeader>
      <List>
        {sections.map((section, index) => {
          const href = `/application/${section.key}`;
          const isCurrent = pathname === href;
          return (
            <ListRow
              key={section.key}
              compact
              href={href}
              className={isCurrent ? "bg-white-titanium" : undefined}
              icon={
                <ListIcon
                  tone={
                    section.isComplete
                      ? "done"
                      : isCurrent
                        ? "current"
                        : "pending"
                  }
                >
                  {section.isComplete ? "✓" : index + 1}
                </ListIcon>
              }
              title={
                <span className={isCurrent ? "font-semibold" : undefined}>
                  {section.title}
                </span>
              }
              subtitle={
                section.isComplete
                  ? "Complete"
                  : isCurrent
                    ? "In progress"
                    : "Not started"
              }
            />
          );
        })}
      </List>

      <div className="mt-[18px]">
        <Link
          href="/application/review"
          className="block px-4 text-footnote font-semibold text-label underline"
        >
          Review &amp; submit
        </Link>
      </div>
    </nav>
  );
}
