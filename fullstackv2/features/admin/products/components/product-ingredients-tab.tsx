"use client"

import { useState, useEffect } from "react"
import { useProductIngredients, useUpdateProductIngredients } from "../hooks/use-product-ingredients"
import { useIngredients } from "../../ingredients/hooks/use-ingredients"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useDebounce } from "../hooks/use-debounce"

interface ProductIngredientsTabProps {
  productId: number | null | undefined
}

type ScentType = "top" | "middle" | "base"

interface IngredientWithType {
  ingredientId: number
  scentType: ScentType
  name?: string // For display purposes
}

export function ProductIngredientsTab({ productId }: ProductIngredientsTabProps) {
  const toast = useSonnerToast()
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<ScentType>("top")
  const [selectedIngredients, setSelectedIngredients] = useState<IngredientWithType[]>([])
  const [selectedIngredientId, setSelectedIngredientId] = useState<number | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  // Fetch product ingredients
  const { data: productIngredientsData, isLoading: isLoadingProductIngredients } = useProductIngredients(
    productId || null,
  )

  // Fetch all ingredients
  const { data: ingredientsData, isLoading: isLoadingIngredients } = useIngredients()

  // Update product ingredients mutation
  const { updateIngredients } = useUpdateProductIngredients()

  // Initialize selected ingredients when data is loaded
  useEffect(() => {
    if (productIngredientsData?.data) {
      const ingredients = productIngredientsData.data.map((item: any) => ({
        ingredientId: item.ingredient_id,
        scentType: item.scent_type as ScentType,
        name: item.ingredients?.name,
      }))
      setSelectedIngredients(ingredients)
    }
  }, [productIngredientsData])

  // Handle add ingredient
  const handleAddIngredient = () => {
    if (!selectedIngredientId) return

    // Check if ingredient already exists in the same scent type
    const exists = selectedIngredients.some(
      (item) => item.ingredientId === selectedIngredientId && item.scentType === activeTab,
    )

    if (exists) {
      toast.error("Thành phần này đã được thêm vào tầng hương này")
      return
    }

    // Find ingredient name
    const ingredient = ingredientsData?.data?.find((item: any) => item.id === selectedIngredientId)

    // Add ingredient
    setSelectedIngredients((prev) => [
      ...prev,
      {
        ingredientId: selectedIngredientId,
        scentType: activeTab,
        name: ingredient?.name,
      },
    ])

    // Reset selection
    setSelectedIngredientId(null)
  }

  // Handle remove ingredient
  const handleRemoveIngredient = (ingredientId: number, scentType: ScentType) => {
    setSelectedIngredients((prev) =>
      prev.filter((item) => !(item.ingredientId === ingredientId && item.scentType === scentType)),
    )
  }

  // Handle save button click
  const handleSave = async () => {
    if (!productId) {
      toast.error("Không tìm thấy ID sản phẩm")
      return
    }

    setIsProcessing(true)

    try {
      await updateIngredients(productId, selectedIngredients)
      toast.success("Thành phần sản phẩm đã được cập nhật thành công")
    } catch (error) {
      toast.error(`Lỗi khi cập nhật thành phần: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsProcessing(false)
    }
  }

  // Filter ingredients based on search
  const filteredIngredients = ingredientsData?.data
    ? ingredientsData.data.filter((ingredient: any) =>
        ingredient.name.toLowerCase().includes(debouncedSearch.toLowerCase()),
      )
    : []

  // Get ingredients by scent type
  const getIngredientsByType = (type: ScentType) => {
    return selectedIngredients.filter((item) => item.scentType === type)
  }

  if (!productId) {
    return (
      <div className="flex justify-center items-center p-8">
        <p>Vui lòng tạo sản phẩm trước khi quản lý thành phần.</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý thành phần</CardTitle>
        <CardDescription>Thêm các thành phần vào từng tầng hương (top, middle, base) của sản phẩm.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ingredient Selector */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2 col-span-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm thành phần..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select
                value={selectedIngredientId?.toString() || ""}
                onValueChange={(value) => setSelectedIngredientId(value ? Number.parseInt(value) : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn thành phần" />
                </SelectTrigger>
                <SelectContent>
                  {debouncedSearch && filteredIngredients.length === 0 ? (
                    <div className="py-2 px-2 text-sm text-muted-foreground">Không tìm thấy thành phần nào</div>
                  ) : (
                    filteredIngredients.map((ingredient: any) => (
                      <SelectItem key={ingredient.id} value={ingredient.id.toString()}>
                        {ingredient.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddIngredient} disabled={!selectedIngredientId} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Thêm vào {activeTab === "top" ? "hương đầu" : activeTab === "middle" ? "hương giữa" : "hương cuối"}
              </Button>
            </div>
          </div>
        </div>

        {/* Scent Type Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as ScentType)}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="top">Hương đầu (Top)</TabsTrigger>
            <TabsTrigger value="middle">Hương giữa (Middle)</TabsTrigger>
            <TabsTrigger value="base">Hương cuối (Base)</TabsTrigger>
          </TabsList>

          {["top", "middle", "base"].map((type) => (
            <TabsContent key={type} value={type} className="space-y-4">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">
                  {type === "top"
                    ? "Hương đầu (Top Notes)"
                    : type === "middle"
                      ? "Hương giữa (Middle Notes)"
                      : "Hương cuối (Base Notes)"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {type === "top"
                    ? "Hương đầu là những mùi hương bạn ngửi thấy đầu tiên, thường bay hơi nhanh trong vòng 15-30 phút."
                    : type === "middle"
                      ? "Hương giữa xuất hiện sau khi hương đầu bay hơi, thường kéo dài từ 2-4 giờ."
                      : "Hương cuối là nền tảng của nước hoa, xuất hiện sau cùng và có thể kéo dài từ 5-10 giờ hoặc lâu hơn."}
                </p>

                {isLoadingProductIngredients || isLoadingIngredients ? (
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : getIngredientsByType(type as ScentType).length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground border border-dashed rounded-md">
                    <p>
                      Chưa có thành phần nào trong{" "}
                      {type === "top" ? "hương đầu" : type === "middle" ? "hương giữa" : "hương cuối"}.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {getIngredientsByType(type as ScentType).map((item) => (
                      <Badge
                        key={`${item.ingredientId}-${item.scentType}`}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1.5"
                      >
                        {item.name}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemoveIngredient(item.ingredientId, item.scentType)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSave} disabled={isProcessing}>
          {isProcessing ? "Đang xử lý..." : "Lưu thay đổi"}
        </Button>
      </CardFooter>
    </Card>
  )
}
