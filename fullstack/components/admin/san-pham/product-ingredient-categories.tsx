"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Category {
  id: string
  name: string
  count: number
}

interface ProductIngredientCategoriesProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (categoryId: string) => void
}

export function ProductIngredientCategories({
  categories,
  selectedCategory,
  onSelectCategory,
}: ProductIngredientCategoriesProps) {
  return (
    <Card className="border-dashed">
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium">Danh mục thành phần</CardTitle>
      </CardHeader>
      <CardContent className="py-0">
        <ScrollArea className="h-full max-h-[300px]">
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className={`w-full justify-start ${selectedCategory === category.id ? "bg-muted font-medium" : ""}`}
                onClick={() => onSelectCategory(category.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span>{category.name}</span>
                  <Badge variant="outline">{category.count}</Badge>
                </div>
              </Button>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

