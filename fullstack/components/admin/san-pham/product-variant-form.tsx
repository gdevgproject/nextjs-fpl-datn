"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Check, Percent, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductVariant {
  id?: string
  volume_ml: number
  price: number
  sale_price: number | null
  sku: string
  stock_quantity: number
  is_default?: boolean
}

interface ProductVariantFormProps {
  productName?: string
  initialData?: ProductVariant
  onSubmit: (data: Omit<ProductVariant, "id">) => void
  onCancel: () => void
  generateSku?: (volumeMl: number) => string
}

export function ProductVariantForm({
  productName,
  initialData,
  onSubmit,
  onCancel,
  generateSku,
}: ProductVariantFormProps) {
  const [formData, setFormData] = useState<Omit<ProductVariant, "id">>({
    volume_ml: initialData?.volume_ml || 0,
    price: initialData?.price || 0,
    sale_price: initialData?.sale_price || null,
    sku: initialData?.sku || "",
    stock_quantity: initialData?.stock_quantity || 0,
    is_default: initialData?.is_default || false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage")
  const [discountValue, setDiscountValue] = useState<number>(0)
  const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic")

  // Tự động tạo SKU khi thay đổi dung tích
  useEffect(() => {
    if (!initialData && generateSku && formData.volume_ml > 0) {
      setFormData((prev) => ({
        ...prev,
        sku: generateSku(formData.volume_ml),
      }))
    }
  }, [formData.volume_ml, generateSku, initialData])

  // Cập nhật giá khuyến mãi khi thay đổi loại giảm giá hoặc giá trị giảm giá
  useEffect(() => {
    if (discountValue > 0 && formData.price > 0) {
      if (discountType === "percentage") {
        const percentage = Math.min(discountValue, 100)
        const salePrice = Math.round(formData.price * (1 - percentage / 100))
        setFormData((prev) => ({ ...prev, sale_price: salePrice }))
      } else {
        const salePrice = Math.max(formData.price - discountValue, 0)
        setFormData((prev) => ({ ...prev, sale_price: salePrice }))
      }
    } else {
      setFormData((prev) => ({ ...prev, sale_price: null }))
    }
  }, [discountType, discountValue, formData.price])

  // Cập nhật giá trị giảm giá khi thay đổi giá khuyến mãi
  useEffect(() => {
    if (formData.sale_price !== null && formData.price > 0) {
      if (discountType === "percentage") {
        const percentage = Math.round(((formData.price - formData.sale_price) / formData.price) * 100)
        setDiscountValue(percentage)
      } else {
        setDiscountValue(formData.price - formData.sale_price)
      }
    } else {
      setDiscountValue(0)
    }
  }, [formData.sale_price, formData.price, discountType])

  // Cập nhật form data
  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    // Xóa lỗi khi người dùng sửa trường
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.volume_ml || formData.volume_ml <= 0) {
      newErrors.volume_ml = "Dung tích phải lớn hơn 0"
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = "Giá phải lớn hơn 0"
    }

    if (formData.sale_price !== null && formData.sale_price >= formData.price) {
      newErrors.sale_price = "Giá khuyến mãi phải nhỏ hơn giá gốc"
    }

    if (!formData.sku) {
      newErrors.sku = "Mã SKU không được để trống"
    }

    if (formData.stock_quantity < 0) {
      newErrors.stock_quantity = "Tồn kho không được âm"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Xử lý submit form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSubmit(formData)
    }
  }

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  // Tính phần trăm giảm giá
  const calculateDiscountPercentage = (price: number, salePrice: number) => {
    return Math.round(((price - salePrice) / price) * 100)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "basic" | "advanced")}>
        <TabsList className="mb-4">
          <TabsTrigger value="basic">Thông tin cơ bản</TabsTrigger>
          <TabsTrigger value="advanced">Nâng cao</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="volume_ml">
                Dung tích (ml) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="volume_ml"
                type="number"
                value={formData.volume_ml || ""}
                onChange={(e) => handleChange("volume_ml", Number(e.target.value))}
                className={errors.volume_ml ? "border-red-500" : ""}
              />
              {errors.volume_ml && <p className="text-sm text-red-500">{errors.volume_ml}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock_quantity">
                Tồn kho <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stock_quantity"
                type="number"
                value={formData.stock_quantity || ""}
                onChange={(e) => handleChange("stock_quantity", Number(e.target.value))}
                className={errors.stock_quantity ? "border-red-500" : ""}
              />
              {errors.stock_quantity && <p className="text-sm text-red-500">{errors.stock_quantity}</p>}
              {formData.stock_quantity === 0 && (
                <p className="text-sm text-amber-500">Sản phẩm sẽ hiển thị là hết hàng</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">
              Giá <span className="text-red-500">*</span>
            </Label>
            <Input
              id="price"
              type="number"
              value={formData.price || ""}
              onChange={(e) => handleChange("price", Number(e.target.value))}
              className={errors.price ? "border-red-500" : ""}
            />
            {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="discount">Giảm giá</Label>
              <div className="flex items-center space-x-2">
                <Label htmlFor="discount_type" className="text-sm">
                  Loại giảm giá:
                </Label>
                <div className="flex items-center rounded-md border p-1">
                  <Button
                    type="button"
                    variant={discountType === "percentage" ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs px-2"
                    onClick={() => setDiscountType("percentage")}
                  >
                    <Percent className="mr-1 h-3 w-3" />%
                  </Button>
                  <Button
                    type="button"
                    variant={discountType === "fixed" ? "secondary" : "ghost"}
                    size="sm"
                    className="text-xs px-2"
                    onClick={() => setDiscountType("fixed")}
                  >
                    VND
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <div className="flex-1">
                <Input
                  id="discount"
                  type="number"
                  value={discountValue || ""}
                  onChange={(e) => setDiscountValue(Number(e.target.value))}
                  placeholder={discountType === "percentage" ? "Nhập % giảm giá" : "Nhập số tiền giảm"}
                />
              </div>
              <div className="w-[120px]">
                <Input
                  id="sale_price"
                  type="number"
                  value={formData.sale_price !== null ? formData.sale_price : ""}
                  onChange={(e) => {
                    const value = e.target.value ? Number(e.target.value) : null
                    handleChange("sale_price", value)
                  }}
                  placeholder="Giá sau giảm"
                  className={errors.sale_price ? "border-red-500" : ""}
                />
              </div>
            </div>
            {errors.sale_price && <p className="text-sm text-red-500">{errors.sale_price}</p>}
            {formData.sale_price !== null && formData.price > 0 && (
              <p className="text-sm text-muted-foreground">
                Giá sau giảm: {formatPrice(formData.sale_price)} (Giảm{" "}
                {calculateDiscountPercentage(formData.price, formData.sale_price)}%)
              </p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sku">
              Mã SKU <span className="text-red-500">*</span>
            </Label>
            <div className="flex space-x-2">
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => handleChange("sku", e.target.value)}
                className={errors.sku ? "border-red-500" : ""}
              />
              {generateSku && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleChange("sku", generateSku(formData.volume_ml))}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Tạo mã SKU tự động</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {errors.sku && <p className="text-sm text-red-500">{errors.sku}</p>}
            <p className="text-xs text-muted-foreground">
              Mã SKU dùng để quản lý kho và đơn hàng. Nên đặt mã dễ nhớ và không trùng lặp.
            </p>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => handleChange("is_default", checked)}
            />
            <Label htmlFor="is_default">Đặt làm biến thể mặc định</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Biến thể mặc định sẽ được chọn sẵn khi khách hàng xem sản phẩm.
          </p>

          {formData.stock_quantity <= 10 && formData.stock_quantity > 0 && (
            <Alert variant="warning" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Tồn kho thấp</AlertTitle>
              <AlertDescription>
                Biến thể này có tồn kho thấp ({formData.stock_quantity}). Hãy cân nhắc nhập thêm hàng.
              </AlertDescription>
            </Alert>
          )}

          {formData.stock_quantity === 0 && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Hết hàng</AlertTitle>
              <AlertDescription>
                Biến thể này đã hết hàng. Khách hàng sẽ không thể mua được cho đến khi có hàng.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">{initialData ? "Cập nhật" : "Thêm biến thể"}</Button>
      </div>
    </form>
  )
}

