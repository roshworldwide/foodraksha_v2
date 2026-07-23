import { Skeleton } from "@/components/ui";

export default function StaffLoading() {
  return (
    <main className="mx-auto flex max-w-[1440px] flex-col px-6 py-4">
      <Skeleton className="mb-4 h-8 w-32" />
      <div className="rounded-card bg-surface p-6 shadow-2">
        <Skeleton className="mb-4 h-10 w-full rounded-pill" />
        <div className="flex flex-col gap-2.5">
          {Array.from({ length: 12 }).map((_, index) => (
            <Skeleton key={index} className="h-[52px] w-full" />
          ))}
        </div>
      </div>
    </main>
  );
}
