import { Skeleton, SkeletonCard } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-[720px] px-6 py-10">
      <Skeleton className="h-9 w-1/2" />
      <Skeleton className="mt-3 h-4 w-1/4" />
      <div className="mt-7 flex flex-col gap-[26px]">
        <Skeleton className="h-[168px] w-full rounded-card" />
        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
      </div>
    </main>
  );
}
