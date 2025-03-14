"use client";

import { useParams } from "next/navigation";
import { categories, products } from "@/lib/mockData";
import ProductCard from "@/components/product/ProductCard";
import { notFound } from "next/navigation";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params?.category as string;
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState("newest");

  const category = categories.find((cat) => cat.id === categoryId);

  if (!category) {
    notFound();
  }

  const categoryProducts = products.filter(
    (product) => product.category === category.id
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-8 mb-8">
        <h1 className="text-4xl font-bold mb-3">{category.name}</h1>
        <p className="text-gray-600 text-lg">
          Khám phá {categoryProducts.length} sản phẩm nước hoa độc đáo
        </p>
      </div>

      <div className="flex gap-8">
        {/* Filters Sidebar */}
        <div className="w-1/4 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-4">Lọc theo giá</h3>
            <Slider
              value={priceRange}
              onValueChange={setPriceRange}
              min={0}
              max={1000}
              step={10}
              className="mb-4"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-4">Thương hiệu</h3>
            <div className="space-y-3">
              {["Chanel", "Dior", "Gucci", "Tom Ford"].map((brand) => (
                <div key={brand} className="flex items-center">
                  <Checkbox id={brand} className="mr-2" />
                  <label htmlFor={brand} className="text-sm">
                    {brand}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-4">Dung tích</h3>
            <div className="space-y-3">
              {["30ml", "50ml", "100ml", "200ml"].map((size) => (
                <div key={size} className="flex items-center">
                  <Checkbox id={size} className="mr-2" />
                  <label htmlFor={size} className="text-sm">
                    {size}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products Section */}
        <div className="flex-1">
          {/* Sort Controls */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Hiển thị {categoryProducts.length} sản phẩm
            </p>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mới nhất</SelectItem>
                <SelectItem value="price-asc">Giá: Thấp đến Cao</SelectItem>
                <SelectItem value="price-desc">Giá: Cao đến Thấp</SelectItem>
                <SelectItem value="popular">Phổ biến nhất</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
