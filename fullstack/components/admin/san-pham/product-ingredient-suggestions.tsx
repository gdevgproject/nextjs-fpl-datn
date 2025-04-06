"use client"
import { Plus, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductIngredientSuggestionsProps {
  onAddIngredient: (ingredient: any) => void
}

export function ProductIngredientSuggestions({ onAddIngredient }: ProductIngredientSuggestionsProps) {
  // Mẫu dữ liệu cho các gợi ý thành phần
  const suggestionGroups = [
    {
      id: "fresh",
      name: "Tươi mát",
      description: "Các thành phần tạo mùi hương tươi mát, sảng khoái",
      ingredients: [
        { id: "3", name: "Citral", category: "essential-oils" },
        { id: "6", name: "Limonene", category: "essential-oils" },
        { id: "18", name: "Citronellal", category: "essential-oils" },
      ],
    },
    {
      id: "floral",
      name: "Hoa cỏ",
      description: "Các thành phần tạo mùi hương hoa cỏ, ngọt ngào",
      ingredients: [
        { id: "4", name: "Citronellol", category: "essential-oils" },
        { id: "5", name: "Geraniol", category: "essential-oils" },
        { id: "16", name: "Amyl Cinnamal", category: "essential-oils" },
      ],
    },
    {
      id: "woody",
      name: "Gỗ",
      description: "Các thành phần tạo mùi hương gỗ, ấm áp",
      ingredients: [
        { id: "12", name: "Eugenol", category: "essential-oils" },
        { id: "15", name: "Isoeugenol", category: "essential-oils" },
        { id: "17", name: "Cinnamyl Alcohol", category: "alcohol" },
      ],
    },
    {
      id: "oriental",
      name: "Phương đông",
      description: "Các thành phần tạo mùi hương phương đông, quyến rũ",
      ingredients: [
        { id: "11", name: "Coumarin", category: "fixatives" },
        { id: "13", name: "Farnesol", category: "fixatives" },
        { id: "9", name: "Benzyl Benzoate", category: "fixatives" },
      ],
    },
  ]

  const handleAddSuggestion = (ingredient: any) => {
    const newIngredient = {
      id: `temp-${Date.now()}`,
      ingredient_id: ingredient.id,
      ingredient_name: ingredient.name,
      category: ingredient.category,
    }
    onAddIngredient(newIngredient)
  }

  const handleAddGroup = (group: any) => {
    group.ingredients.forEach((ingredient: any) => {
      const newIngredient = {
        id: `temp-${Date.now()}-${ingredient.id}`,
        ingredient_id: ingredient.id,
        ingredient_name: ingredient.name,
        category: ingredient.category,
      }
      onAddIngredient(newIngredient)
    })
  }

  return (
    <Card className="border-dashed">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Gợi ý thành phần</CardTitle>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Thêm nhanh các nhóm thành phần phổ biến</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent className="py-0">
        <ScrollArea className="h-full max-h-[300px]">
          <Accordion type="single" collapsible className="w-full">
            {suggestionGroups.map((group) => (
              <AccordionItem key={group.id} value={group.id}>
                <AccordionTrigger className="text-sm">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{group.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAddGroup(group)
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 text-xs text-muted-foreground mb-2">{group.description}</div>
                  <div className="space-y-1">
                    {group.ingredients.map((ingredient) => (
                      <div
                        key={ingredient.id}
                        className="flex items-center justify-between px-4 py-1 text-sm rounded-md hover:bg-muted"
                      >
                        <span>{ingredient.name}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleAddSuggestion(ingredient)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

