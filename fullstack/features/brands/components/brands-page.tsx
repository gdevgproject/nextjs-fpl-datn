import { Suspense } from "react";
import { getAllBrands, getBrandProductCounts } from "../queries";
import { BrandCard } from "./brand-card";
import { BrandCardSkeleton } from "./brand-card-skeleton";
import type { Brand } from "../types";

export async function BrandsPage() {
  // Lấy tất cả thương hiệu
  const brands = await getAllBrands();

  // Lấy số lượng sản phẩm trong mỗi thương hiệu
  const productCounts = await getBrandProductCounts();

  // Thương hiệu có logo
  const brandsWithLogo = brands.filter((brand) => brand.logo_url);
  const brandsWithoutLogo = brands.filter((brand) => !brand.logo_url);

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Thương hiệu</h1>
        <p className="text-muted-foreground">
          Khám phá các thương hiệu nước hoa cao cấp tại MyBeauty
        </p>
      </div>

      {/* Thương hiệu có logo */}
      {brandsWithLogo.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Thương hiệu nổi bật</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            <Suspense fallback={<BrandCardSkeletons count={5} />}>
              {brandsWithLogo.map((brand) => (
                <BrandCard
                  key={brand.id}
                  brand={brand}
                  productCount={productCounts[brand.id] || 0}
                />
              ))}
            </Suspense>
          </div>
        </div>
      )}

      {/* Tất cả thương hiệu */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold mb-4">Tất cả thương hiệu</h2>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          <Suspense fallback={<BrandCardSkeletons count={10} />}>
            {brands.map((brand) => (
              <BrandCard
                key={brand.id}
                brand={brand}
                productCount={productCounts[brand.id] || 0}
              />
            ))}
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function BrandCardSkeletons({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <BrandCardSkeleton key={i} />
      ))}
    </>
  );
}
