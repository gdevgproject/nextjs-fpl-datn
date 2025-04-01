import { Skeleton } from "@/components/ui/skeleton"

export function ProductCompareSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array(2)
          .fill(0)
          .map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-4">
              <div className="flex justify-center">
                <Skeleton className="h-40 w-40" />
              </div>
              <Skeleton className="h-5 w-full" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
              <Skeleton className="h-4 w-16 mx-auto" />
              <Skeleton className="h-5 w-24 mx-auto" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
        <div className="border rounded-lg p-4 flex flex-col items-center justify-center">
          <Skeleton className="h-16 w-16 rounded-full" />
          <Skeleton className="h-5 w-32 mt-4" />
          <Skeleton className="h-4 w-48 mt-2" />
        </div>
      </div>

      <div>
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full flex-shrink-0" />
            ))}
        </div>
      </div>

      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

