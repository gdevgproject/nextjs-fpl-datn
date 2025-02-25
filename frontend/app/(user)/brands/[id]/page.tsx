import { fetchBrand, fetchProducts } from "@/lib/mockData";
import ProductGrid from "@/components/ProductGrid";
import { notFound } from "next/navigation";

interface BrandPageProps {
  params: {
    id: string;
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const brand = await fetchBrand(params.id);
  if (!brand) notFound();

  const allProducts = await fetchProducts();
  const brandProducts = allProducts.filter(
    (product) => product.fragrance_brand_id === params.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{brand.name}</h1>
        <p className="text-gray-600">{brand.description}</p>
      </div>

      {/* Products Grid */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Sản phẩm ({brandProducts.length})
        </h2>
        <ProductGrid products={brandProducts} />
      </div>
    </div>
  );
}
