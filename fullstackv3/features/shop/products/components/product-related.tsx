import Link from "next/link";
import { ProductCard } from "@/features/shop/shared/components/product-card";

interface ProductRelatedProps {
  products: any[];
}

export function ProductRelated({ products }: ProductRelatedProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sản phẩm liên quan</h2>
        <Link
          href="/san-pham"
          className="text-sm font-medium text-primary hover:underline"
        >
          Xem tất cả
        </Link>
      </div>
      <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
