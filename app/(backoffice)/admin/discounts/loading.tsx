import { Skeleton } from "@/components/ui/skeleton"

export default function DiscountsLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-4 w-[350px] mt-2" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-[250px]" />
          <Skeleton className="h-10 w-[150px]" />
        </div>

        <div className="border rounded-md">
          <div className="p-4">
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          </div>

          <div className="border-t">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-4 border-b last:border-b-0">
                <div className="grid grid-cols-7 gap-4">
                  {Array.from({ length: 7 }).map((_, j) => (
                    <Skeleton key={j} className="h-8" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
