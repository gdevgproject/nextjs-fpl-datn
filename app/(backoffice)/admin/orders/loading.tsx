import { Skeleton } from "@/components/ui/skeleton";

export default function OrdersLoading() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-3/4 max-w-[300px]" />
        <Skeleton className="h-5 w-3/4 max-w-[500px]" />
      </div>

      {/* Filters skeleton */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex flex-wrap gap-4">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-10 w-[200px]" />
        </div>
      </div>

      {/* Table skeleton */}
      <div className="space-y-4">
        <div className="rounded-md border">
          <div className="p-4">
            <div className="flex items-center h-10 gap-4">
              <Skeleton className="h-5 w-[80px]" />
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-5 w-[80px]" />
            </div>
          </div>
          <div className="px-4 py-3 border-t">
            <div className="flex justify-between items-center">
              <Skeleton className="h-5 w-[300px]" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-5 w-[80px]" />
                <Skeleton className="h-9 w-9" />
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
