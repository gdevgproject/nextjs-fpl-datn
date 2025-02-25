"use client";

import { useParams } from "next/navigation";
import { categories, products } from "@/lib/mockData";
import ProductCard from "@/components/product/ProductCard";
import { notFound } from "next/navigation";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params?.category as string;

  const category = categories.find((cat) => cat.id === categoryId);

  if (!category) {
    notFound();
  }

  // Lọc sản phẩm theo category
  const categoryProducts = products.filter(
    (product) => product.category === category.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-gray-600">
          {categoryProducts.length} sản phẩm được tìm thấy
        </p>
      </div>

      {/* Filters */}
      <div className="flex mb-6">
        <div className="flex space-x-4">
          <select className="border rounded px-3 py-2">
            <option>Sắp xếp theo</option>
            <option>Giá: Thấp đến Cao</option>
            <option>Giá: Cao đến Thấp</option>
            <option>Mới nhất</option>
          </select>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categoryProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
