import { Skeleton } from "@/components/ui/skeleton"

export default function CompareProductsLoading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col space-y-6">
        <div>
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-80 w-full rounded-lg" />
            ))}
          <Skeleton className="h-80 w-full rounded-lg" />
        </div>

        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  )
}

