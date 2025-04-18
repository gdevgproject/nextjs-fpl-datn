import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto py-6 space-y-4">
      <Skeleton className="h-10 w-[250px]" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-[300px]" />
        <Skeleton className="h-10 w-[150px]" />
      </div>
      <div className="border rounded-md">
        <div className="p-4">
          <div className="h-8 flex items-center gap-4 border-b pb-4">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-[150px]" />
          </div>
          {Array(5)
            .fill(null)
            .map((_, i) => (
              <div key={i} className="h-16 flex items-center gap-4 border-b py-2">
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[150px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[100px]" />
                <Skeleton className="h-4 w-[150px]" />
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
