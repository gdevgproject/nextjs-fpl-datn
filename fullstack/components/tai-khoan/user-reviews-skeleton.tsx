import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter } from "@/components/ui/card"

export function UserReviewsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-full sm:w-48" />
      </div>

      <div className="grid w-full grid-cols-3 gap-1">
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
        <Skeleton className="h-10 rounded-lg" />
      </div>

      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <Skeleton className="h-16 w-16 rounded" />
                <div className="flex-1 space-y-2">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <Skeleton className="h-5 w-40" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 p-4 pt-0 border-t mt-4">
              <Skeleton className="h-9 w-24 rounded" />
              <Skeleton className="h-9 w-20 rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}

