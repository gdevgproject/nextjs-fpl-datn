"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fetchProduct } from "@/lib/mockData";
import type { Product } from "@/lib/mockData";
import Image from "next/image";
import {
  Heart,
  ShoppingBag,
  Star,
  Share2,
  Truck,
  Shield,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function ProductPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVolume, setSelectedVolume] = useState<number>(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const getProduct = async () => {
      const data = await fetchProduct(productId as string);
      if (data) {
        setProduct(data);
        setSelectedVolume(data.volume[0]);
      }
    };
    getProduct();
  }, [productId]);

  if (!product)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16">
          {/* Gallery */}
          <div className="relative">
            <div className="aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 overflow-hidden">
              <div className="relative h-[600px] w-full">
                <Image
                  src={product.images[currentImageIndex]}
                  alt={product.name}
                  fill
                  className="object-contain"
                  priority
                />
              </div>

              {/* Gallery Controls */}
              <div className="absolute inset-0 flex items-center justify-between p-4">
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev > 0 ? prev - 1 : product.images.length - 1
                    )
                  }
                  className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() =>
                    setCurrentImageIndex((prev) =>
                      prev < product.images.length - 1 ? prev + 1 : 0
                    )
                  }
                  className="p-2 rounded-full bg-white/80 hover:bg-white shadow-lg"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Thumbnail Preview */}
            <div className="mt-4 grid grid-cols-4 gap-4">
              {product.images.map((image, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative h-24 rounded-md overflow-hidden ${
                    currentImageIndex === idx
                      ? "ring-2 ring-blue-600"
                      : "ring-1 ring-gray-200"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} preview ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                {product.name}
              </h1>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* Ratings */}
            <div className="mt-3 flex items-center">
              <div className="flex items-center">
                {[0, 1, 2, 3, 4].map((rating) => (
                  <Star
                    key={rating}
                    className={`w-5 h-5 ${
                      rating < 4 ? "text-yellow-400" : "text-gray-200"
                    }`}
                    fill="currentColor"
                  />
                ))}
              </div>
              <p className="ml-3 text-sm text-gray-500">4.0 (125 đánh giá)</p>
            </div>

            {/* Price */}
            <div className="mt-6">
              <div className="flex items-center">
                <p className="text-3xl font-semibold text-gray-900">
                  ${product.price.toFixed(2)}
                </p>
                <p className="ml-3 text-lg text-gray-500 line-through">
                  ${product.listed_price.toFixed(2)}
                </p>
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-red-100 text-red-800">
                  Tiết kiệm{" "}
                  {Math.round(
                    ((product.listed_price - product.price) /
                      product.listed_price) *
                      100
                  )}
                  %
                </span>
              </div>
            </div>

            {/* Volume Selection */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900">Dung tích</h3>
              <div className="mt-3 flex space-x-3">
                {product.volume.map((vol) => (
                  <button
                    key={vol}
                    onClick={() => setSelectedVolume(vol)}
                    className={`
                      relative flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium
                      ${
                        selectedVolume === vol
                          ? "border-blue-600 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-900 hover:bg-gray-50"
                      }
                    `}
                  >
                    {vol}ml
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-gray-900">Số lượng</h3>
              <div className="mt-3 flex items-center space-x-3">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="rounded-md border border-gray-200 p-2 hover:bg-gray-50"
                >
                  -
                </button>
                <span className="text-lg font-medium">{quantity}</span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock, q + 1))
                  }
                  className="rounded-md border border-gray-200 p-2 hover:bg-gray-50"
                >
                  +
                </button>
                <span className="ml-3 text-sm text-gray-500">
                  Còn {product.stock} sản phẩm
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 flex space-x-4">
              <button className="flex-1 flex items-center justify-center rounded-md border border-blue-600 bg-blue-600 py-3 px-8 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Thêm vào giỏ hàng
              </button>
              <button className="flex items-center justify-center rounded-md border border-gray-200 py-3 px-8 text-base font-medium text-gray-600 hover:bg-gray-50">
                <Share2 className="h-5 w-5" />
              </button>
            </div>

            {/* Benefits */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Truck className="flex-shrink-0 h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Giao hàng miễn phí
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">
                      Đơn hàng trên $100
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="flex-shrink-0 h-6 w-6 text-blue-600" />
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Bảo hành chính hãng
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">12 tháng</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Fragrance Details */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900">
                Thông tin mùi hương
              </h3>
              <div className="mt-4 space-y-6">
                <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Hương đầu</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      {product.top_notes.join(", ")}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Hương giữa</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      {product.middle_notes.join(", ")}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">Hương cuối</h4>
                    <p className="mt-2 text-sm text-gray-500">
                      {product.base_notes.join(", ")}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900">
                      Độ lưu & tỏa hương
                    </h4>
                    <p className="mt-2 text-sm text-gray-500">
                      {product.longevity} • {product.sillage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
