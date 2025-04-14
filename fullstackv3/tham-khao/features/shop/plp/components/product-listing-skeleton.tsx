import { ProductCardSkeleton } from "@/features/shop/plp/components/product-card-skeleton"

export function ProductListingSkeleton() {
  return (
    <div className="flex flex-col space-y-6">
      <div className="h-8 w-48 bg-muted rounded animate-pulse" />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter sidebar skeleton */}
        <div className="w-full lg:w-1/4">
          <div className="rounded-lg border p-4 space-y-4">
            <div className="h-6 w-24 bg-muted rounded animate-pulse" />
            <div className="h-px w-full bg-muted" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product listing skeleton */}
        <div className="w-full lg:w-3/4">
          <div className="flex justify-between items-center mb-4">
            <div className="h-5 w-40 bg-muted rounded animate-pulse" />
            <div className="h-5 w-32 bg-muted rounded animate-pulse" />
          </div>

          <div className="h-px w-full bg-muted mb-6" />

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
