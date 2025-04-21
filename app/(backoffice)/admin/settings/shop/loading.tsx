import { Skeleton } from "@/components/ui/skeleton";

export default function ShopSettingsLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-10 w-[250px]" />
        <Skeleton className="h-5 w-[450px]" />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-5 w-full max-w-[600px]" />
        </div>

        <div className="space-y-6 border rounded-lg p-6">
          <Skeleton className="h-10 w-[300px]" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-[120px]" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );
}
