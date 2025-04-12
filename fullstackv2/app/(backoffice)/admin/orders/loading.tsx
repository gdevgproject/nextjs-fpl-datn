import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
      </div>

      <div className="space-y-4">
        {/* Filters skeleton */}
        <div className="bg-card rounded-md border p-4 shadow-sm">
          <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="w-full md:w-[180px] space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="w-full md:w-[180px] space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="w-full md:w-[180px] space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="w-full md:w-[180px] space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Table skeleton */}
        <div className="rounded-md border shadow-sm">
          <div className="p-4">
            <div className="h-10 flex items-center border-b pb-4">
              <Skeleton className="h-4 w-[80px]" />
              <Skeleton className="h-4 w-[120px] ml-8" />
              <Skeleton className="h-4 w-[150px] ml-8" />
              <Skeleton className="h-4 w-[100px] ml-8" />
              <Skeleton className="h-4 w-[100px] ml-8" />
              <Skeleton className="h-4 w-[100px] ml-8" />
            </div>

            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 flex items-center border-b">
                <Skeleton className="h-4 w-[60px]" />
                <Skeleton className="h-4 w-[100px] ml-8" />
                <div className="ml-8">
                  <Skeleton className="h-4 w-[120px] mb-2" />
                  <Skeleton className="h-4 w-[80px]" />
                </div>
                <Skeleton className="h-4 w-[80px] ml-8" />
                <Skeleton className="h-6 w-[80px] ml-8" />
                <Skeleton className="h-6 w-[80px] ml-8" />
                <Skeleton className="h-8 w-8 ml-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Pagination skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-[200px]" />
          <div className="flex items-center space-x-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-4 w-[80px]" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </div>
    </div>
  )
}
