"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Info, Image, Layers, Tag, Droplets, Leaf } from "lucide-react"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useProductForm } from "./product-form-context"
import { ProductFormActions } from "./product-form-actions"
import { ProductFormSaveStatus } from "./product-form-save-status"
import { ProductFormProgress } from "./product-form-progress"
import { ProductFormPreview } from "./product-form-preview"
import { ProductFormValidation } from "./product-form-validation"

interface ProductFormTabsProps {
  children: React.ReactNode
  isEditing?: boolean
}

export function ProductFormTabs({ children, isEditing = false }: ProductFormTabsProps) {
  const [activeTab, setActiveTab] = useState("basic")
  const { errors, summary, formData } = useProductForm()
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Tìm tab có lỗi
  useEffect(() => {
    if (errors.length > 0) {
      const tabsWithErrors = new Set(errors.filter((e) => e.severity === "error").map((e) => e.tab))

      // Map tab name từ error đến tab value
      const tabMapping: Record<string, string> = {
        "Thông tin cơ bản": "basic",
        "Hình ảnh": "images",
        "Biến thể": "variants",
        "Danh mục": "categories",
        "Hương thơm": "scents",
        "Thành phần": "ingredients",
      }

      // Tìm tab đầu tiên có lỗi
      for (const tab of tabsWithErrors) {
        if (tab && tabMapping[tab]) {
          setActiveTab(tabMapping[tab])
          break
        }
      }
    }
  }, [errors])

  // Hiển thị badge lỗi cho tab
  const getTabErrorBadge = (tabName: string) => {
    const tabErrors = errors.filter((e) => {
      const tabMapping: Record<string, string> = {
        basic: "Thông tin cơ bản",
        images: "Hình ảnh",
        variants: "Biến thể",
        categories: "Danh mục",
        scents: "Hương thơm",
        ingredients: "Thành phần",
      }

      return e.tab === tabMapping[tabName]
    })

    const errorCount = tabErrors.filter((e) => e.severity === "error").length
    const warningCount = tabErrors.filter((e) => e.severity === "warning").length

    if (errorCount > 0) {
      return (
        <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-800">
          {errorCount}
        </span>
      )
    }

    if (warningCount > 0) {
      return (
        <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-800">
          {warningCount}
        </span>
      )
    }

    return null
  }

  // Hiển thị trên desktop
  if (isDesktop) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</CardTitle>
              <CardDescription>
                {isEditing ? "Cập nhật thông tin sản phẩm hiện có" : "Nhập thông tin chi tiết cho sản phẩm mới"}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="basic"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Thông tin cơ bản
                    {getTabErrorBadge("basic")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="images"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Hình ảnh
                    {getTabErrorBadge("images")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="variants"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    Biến thể
                    {getTabErrorBadge("variants")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="categories"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                  >
                    <Tag className="mr-2 h-4 w-4" />
                    Danh mục
                    {getTabErrorBadge("categories")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="scents"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                  >
                    <Droplets className="mr-2 h-4 w-4" />
                    Hương thơm
                    {getTabErrorBadge("scents")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="ingredients"
                    className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                  >
                    <Leaf className="mr-2 h-4 w-4" />
                    Thành phần
                    {getTabErrorBadge("ingredients")}
                  </TabsTrigger>
                </TabsList>
                <div className="p-6">{children}</div>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-6">
              <ProductFormSaveStatus />
              <ProductFormActions isEditing={isEditing} />
            </CardFooter>
          </Card>
        </div>
        <div className="space-y-6">
          <ProductFormValidation errors={errors} summary={summary} />
          <ProductFormProgress summary={summary} />
          <ProductFormPreview product={formData} />
        </div>
      </div>
    )
  }

  // Hiển thị trên mobile và tablet
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>{isEditing ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}</CardTitle>
          <CardDescription>
            {isEditing ? "Cập nhật thông tin sản phẩm hiện có" : "Nhập thông tin chi tiết cho sản phẩm mới"}
          </CardDescription>
          <ProductFormProgress summary={summary} />
        </CardHeader>
        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <ScrollArea className="pb-2">
              <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0 flex">
                <TabsTrigger
                  value="basic"
                  className="rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary flex-shrink-0"
                >
                  <Info className="mr-1 h-4 w-4" />
                  Cơ bản
                  {getTabErrorBadge("basic")}
                </TabsTrigger>
                <TabsTrigger
                  value="images"
                  className="rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary flex-shrink-0"
                >
                  <Image className="mr-1 h-4 w-4" />
                  Hình ảnh
                  {getTabErrorBadge("images")}
                </TabsTrigger>
                <TabsTrigger
                  value="variants"
                  className="rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary flex-shrink-0"
                >
                  <Layers className="mr-1 h-4 w-4" />
                  Biến thể
                  {getTabErrorBadge("variants")}
                </TabsTrigger>
                <TabsTrigger
                  value="categories"
                  className="rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary flex-shrink-0"
                >
                  <Tag className="mr-1 h-4 w-4" />
                  Danh mục
                  {getTabErrorBadge("categories")}
                </TabsTrigger>
                <TabsTrigger
                  value="scents"
                  className="rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary flex-shrink-0"
                >
                  <Droplets className="mr-1 h-4 w-4" />
                  Hương
                  {getTabErrorBadge("scents")}
                </TabsTrigger>
                <TabsTrigger
                  value="ingredients"
                  className="rounded-none border-b-2 border-transparent px-3 py-2 data-[state=active]:border-primary flex-shrink-0"
                >
                  <Leaf className="mr-1 h-4 w-4" />
                  Thành phần
                  {getTabErrorBadge("ingredients")}
                </TabsTrigger>
              </TabsList>
            </ScrollArea>
            <div className="p-4">{children}</div>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col border-t p-4 space-y-4">
          <ProductFormValidation errors={errors} summary={summary} />
          <div className="flex flex-col w-full space-y-2">
            <ProductFormPreview product={formData} />
            <ProductFormActions isEditing={isEditing} />
          </div>
          <ProductFormSaveStatus />
        </CardFooter>
      </Card>
    </div>
  )
}

