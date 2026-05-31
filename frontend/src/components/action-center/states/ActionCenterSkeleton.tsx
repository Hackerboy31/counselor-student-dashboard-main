import { Skeleton } from "@/components/ui/skeleton";

export function ActionCenterSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-lg" />
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-44" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>

      <Skeleton className="h-[72px] w-full rounded-lg" />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-2 lg:col-span-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-[88px] w-full rounded-md" />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <Skeleton className="h-44 w-full rounded-lg" />
          <Skeleton className="h-44 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
