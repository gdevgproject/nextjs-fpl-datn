import { Skeleton } from "@/components/ui/skeleton"

export default function BrandsLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb */}
      <div className="container py-4">
        <Skeleton className="h-6 w-64" />
      </div>

      {/* Header */}
      <div className="bg-muted py-8">
        <div className="container">
          <Skeleton className="h-10 w-48 mb-4" />
          <Skeleton className="h-5 w-full max-w-3xl mb-2" />
          <Skeleton className="h-5 w-full max-w-2xl mb-6" />
          <Skeleton className="h-10 w-64" />
        </div>
      </div>

      {/* Featured Brands */}
      <div className="container py-8">
        <Skeleton className="h-8 w-40 mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>

      {/* Alphabetical List */}
      <div className="container py-8">
        <Skeleton className="h-8 w-40 mb-6" />

        {/* Alphabet Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-8" />
          ))}
        </div>

        {/* Brands by Letter */}
        <div className="space-y-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="h-8 w-8 mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-2">
                {Array.from({ length: 8 }).map((_, j) => (
                  <Skeleton key={j} className="h-6 w-32" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

