import { Skeleton } from "@/components/ui/skeleton"

export default function ReviewPageLoading() {
  return (
    <div className="container py-6 md:py-10">
      <div className="mb-6 flex items-center space-x-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 md:h-10 md:w-64" />
          <Skeleton className="mt-2 h-4 w-full max-w-md" />
        </div>

        <div className="space-y-6">
          <div className="flex items-start space-x-4">
            <Skeleton className="h-20 w-20 rounded" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="flex space-x-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-8 rounded-full" />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-32 w-full" />
          </div>

          <div className="flex space-x-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    </div>
  )
}

