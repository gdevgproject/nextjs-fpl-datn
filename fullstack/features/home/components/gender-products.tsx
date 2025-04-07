"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductCard } from "@/components/shared/product-card";
import type { Product } from "../types";

interface GenderProductsProps {
  menProducts: Product[];
  womenProducts: Product[];
}

export function GenderProducts({
  menProducts,
  womenProducts,
}: GenderProductsProps) {
  // Skip rendering if no products for either gender
  if (
    (!menProducts || menProducts.length === 0) &&
    (!womenProducts || womenProducts.length === 0)
  ) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-accent/10">
      <div className="container">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold">
            Nước hoa theo giới tính
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Khám phá bộ sưu tập nước hoa dành riêng cho nam và nữ
          </p>
        </div>

        <Tabs defaultValue="women" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="women">Nữ</TabsTrigger>
              <TabsTrigger value="men">Nam</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="women" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {womenProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="men" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {menProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}
