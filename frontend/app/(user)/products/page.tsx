"use client";

import { useState, useEffect } from "react";
import { fetchProducts } from "@/lib/mockData";
import type { Product } from "@/lib/mockData";
import ProductCard from "../../../components/ProductCard";
import { Filter, ChevronLeft, ChevronRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    gender: "",
    priceRange: "",
    concentration: "",
  });

  // Số sản phẩm trên mỗi trang
  const ITEMS_PER_PAGE = 12;

  useEffect(() => {
    const loadProducts = async () => {
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);
    };
    loadProducts();
  }, []);

  // Lọc sản phẩm
  const filteredProducts = products.filter((product) => {
    // Xử lý lọc theo khoảng giá
    const [minPrice, maxPrice] = filters.priceRange
      ? filters.priceRange.split("-").map(Number)
      : [0, Infinity];

    const priceInRange =
      filters.priceRange === "150+"
        ? product.price >= 150
        : product.price >= minPrice && product.price <= maxPrice;

    return (
      (!filters.category || product.category === filters.category) &&
      (!filters.brand || product.fragrance_brand_id === filters.brand) &&
      (!filters.gender || product.gender === filters.gender) &&
      (!filters.concentration ||
        product.concentration === filters.concentration) &&
      (!filters.priceRange || priceInRange)
    );
  });

  // Phân trang
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  if (loading) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Tất cả sản phẩm</h1>
          <button
            className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
            onClick={() => {
              /* Toggle filter sidebar */
            }}
          >
            <Filter className="w-5 h-5" />
            Bộ lọc
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
            className="border rounded-md px-3 py-2"
          >
            <option value="">Tất cả danh mục</option>
            <option value="c1">Nước hoa nam</option>
            <option value="c2">Nước hoa nữ</option>
            <option value="c3">Nước hoa unisex</option>
          </select>

          <select
            value={filters.brand}
            onChange={(e) => setFilters({ ...filters, brand: e.target.value })}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Tất cả thương hiệu</option>
            <option value="b1">Chanel</option>
            <option value="b2">Dior</option>
            <option value="b3">Gucci</option>
            <option value="b4">Tom Ford</option>
            <option value="b5">Hermes</option>
          </select>

          <select
            value={filters.gender}
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            className="border rounded-md px-3 py-2"
          >
            <option value="">Tất cả giới tính</option>
            <option value="male">Nam</option>
            <option value="female">Nữ</option>
            <option value="unisex">Unisex</option>
          </select>

          <select
            value={filters.concentration}
            onChange={(e) =>
              setFilters({ ...filters, concentration: e.target.value })
            }
            className="border rounded-md px-3 py-2"
          >
            <option value="">Tất cả nồng độ</option>
            <option value="Parfum">Parfum</option>
            <option value="Eau de Parfum">Eau de Parfum</option>
            <option value="Eau de Toilette">Eau de Toilette</option>
            <option value="Eau de Cologne">Eau de Cologne</option>
            <option value="Eau Fraiche">Eau Fraiche</option>
          </select>

          <select
            value={filters.priceRange}
            onChange={(e) =>
              setFilters({ ...filters, priceRange: e.target.value })
            }
            className="border rounded-md px-3 py-2"
          >
            <option value="">Tất cả giá</option>
            <option value="0-50">Dưới $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-150">$100 - $150</option>
            <option value="150+">Trên $150</option>
          </select>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {paginatedProducts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Không tìm thấy sản phẩm phù hợp
            </div>
          ) : (
            paginatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center space-x-4 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>
    </>
  );
}
