"use client"

import { useState } from "react"
import { Minus, Plus, Share2, Gift, Star, Percent, RotateCcw, Truck, Pill } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useCart } from "@/features/cart/hooks/useCart"
import { cn } from "@/utils/helpers"
import type { Product, ProductVariant } from "@/features/product/types/productTypes"

interface ProductInfoProps {
  product: Product
}

export default function ProductInfo({ product }: ProductInfoProps) {
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(product.currentVariant || product.variants[0])
  const { addItem, isLoading } = useCart()

  const handleQuantityChange = (value: number) => {
    if (value >= 1) {
      setQuantity(value)
    }
  }

  const handleVariantChange = (variant: ProductVariant) => {
    setSelectedVariant(variant)
  }

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      name: product.name,
      price: selectedVariant.price,
      originalPrice: selectedVariant.originalPrice,
      quantity,
      unit: selectedVariant.name,
      image: product.images?.[0]?.url,
    })
  }

  return (
    <div className="space-y-6">
      {/* Brand & Title */}
      <div>
        <div className="text-sm text-[#0D6EFD]">
          Thương hiệu: <span className="font-medium">{product.brand}</span>
        </div>
        <h1 className="mt-2 text-2xl font-bold text-[#111827]">{product.name}</h1>
        <p className="mt-2 text-sm text-[#6B7280]">{product.shortDescription}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <span className="text-sm text-[#6B7280]">{product.code}</span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-[#FFA800] text-[#FFA800]" />
              <span className="font-medium text-[#111827]">{product.rating}</span>
            </div>
            <span className="text-[#FFA800]">({product.reviewCount} đánh giá)</span>
            <span className="text-[#0D6EFD]">• {product.commentCount} bình luận</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 rounded-full bg-[#1877F2] px-3 text-white hover:bg-[#1877F2]/90"
          >
            <Share2 className="mr-2 h-4 w-4" />
            Chia sẻ
          </Button>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-3">
        <div className="flex items-baseline gap-2">
          <span className="text-[28px] font-bold text-[#0D6EFD]">{selectedVariant.price.toLocaleString()}đ</span>
          <span className="text-sm text-[#6B7280]">/ {selectedVariant.name}</span>
        </div>
        {selectedVariant.originalPrice && (
          <span className="text-sm text-[#9CA3AF] line-through">{selectedVariant.originalPrice.toLocaleString()}đ</span>
        )}
      </div>

      {/* Unit Selection */}
      <div className="flex items-center gap-6">
        <span className="text-sm text-[#111827]">Chọn đơn vị tính</span>
        <div className="flex gap-2">
          {product.variants.map((variant) => (
            <button
              key={variant.id}
              onClick={() => handleVariantChange(variant)}
              className={cn(
                "h-9 rounded-full px-6 text-sm font-medium transition-all",
                selectedVariant.id === variant.id
                  ? "bg-[#0D6EFD] text-white"
                  : "border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#0D6EFD]",
              )}
            >
              {variant.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-5 gap-x-8 gap-y-3 text-sm">
        <div className="col-span-2 text-[#6B7280]">Danh mục</div>
        <div className="col-span-3 text-[#0D6EFD]">{product.category?.name}</div>

        <div className="col-span-2 text-[#6B7280]">Dạng bào chế</div>
        <div className="col-span-3 text-[#111827]">{product.dosageForm}</div>

        <div className="col-span-2 text-[#6B7280]">Quy cách</div>
        <div className="col-span-3 text-[#111827]">{selectedVariant.specification}</div>

        <div className="col-span-2 text-[#6B7280]">Xuất xứ thương hiệu</div>
        <div className="col-span-3 text-[#111827]">{product.origin}</div>

        <div className="col-span-2 text-[#6B7280]">Nhà sản xuất</div>
        <div className="col-span-3 text-[#111827]">{product.manufacturer}</div>

        <div className="col-span-2 text-[#6B7280]">Nước sản xuất</div>
        <div className="col-span-3 text-[#111827]">{product.manufacturingCountry}</div>

        <div className="col-span-2 text-[#6B7280]">Thành phần</div>
        <div className="col-span-3 space-y-1">
          <div className="text-[#111827]">{product.ingredients}</div>
          <div className="text-[#6B7280]">{product.ingredientsDescription}</div>
        </div>

        <div className="col-span-2 text-[#6B7280]">Số đăng ký</div>
        <div className="col-span-3 text-[#111827]">{product.registrationNumber}</div>
      </div>

      {/* Promotions */}
      {product.promotions && product.promotions.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-[#E5E7EB]">
          <div className="flex items-center gap-2 bg-[#FFF5F0] p-3">
            <Gift className="h-5 w-5 text-[#FF5C00]" />
            <h3 className="font-medium text-[#111827]">Khuyến mãi được áp dụng</h3>
          </div>
          {product.promotions.map((promo) => (
            <div key={promo.id} className="p-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0D6EFD]">
                  <Percent className="h-4 w-4 text-white" />
                </div>
                <p className="text-sm text-[#6B7280]">
                  Giảm ngay {promo.discountPercent}% {promo.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-[#111827]">Chọn số lượng</span>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
            className="h-10 w-10 rounded-l-[100px] rounded-r-none border-[#E5E7EB] hover:bg-transparent disabled:bg-transparent"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <input
            type="number"
            value={quantity}
            onChange={(e) => handleQuantityChange(Number(e.target.value))}
            min="1"
            className="h-10 w-16 border-y border-[#E5E7EB] bg-transparent px-3 text-center text-sm [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleQuantityChange(quantity + 1)}
            className="h-10 w-10 rounded-l-none rounded-r-[100px] border-[#E5E7EB] hover:bg-transparent"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleAddToCart}
          disabled={isLoading}
          className="flex-1 rounded-[100px] bg-[#0D6EFD] py-3 text-base font-medium text-white hover:bg-[#0D6EFD]/90 disabled:bg-[#0D6EFD]/70"
        >
          Chọn mua
        </Button>
        <Button
          variant="outline"
          className="flex-1 rounded-[100px] border-0 bg-[#F8F9FA] py-3 text-base font-medium text-[#0D6EFD] hover:bg-[#F8F9FA]/80"
        >
          Tìm nhà thuốc
        </Button>
      </div>

      {/* Policy Cards */}
      <div className="grid grid-cols-3 gap-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D6EFD]/10">
            <RotateCcw className="h-5 w-5 text-[#0D6EFD]" />
          </div>
          <div>
            <p className="font-medium text-[#111827]">Đổi trả trong 30 ngày</p>
            <p className="text-sm text-[#6B7280]">Kể từ ngày mua hàng</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D6EFD]/10">
            <Truck className="h-5 w-5 text-[#0D6EFD]" />
          </div>
          <div>
            <p className="font-medium text-[#111827]">Miễn phí vận chuyển</p>
            <p className="text-sm text-[#6B7280]">Theo chính sách giao hàng</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0D6EFD]/10">
            <Pill className="h-5 w-5 text-[#0D6EFD]" />
          </div>
          <div>
            <p className="font-medium text-[#111827]">Miễn phí 100%</p>
            <p className="text-sm text-[#6B7280]">Đổi thuốc</p>
          </div>
        </div>
      </div>
    </div>
  )
}

