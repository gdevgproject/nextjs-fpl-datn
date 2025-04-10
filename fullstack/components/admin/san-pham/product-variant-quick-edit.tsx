"use client"

import { useState } from "react"
import { Check, X, Plus, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface ProductVariant {
  id: string
  volume_ml: number
  price: number
  sale_price: number | null
  sku: string
  stock_quantity: number
}

interface ProductVariantQuickEditProps {
  variant: ProductVariant
  onUpdate: (updatedVariant: ProductVariant) => void
}

export function ProductVariantQuickEdit({ variant, onUpdate }: ProductVariantQuickEditProps) {
  const [stockQuantity, setStockQuantity] = useState(variant.stock_quantity)
  const [price, setPrice] = useState(variant.price)
  const [salePrice, setSalePrice] = useState(variant.sale_price)

  // Xử lý cập nhật số lượng
  const handleUpdateStock = (newStock: number) => {
    setStockQuantity(newStock)
  }

  // Xử lý tăng/giảm số lượng
  const handleAdjustStock = (amount: number) => {
    const newStock = Math.max(0, stockQuantity + amount)
    setStockQuantity(newStock)
  }

  // Xử lý cập nhật giá
  const handleUpdatePrice = (newPrice: number) => {
    setPrice(newPrice)
  }

  // Xử lý cập nhật giá khuyến mãi
  const handleUpdateSalePrice = (newSalePrice: number | null) => {
    setSalePrice(newSalePrice)
  }

  // Xử lý lưu thay đổi
  const handleSave = () => {
    onUpdate({
      ...variant,
      stock_quantity: stockQuantity,
      price,
      sale_price: salePrice,
    })
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          Chỉnh sửa nhanh
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-edit-stock">Tồn kho</Label>
            <div className="flex items-center space-x-2">
              <Button type="button" variant="outline" size="icon" onClick={() => handleAdjustStock(-1)}>
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="quick-edit-stock"
                type="number"
                value={stockQuantity}
                onChange={(e) => handleUpdateStock(Number(e.target.value))}
                className="w-20 text-center"
              />
              <Button type="button" variant="outline" size="icon" onClick={() => handleAdjustStock(1)}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-edit-price">Giá</Label>
            <Input
              id="quick-edit-price"
              type="number"
              value={price}
              onChange={(e) => handleUpdatePrice(Number(e.target.value))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="quick-edit-sale-price">Giá khuyến mãi</Label>
            <Input
              id="quick-edit-sale-price"
              type="number"
              value={salePrice !== null ? salePrice : ""}
              onChange={(e) => {
                const value = e.target.value ? Number(e.target.value) : null
                handleUpdateSalePrice(value)
              }}
              placeholder="Không có"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" size="sm">
              <X className="mr-2 h-4 w-4" />
              Hủy
            </Button>
            <Button type="button" size="sm" onClick={handleSave}>
              <Check className="mr-2 h-4 w-4" />
              Lưu
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

