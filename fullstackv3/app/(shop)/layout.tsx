import { MainLayout } from "@/features/shop/shared/components/main-layout";
import { CartMergeOnLogin } from "@/features/shop/cart/components/cart-merge-on-login";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <CartMergeOnLogin />
      {children}
    </MainLayout>
  );
}
