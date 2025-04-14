import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col border-0 shadow-sm">
      <div className="relative block overflow-hidden">
        <div className="aspect-square relative overflow-hidden bg-muted/30">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
      <CardContent className="flex-grow p-3 sm:p-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-full" />
          <div className="flex gap-1 mt-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-3 sm:p-4 pt-0 flex flex-col gap-2">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <Skeleton className="h-9 w-full" />
      </CardFooter>
    </Card>
  )
}
