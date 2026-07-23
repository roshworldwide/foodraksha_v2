import { cn } from "@/lib/cn";

export interface TimelineItem {
  label: string;
  /** done = filled, now = current with a ring, upcoming = hollow + dimmed. */
  state: "done" | "now" | "upcoming";
  /** Sub-line under the label. */
  detail?: string;
}

/**
 * The vertical status timeline from the design system — a rail with a node per
 * milestone. Node styling encodes state: complete, current, or upcoming.
 */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative pl-[26px]">
      <span
        aria-hidden="true"
        className="absolute top-2 bottom-2 left-[7px] w-0.5 rounded-full bg-surface-sunk"
      />
      {items.map((item, index) => (
        <li key={index} className="relative pb-[19px] last:pb-0">
          <span
            aria-hidden="true"
            className={cn(
              "absolute top-[5px] -left-[24px] size-3 rounded-full border-[2.5px]",
              item.state === "done" && "border-ok bg-ok",
              item.state === "now" &&
                "border-graphite bg-graphite shadow-[0_0_0_4px_rgba(29,29,31,0.13)]",
              item.state === "upcoming" && "border-nat-titanium bg-surface",
            )}
          />
          <p
            className={cn(
              "text-[15px] font-semibold tracking-[-0.008em]",
              item.state === "upcoming" && "text-label-3",
            )}
          >
            {item.label}
          </p>
          {item.detail && (
            <p className="text-footnote text-label-2">{item.detail}</p>
          )}
        </li>
      ))}
    </ol>
  );
}
