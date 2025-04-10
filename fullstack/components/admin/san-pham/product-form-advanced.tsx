"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductBasicInfoForm } from "@/components/admin/san-pham/product-basic-info-form"
import { ProductImageManager } from "@/components/admin/san-pham/product-image-manager"
import { ProductCategorySelection } from "@/components/admin/san-pham/product-category-selection"
import { ProductFormSkeleton } from "@/components/admin/san-pham/product-form-skeleton"
import { ProductFormActions } from "@/components/admin/san-pham/product-form-actions"
import { ProductFormProgress } from "@/components/admin/san-pham/product-form-progress"
import { ProductFormSaveStatus } from "@/components/admin/san-pham/product-form-save-status"
import { useToast } from "@/components/ui/use-toast"

interface ProductFormAdvancedProps {
  productId?: string
}

export function ProductFormAdvanced({ productId }: ProductFormAdvancedProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("basic")
  const [isLoading, setIsLoading] = useState(!!productId)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [formProgress, setFormProgress] = useState({
    basic: 0,
    images: 0,
    categories: 0,
  })
  const [productName, setProductName] = useState("Sản phẩm mới")

  // Giả lập tải dữ liệu sản phẩm nếu đang chỉnh sửa
  useEffect(() => {
    if (productId) {
      const timer = setTimeout(() => {
        setIsLoading(false)
        setLastSaved(new Date())
        setFormProgress({
          basic: 100,
          images: 100,
          categories: 100,
        })

        // Set product name based on ID for demo
        if (productId === "1") {
          setProductName("Chanel No. 5")
        } else if (productId === "2") {
          setProductName("Dior Sauvage")
        } else {
          setProductName("Sản phẩm #" + productId)
        }
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [productId])

  // Giả lập tự động lưu nháp
  useEffect(() => {
    const autosaveInterval = setInterval(() => {
      if (!isLoading && (formProgress.basic > 0 || formProgress.images > 0 || formProgress.categories > 0)) {
        setLastSaved(new Date())
      }
    }, 30000) // Tự động lưu mỗi 30 giây

    return () => clearInterval(autosaveInterval)
  }, [isLoading, formProgress])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    // Giả lập lưu dữ liệu
    setTimeout(() => {
      setIsSaving(false)
      setLastSaved(new Date())

      toast({
        title: productId ? "Sản phẩm đã được cập nhật" : "Sản phẩm đã được tạo",
        description: productId
          ? "Thông tin sản phẩm đã được cập nhật thành công."
          : "Sản phẩm mới đã được tạo thành công.",
        variant: "default",
      })

      if (!productId) {
        // Nếu là tạo mới, chuyển hướng đến trang danh sách sản phẩm
        router.push("/admin/san-pham")
      }
    }, 1500)
  }

  const updateProgress = (section: string, value: number) => {
    setFormProgress((prev) => ({
      ...prev,
      [section]: value,
    }))
  }

  // Handle product name update from basic info form
  const handleProductNameChange = (name: string) => {
    setProductName(name)
  }

  if (isLoading) {
    return <ProductFormSkeleton />
  }

  const totalProgress = Math.round((formProgress.basic + formProgress.images + formProgress.categories) / 3)

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <ProductFormProgress progress={totalProgress} />
          <ProductFormSaveStatus lastSaved={lastSaved} />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="w-full justify-start sm:w-auto">
              <TabsTrigger value="basic" className="relative">
                Thông tin cơ bản
                {formProgress.basic === 100 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="images" className="relative">
                Hình ảnh
                {formProgress.images === 100 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
              <TabsTrigger value="categories" className="relative">
                Danh mục
                {formProgress.categories === 100 && (
                  <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-green-500" />
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="basic" className="space-y-6">
            <ProductBasicInfoForm
              productId={productId}
              onProgressChange={(value) => updateProgress("basic", value)}
              onProductNameChange={handleProductNameChange}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("images")}>
                Tiếp theo: Hình ảnh
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="images" className="space-y-6">
            <ProductImageManager
              productId={productId || "new"}
              productName={productName}
              onProgressChange={(value) => updateProgress("images", value)}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("basic")}>
                Quay lại: Thông tin cơ bản
              </Button>
              <Button type="button" variant="outline" onClick={() => setActiveTab("categories")}>
                Tiếp theo: Danh mục
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <ProductCategorySelection
              productId={productId}
              onProgressChange={(value) => updateProgress("categories", value)}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setActiveTab("images")}>
                Quay lại: Hình ảnh
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <ProductFormActions productId={productId} isSaving={isSaving} isValid={totalProgress > 50} />
      </div>
    </form>
  )
}

