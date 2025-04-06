"use client"

import { useState, useEffect, useRef } from "react"
import { X, Search, Plus, Info } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProductIngredientFormProps {
  onAddIngredient: (ingredient: any) => void
  onCancel: () => void
  editIngredient?: any
}

export function ProductIngredientForm({ onAddIngredient, onCancel, editIngredient }: ProductIngredientFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIngredient, setSelectedIngredient] = useState<string>("")
  const [selectedCategory, setSelectedCategory] = useState<string>("default")
  const [recentlyUsed, setRecentlyUsed] = useState<any[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Mẫu dữ liệu cho thành phần
  const sampleIngredients = [
    {
      id: "1",
      name: "Alcohol",
      category: "alcohol",
      description: "Dung môi phổ biến trong nước hoa, giúp hòa tan các thành phần khác.",
    },
    {
      id: "2",
      name: "Aqua",
      category: "solvents",
      description: "Nước tinh khiết, được sử dụng như dung môi trong nhiều loại nước hoa.",
    },
    {
      id: "3",
      name: "Citral",
      category: "essential-oils",
      description: "Hợp chất hữu cơ tự nhiên có mùi chanh mạnh mẽ.",
    },
    {
      id: "4",
      name: "Citronellol",
      category: "essential-oils",
      description: "Thành phần tự nhiên có trong tinh dầu hoa hồng và cỏ chanh.",
    },
    {
      id: "5",
      name: "Geraniol",
      category: "essential-oils",
      description: "Hợp chất hữu cơ và rượu monoterpenoid có mùi hoa hồng.",
    },
    {
      id: "6",
      name: "Limonene",
      category: "essential-oils",
      description: "Hợp chất hữu cơ có mùi cam quýt, được tìm thấy trong vỏ cam và chanh.",
    },
    {
      id: "7",
      name: "Linalool",
      category: "essential-oils",
      description: "Hợp chất hữu cơ tự nhiên có mùi hoa lavender.",
    },
    {
      id: "8",
      name: "Benzyl Alcohol",
      category: "alcohol",
      description: "Rượu thơm được sử dụng như chất bảo quản và hương liệu.",
    },
    {
      id: "9",
      name: "Benzyl Benzoate",
      category: "fixatives",
      description: "Chất cố định mùi hương, giúp kéo dài thời gian lưu hương.",
    },
    {
      id: "10",
      name: "Benzyl Salicylate",
      category: "fixatives",
      description: "Chất cố định mùi hương với mùi hoa nhẹ nhàng.",
    },
    {
      id: "11",
      name: "Coumarin",
      category: "fixatives",
      description: "Hợp chất hữu cơ tự nhiên có mùi vani và hạnh nhân.",
    },
    { id: "12", name: "Eugenol", category: "essential-oils", description: "Hợp chất phenolic có mùi đinh hương." },
    { id: "13", name: "Farnesol", category: "fixatives", description: "Rượu sesquiterpene tự nhiên có mùi hoa lily." },
    {
      id: "14",
      name: "Hydroxycitronellal",
      category: "essential-oils",
      description: "Hợp chất hữu cơ có mùi hoa lily thung lũng.",
    },
    {
      id: "15",
      name: "Isoeugenol",
      category: "essential-oils",
      description: "Hợp chất hữu cơ có mùi đinh hương đậm đặc hơn eugenol.",
    },
    { id: "16", name: "Amyl Cinnamal", category: "essential-oils", description: "Hợp chất hữu cơ có mùi hoa nhài." },
    { id: "17", name: "Cinnamyl Alcohol", category: "alcohol", description: "Rượu thơm có mùi quế và hoa nhài." },
    {
      id: "18",
      name: "Citronellal",
      category: "essential-oils",
      description: "Hợp chất hữu cơ có mùi chanh và cỏ chanh.",
    },
    {
      id: "19",
      name: "Hexyl Cinnamal",
      category: "essential-oils",
      description: "Hợp chất hữu cơ có mùi hoa nhài và hoa chamomile.",
    },
    {
      id: "20",
      name: "Butylphenyl Methylpropional",
      category: "essential-oils",
      description: "Hợp chất tổng hợp có mùi hoa lily.",
    },
  ]

  // Mẫu dữ liệu cho các loại thành phần
  const categories = [
    { id: "alcohol", name: "Cồn", description: "Dung môi phổ biến trong nước hoa" },
    { id: "essential-oils", name: "Tinh dầu", description: "Chiết xuất từ thực vật, mang hương thơm đặc trưng" },
    { id: "fixatives", name: "Chất cố định", description: "Giúp kéo dài thời gian lưu hương" },
    { id: "solvents", name: "Dung môi", description: "Hòa tan các thành phần khác" },
    { id: "colorants", name: "Chất màu", description: "Tạo màu sắc cho sản phẩm" },
    { id: "default", name: "Khác", description: "Các thành phần khác" },
  ]

  useEffect(() => {
    if (editIngredient) {
      setSelectedIngredient(editIngredient.ingredient_id)
      setSelectedCategory(editIngredient.category || "default")
    }

    // Focus vào ô tìm kiếm khi mở form
    if (searchInputRef.current) {
      searchInputRef.current.focus()
    }

    // Mẫu dữ liệu cho thành phần đã sử dụng gần đây
    setRecentlyUsed([
      { id: "3", name: "Citral", category: "essential-oils" },
      { id: "6", name: "Limonene", category: "essential-oils" },
      { id: "7", name: "Linalool", category: "essential-oils" },
    ])
  }, [editIngredient])

  const filteredIngredients = sampleIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const selectedIngredientData = sampleIngredients.find((i) => i.id === selectedIngredient)
  const selectedCategoryData = categories.find((c) => c.id === selectedCategory)

  const handleAddIngredient = () => {
    if (!selectedIngredient) return

    const ingredient = sampleIngredients.find((i) => i.id === selectedIngredient)
    if (!ingredient) return

    const newIngredient = {
      id: `temp-${Date.now()}`,
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      category: selectedCategory,
    }

    onAddIngredient(newIngredient)
  }

  const renderContent = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="search-ingredient">Tìm kiếm thành phần</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            id="search-ingredient"
            type="search"
            placeholder="Nhập tên thành phần..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {recentlyUsed.length > 0 && searchTerm.length === 0 && (
        <div className="space-y-2">
          <Label>Đã sử dụng gần đây</Label>
          <div className="flex flex-wrap gap-2">
            {recentlyUsed.map((ingredient) => (
              <Badge
                key={ingredient.id}
                variant={selectedIngredient === ingredient.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedIngredient(ingredient.id)}
              >
                {ingredient.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label>Danh sách thành phần</Label>
        <ScrollArea className="h-[200px] border rounded-md">
          <div className="p-2 space-y-1">
            {filteredIngredients.length === 0 ? (
              <div className="p-2 text-center text-sm text-muted-foreground">Không tìm thấy thành phần phù hợp</div>
            ) : (
              filteredIngredients.map((ingredient) => (
                <div
                  key={ingredient.id}
                  className={`flex items-center p-2 rounded-md cursor-pointer ${
                    selectedIngredient === ingredient.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedIngredient(ingredient.id)}
                >
                  <div className="flex-1">
                    <div className="font-medium">{ingredient.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {categories.find((c) => c.id === ingredient.category)?.name || "Khác"}
                    </div>
                  </div>
                  {selectedIngredient === ingredient.id && (
                    <div className="flex-shrink-0">
                      <Plus className="h-4 w-4" />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {selectedIngredientData && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Loại thành phần</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Phân loại thành phần giúp tổ chức và tìm kiếm dễ dàng hơn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <RadioGroup value={selectedCategory} onValueChange={setSelectedCategory} className="grid grid-cols-2 gap-2">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <RadioGroupItem value={category.id} id={`category-${category.id}`} />
                <Label htmlFor={`category-${category.id}`} className="cursor-pointer">
                  {category.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {selectedIngredientData && (
        <div className="space-y-2">
          <Label>Xem trước</Label>
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{selectedIngredientData.name}</h4>
                  <Badge variant="outline">{selectedCategoryData?.name || "Khác"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedIngredientData.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )

  if (isMobile) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onCancel()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editIngredient ? "Chỉnh sửa thành phần" : "Thêm thành phần mới"}</DialogTitle>
            <DialogDescription>Chọn thành phần từ danh sách hoặc tìm kiếm theo tên</DialogDescription>
          </DialogHeader>
          {renderContent()}
          <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
              Hủy
            </Button>
            <Button onClick={handleAddIngredient} disabled={!selectedIngredient}>
              {editIngredient ? "Cập nhật" : "Thêm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{editIngredient ? "Chỉnh sửa thành phần" : "Thêm thành phần mới"}</CardTitle>
              <CardDescription>Chọn thành phần từ danh sách hoặc tìm kiếm theo tên</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="outline" onClick={onCancel}>
            Hủy
          </Button>
          <Button onClick={handleAddIngredient} disabled={!selectedIngredient}>
            {editIngredient ? "Cập nhật" : "Thêm"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

