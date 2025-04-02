import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function ReviewDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-9 w-9 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-7">
        <div className="md:col-span-4">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <Skeleton className="h-5 w-24 mb-1" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>

              <Separator />

              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex items-center gap-3 sm:w-1/2">
                  <Skeleton className="h-20 w-20 rounded-md" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
                <div className="sm:w-1/2">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-24 w-full rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-24 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-32 w-full rounded-md" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

