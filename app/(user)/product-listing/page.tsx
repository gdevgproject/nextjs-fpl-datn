"use client";

import { useState, useEffect } from "react";
import { fetchProducts, fetchCategories, fetchBrands } from "@/lib/mockData";
import type { Product, Category, Brand } from "@/lib/mockData";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProductListing() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const categoryId = searchParams.get("category");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsData, categoriesData, brandsData] = await Promise.all([
          fetchProducts(),
          fetchCategories(),
          fetchBrands(),
        ]);

        // Lọc sản phẩm theo categoryId
        const filteredProducts = categoryId
          ? productsData.filter((product) => product.category === categoryId)
          : productsData;

        setProducts(filteredProducts);
        setCategories(categoriesData);
        setBrands(brandsData);

        // Tìm thông tin category
        if (categoryId) {
          const foundCategory = categoriesData.find(
            (cat) => cat.id === categoryId
          );
          setCategory(foundCategory || null);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [categoryId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header categories={categories} brands={brands} />

      <div className="bg-primary text-white text-center py-2">
        Chào mừng bạn đến với Perfume Shop - Nơi bạn tìm thấy hương thơm hoàn
        hảo cho mình !
      </div>

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="text-sm breadcrumbs mb-6">
            <ul className="flex items-center space-x-2">
              <li>
                <Link
                  href="/product-listing"
                  className="text-gray-500 hover:text-primary"
                >
                  Sản phẩm
                </Link>
              </li>
              {category && <li className="text-primary">{category.name}</li>}
            </ul>
          </div>

          {/* Category Title */}
          <h1 className="text-2xl font-bold mb-6">
            {category ? category.name : "Tất cả sản phẩm"}
          </h1>

          {/* Filter Section */}
          <div className="flex flex-wrap gap-4 mb-6">
            <select className="select select-bordered w-full max-w-xs">
              <option disabled selected>
                Sắp xếp theo
              </option>
              <option>Giá: Thấp đến cao</option>
              <option>Giá: Cao đến thấp</option>
              <option>Mới nhất</option>
              <option>Phổ biến nhất</option>
            </select>

            <select className="select select-bordered w-full max-w-xs">
              <option disabled selected>
                Khoảng giá
              </option>
              <option>Dưới 500.000đ</option>
              <option>500.000đ - 1.000.000đ</option>
              <option>1.000.000đ - 2.000.000đ</option>
              <option>Trên 2.000.000đ</option>
            </select>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative h-48">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-primary font-bold">
                          {product.price.toLocaleString("vi-VN")}đ
                        </p>
                        {product.listed_price > product.price && (
                          <p className="text-sm text-gray-500 line-through">
                            {product.listed_price.toLocaleString("vi-VN")}đ
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {product.stock > 0 ? "Còn hàng" : "Hết hàng"}
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {/* Hiển thị thông báo khi không có sản phẩm */}
          {products.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Không có sản phẩm nào trong danh mục này
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
