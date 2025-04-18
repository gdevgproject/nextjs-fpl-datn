import { Skeleton } from "@/components/ui/skeleton"

export default function BannersLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-5 w-[450px]" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
      <div className="rounded-md border">
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  )
}
