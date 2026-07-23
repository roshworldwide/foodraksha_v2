import { Skeleton, SkeletonCard } from "@/components/ui";

export default function DashboardLoading() {
  return (
    <main className="mx-auto max-w-[1120px] px-6 py-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="mt-2 h-4 w-40" />
      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="flex flex-col gap-6">
          <Skeleton className="h-[210px] w-full rounded-card" />
          <SkeletonCard lines={2} />
        </div>
        <div className="flex flex-col gap-6">
          <SkeletonCard lines={6} />
          <SkeletonCard lines={3} />
        </div>
      </div>
    </main>
  );
}
