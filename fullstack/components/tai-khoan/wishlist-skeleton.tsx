import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export function WishlistSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-lg border p-3">
              <Skeleton className="aspect-square w-full rounded-md" />
              <Skeleton className="mt-3 h-4 w-16" />
              <Skeleton className="mt-2 h-5 w-full" />
              <Skeleton className="mt-2 h-4 w-24" />
              <Skeleton className="mt-4 h-9 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

