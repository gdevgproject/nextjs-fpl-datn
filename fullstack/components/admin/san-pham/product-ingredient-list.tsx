"use client"
import { Trash2, Edit, Eye, MoreHorizontal } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductIngredientListProps {
  ingredients: any[]
  viewMode: "grid" | "list"
  selectedIngredients: string[]
  onSelectIngredient: (id: string, isSelected: boolean) => void
  onSelectAll: (isSelected: boolean) => void
  onRemoveIngredient: (id: string) => void
  onShowDetail: (ingredient: any) => void
}

export function ProductIngredientList({
  ingredients,
  viewMode,
  selectedIngredients,
  onSelectIngredient,
  onSelectAll,
  onRemoveIngredient,
  onShowDetail,
}: ProductIngredientListProps) {
  const allSelected = ingredients.length > 0 && selectedIngredients.length === ingredients.length
  const someSelected = selectedIngredients.length > 0 && selectedIngredients.length < ingredients.length

  // Mẫu dữ liệu cho các loại thành phần
  const categoryColors: Record<string, string> = {
    alcohol: "bg-red-100 text-red-800 border-red-200",
    "essential-oils": "bg-green-100 text-green-800 border-green-200",
    fixatives: "bg-blue-100 text-blue-800 border-blue-200",
    solvents: "bg-purple-100 text-purple-800 border-purple-200",
    colorants: "bg-yellow-100 text-yellow-800 border-yellow-200",
    default: "bg-gray-100 text-gray-800 border-gray-200",
  }

  const getCategoryBadge = (category: string) => {
    const colorClass = categoryColors[category] || categoryColors.default
    return (
      <Badge variant="outline" className={`${colorClass} font-normal`}>
        {getCategoryName(category)}
      </Badge>
    )
  }

  const getCategoryName = (category: string) => {
    const categoryMap: Record<string, string> = {
      alcohol: "Cồn",
      "essential-oils": "Tinh dầu",
      fixatives: "Chất cố định",
      solvents: "Dung môi",
      colorants: "Chất màu",
    }
    return categoryMap[category] || "Khác"
  }

  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
        <p className="text-muted-foreground">Chưa có thành phần nào được thêm vào sản phẩm.</p>
        <p className="text-sm text-muted-foreground mt-1">Nhấn "Thêm thành phần" để bắt đầu.</p>
      </div>
    )
  }

  return (
    <div>
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {ingredients.map((ingredient) => (
            <motion.div
              key={ingredient.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="overflow-hidden h-full border hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="flex items-start p-4">
                    <div className="flex items-center h-5 mr-3">
                      <Checkbox
                        checked={selectedIngredients.includes(ingredient.id)}
                        onCheckedChange={(checked) => onSelectIngredient(ingredient.id, !!checked)}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium truncate">{ingredient.ingredient_name}</h3>
                      <div className="mt-1 flex items-center">{getCategoryBadge(ingredient.category || "default")}</div>
                    </div>
                    <div className="ml-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Tùy chọn</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onShowDetail(ingredient)}>
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Xem chi tiết</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            <span>Chỉnh sửa</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => onRemoveIngredient(ingredient.id)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Xóa</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox checked={allSelected} indeterminate={someSelected} onCheckedChange={onSelectAll} />
                </TableHead>
                <TableHead>Tên thành phần</TableHead>
                <TableHead>Loại</TableHead>
                <TableHead className="w-[100px]">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIngredients.includes(ingredient.id)}
                      onCheckedChange={(checked) => onSelectIngredient(ingredient.id, !!checked)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{ingredient.ingredient_name}</TableCell>
                  <TableCell>{getCategoryBadge(ingredient.category || "default")}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => onShowDetail(ingredient)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xem chi tiết</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Chỉnh sửa</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-600"
                              onClick={() => onRemoveIngredient(ingredient.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Xóa</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

