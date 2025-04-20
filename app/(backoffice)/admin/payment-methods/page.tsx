import { Suspense } from "react";
import { PaymentMethodsPage } from "@/features/admin/payment-methods/components/payment-methods-page";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function PaymentMethodsPageContainer() {
  return (
    <div className="container py-6">
      <Suspense fallback={<PaymentMethodsSkeleton />}>
        <PaymentMethodsPage />
      </Suspense>
    </div>
  );
}

function PaymentMethodsSkeleton() {
  return (
    <div className="w-full space-y-4">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[250px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>
      <Skeleton className="h-12 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="flex items-center justify-center">
        <Skeleton className="h-10 w-[350px]" />
      </div>
    </div>
  );
}
