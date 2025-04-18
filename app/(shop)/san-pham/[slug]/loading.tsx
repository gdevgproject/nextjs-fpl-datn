import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function ProductLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Breadcrumb */}
      <div className="container py-4">
        <Skeleton className="h-6 w-2/3" />
      </div>

      {/* Product Main Section */}
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Gallery */}
          <div className="flex flex-col gap-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {Array(4)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="aspect-square w-full rounded-md" />
                ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col space-y-6">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-40 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-5/6" />
            </div>

            <Separator />

            <div className="space-y-4">
              <Skeleton className="h-6 w-32 mb-2" />
              <div className="flex flex-wrap gap-2">
                {Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-8 w-20 rounded-md" />
                  ))}
              </div>

              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />

              <div className="flex items-center space-x-4">
                <div>
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-10 w-28 rounded-md" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-6 w-24 mb-2" />
                  <Skeleton className="h-8 w-28" />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <Skeleton className="h-12 flex-1 rounded-md" />
                <Skeleton className="h-12 w-12 rounded-md" />
                <Skeleton className="h-12 w-12 rounded-md" />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>

            <Separator />

            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <div className="bg-muted py-8">
        <div className="container">
          <div className="mb-6">
            <Skeleton className="h-10 w-64" />
          </div>
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      </div>

      {/* Related Products */}
      <div className="container py-12">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-64 w-full rounded-lg" />
            ))}
        </div>
      </div>
    </div>
  )
}

