import { SkeletonCard } from "@/components/ui";

export default function ApplicationLoading() {
  return (
    <div className="mx-auto flex max-w-[1180px] items-start gap-9 px-6 py-8">
      <div className="hidden w-[260px] shrink-0 lg:block">
        <SkeletonCard lines={8} />
      </div>
      <div className="min-w-0 flex-1">
        <SkeletonCard lines={6} />
      </div>
    </div>
  );
}
