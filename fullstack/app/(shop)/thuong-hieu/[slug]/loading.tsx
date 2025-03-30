import { Skeleton } from "@/components/ui/skeleton"

export default function BrandLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb */}
      <div className="container py-4">
        <Skeleton className="h-6 w-64" />
      </div>

      {/* Brand Banner */}
      <div className="w-full">
        <Skeleton className="h-40 md:h-60 w-full" />
      </div>

      {/* Brand Content */}
      <div className="container py-8">
        <Skeleton className="h-10 w-64 mb-6" />

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <Skeleton className="h-[400px] w-full" />
          </div>

          {/* Products */}
          <div className="flex-1">
            {/* Controls */}
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square" />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center">
              <Skeleton className="h-10 w-64" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

