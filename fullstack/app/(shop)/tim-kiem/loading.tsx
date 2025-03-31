import { Skeleton } from "@/components/ui/skeleton"

export default function SearchLoading() {
  return (
    <div className="container py-6 md:py-10">
      <Skeleton className="h-10 w-64 mb-6" />

      <div className="mb-8">
        <Skeleton className="h-12 w-full" />
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-60 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

