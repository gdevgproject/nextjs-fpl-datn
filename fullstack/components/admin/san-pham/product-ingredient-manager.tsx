"use client"

import { useState, useCallback, useMemo } from "react"
import { PlusCircle, Search, Grid3X3, List, MoreHorizontal, Download, Upload, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Separator } from "@/components/ui/separator"
import { ProductIngredientList } from "./product-ingredient-list"
import { ProductIngredientForm } from "./product-ingredient-form"
import { ProductIngredientCategories } from "./product-ingredient-categories"
import { ProductIngredientSuggestions } from "./product-ingredient-suggestions"
import { ProductIngredientBulkActions } from "./product-ingredient-bulk-actions"
import { ProductIngredientDetail } from "./product-ingredient-detail"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProductIngredientManagerProps {
  productId?: string
  initialIngredients?: any[]
}

export function ProductIngredientManager({ productId, initialIngredients = [] }: ProductIngredientManagerProps) {
  const [ingredients, setIngredients] = useState(initialIngredients)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([])
  const [detailIngredient, setDetailIngredient] = useState<any | null>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Mẫu dữ liệu danh mục thành phần
  const categories = [
    { id: "all", name: "Tất cả", count: ingredients.length },
    { id: "alcohol", name: "Cồn", count: 5 },
    { id: "essential-oils", name: "Tinh dầu", count: 12 },
    { id: "fixatives", name: "Chất cố định", count: 8 },
    { id: "solvents", name: "Dung môi", count: 4 },
    { id: "colorants", name: "Chất màu", count: 3 },
  ]

  const filteredIngredients = useMemo(() => {
    return ingredients.filter((ingredient) => {
      const matchesSearch = ingredient.ingredient_name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === "all" || ingredient.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [ingredients, searchTerm, selectedCategory])

  const handleAddIngredient = useCallback((newIngredient: any) => {
    setIngredients((prev) => [...prev, newIngredient])
    setIsFormOpen(false)
  }, [])

  const handleRemoveIngredient = useCallback((id: string) => {
    setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id))
  }, [])

  const handleSelectIngredient = useCallback((id: string, isSelected: boolean) => {
    setSelectedIngredients((prev) => {
      if (isSelected) {
        return [...prev, id]
      } else {
        return prev.filter((ingredientId) => ingredientId !== id)
      }
    })
  }, [])

  const handleSelectAll = useCallback(
    (isSelected: boolean) => {
      if (isSelected) {
        setSelectedIngredients(filteredIngredients.map((ingredient) => ingredient.id))
      } else {
        setSelectedIngredients([])
      }
    },
    [filteredIngredients],
  )

  const handleBulkDelete = useCallback(() => {
    setIngredients((prev) => prev.filter((ingredient) => !selectedIngredients.includes(ingredient.id)))
    setSelectedIngredients([])
  }, [selectedIngredients])

  const handleShowDetail = useCallback((ingredient: any) => {
    setDetailIngredient(ingredient)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setDetailIngredient(null)
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">Quản lý thành phần</CardTitle>
              <CardDescription>Thêm và quản lý các thành phần của sản phẩm nước hoa</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setIsFormOpen(true)}>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Thêm thành phần</span>
                      <span className="sm:hidden">Thêm</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Thêm thành phần mới vào sản phẩm</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Upload className="mr-2 h-4 w-4" />
                    <span>Nhập danh sách</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Xuất danh sách</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={handleBulkDelete}
                    disabled={selectedIngredients.length === 0}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    <span>Xóa đã chọn</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm thành phần..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className={viewMode === "grid" ? "bg-accent" : ""}
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className={viewMode === "list" ? "bg-accent" : ""}
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              {!isMobile && (
                <div className="w-full md:w-64 shrink-0">
                  <ProductIngredientCategories
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                  />
                  <Separator className="my-4" />
                  <ProductIngredientSuggestions onAddIngredient={handleAddIngredient} />
                </div>
              )}

              <div className="flex-1">
                {isMobile && (
                  <Tabs defaultValue="ingredients" className="mb-4">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="ingredients">Thành phần</TabsTrigger>
                      <TabsTrigger value="categories">Danh mục & Gợi ý</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ingredients">
                      <ProductIngredientList
                        ingredients={filteredIngredients}
                        viewMode={viewMode}
                        selectedIngredients={selectedIngredients}
                        onSelectIngredient={handleSelectIngredient}
                        onSelectAll={handleSelectAll}
                        onRemoveIngredient={handleRemoveIngredient}
                        onShowDetail={handleShowDetail}
                      />
                    </TabsContent>
                    <TabsContent value="categories">
                      <div className="space-y-4">
                        <ProductIngredientCategories
                          categories={categories}
                          selectedCategory={selectedCategory}
                          onSelectCategory={setSelectedCategory}
                        />
                        <Separator className="my-4" />
                        <ProductIngredientSuggestions onAddIngredient={handleAddIngredient} />
                      </div>
                    </TabsContent>
                  </Tabs>
                )}

                {!isMobile && (
                  <ProductIngredientList
                    ingredients={filteredIngredients}
                    viewMode={viewMode}
                    selectedIngredients={selectedIngredients}
                    onSelectIngredient={handleSelectIngredient}
                    onSelectAll={handleSelectAll}
                    onRemoveIngredient={handleRemoveIngredient}
                    onShowDetail={handleShowDetail}
                  />
                )}

                {selectedIngredients.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-4"
                  >
                    <ProductIngredientBulkActions
                      count={selectedIngredients.length}
                      onDelete={handleBulkDelete}
                      onClearSelection={() => setSelectedIngredients([])}
                    />
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {filteredIngredients.length} / {ingredients.length} thành phần
          </div>
          <Button variant="outline" size="sm" onClick={() => setIsFormOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm thành phần
          </Button>
        </CardFooter>
      </Card>

      <AnimatePresence>
        {isFormOpen && (
          <ProductIngredientForm onAddIngredient={handleAddIngredient} onCancel={() => setIsFormOpen(false)} />
        )}

        {detailIngredient && <ProductIngredientDetail ingredient={detailIngredient} onClose={handleCloseDetail} />}
      </AnimatePresence>
    </div>
  )
}

