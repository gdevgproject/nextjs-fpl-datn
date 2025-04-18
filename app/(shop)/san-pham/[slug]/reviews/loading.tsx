import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function ProductReviewsLoading() {
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6 flex items-center space-x-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>

      <div className="space-y-8">
        <Skeleton className="h-10 w-64" />

        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/3">
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-center space-x-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>

                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>

                <Skeleton className="h-10 w-full rounded" />
              </CardContent>
            </Card>
          </div>

          <div className="md:w-2/3 space-y-6">
            <div className="space-y-3">
              <Skeleton className="h-5 w-40" />
              <div className="grid grid-cols-4 gap-2">
                <Skeleton className="aspect-square rounded" />
                <Skeleton className="aspect-square rounded" />
                <Skeleton className="aspect-square rounded" />
                <Skeleton className="aspect-square rounded" />
              </div>
            </div>

            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Skeleton className="h-10 w-10 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                      <Skeleton className="h-4 w-20" />
                    </div>

                    <div className="space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>

                    <Skeleton className="h-8 w-24 rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Skeleton className="h-10 w-40 rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

