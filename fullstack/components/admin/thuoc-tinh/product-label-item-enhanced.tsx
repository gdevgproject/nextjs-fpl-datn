"use client"

import { Edit, Trash2, Link, Eye, MoreHorizontal, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ProductLabelProducts } from "./product-label-products"
import { useState } from "react"

interface ProductLabelItemEnhancedProps {
  label: {
    id: string
    name: string
    color_code: string
    product_count: number
    created_at: string
  }
  viewMode: "grid" | "list"
  onEdit: () => void
  onDelete: () => void
  onAssign: () => void
  isSelected: boolean
  onToggleSelect: () => void
}

export function ProductLabelItemEnhanced({
  label,
  viewMode,
  onEdit,
  onDelete,
  onAssign,
  isSelected,
  onToggleSelect,
}: ProductLabelItemEnhancedProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (viewMode === "list") {
    return (
      <div
        className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
          isSelected ? "border-primary bg-primary/5" : isHovered ? "border-primary/30 bg-accent/50" : ""
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center space-x-4">
          <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} aria-label={`Chọn nhãn ${label.name}`} />
          <div
            className="h-8 w-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: label.color_code }}
          >
            {isSelected && <Check className="h-4 w-4 text-white" />}
          </div>
          <div>
            <h3 className="font-medium">{label.name}</h3>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <span>{label.product_count} sản phẩm</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${label.color_code}20`, color: label.color_code }}
              >
                {label.color_code}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <ProductLabelProducts labelId={label.id} labelName={label.name} />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onEdit}>
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
                <Button variant="ghost" size="icon" onClick={onAssign}>
                  <Link className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Gắn nhãn</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xóa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    )
  }

  return (
    <Card
      className={`transition-colors ${
        isSelected ? "border-primary bg-primary/5" : isHovered ? "border-primary/30 bg-accent/50" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Checkbox checked={isSelected} onCheckedChange={onToggleSelect} aria-label={`Chọn nhãn ${label.name}`} />
            <div
              className="h-8 w-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: label.color_code }}
            >
              {isSelected && <Check className="h-4 w-4 text-white" />}
            </div>
            <div>
              <h3 className="font-medium">{label.name}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{label.product_count} sản phẩm</span>
                <Badge variant="outline" className="text-xs">
                  {new Date(label.created_at).toLocaleDateString("vi-VN")}
                </Badge>
              </div>
            </div>
          </div>
          <div
            className="px-2 py-1 text-xs rounded-md"
            style={{
              backgroundColor: `${label.color_code}20`,
              color: label.color_code,
            }}
          >
            {label.color_code}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-3">
        <ProductLabelProducts labelId={label.id} labelName={label.name} />

        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="mr-2 h-4 w-4" />
          Sửa
        </Button>

        <Button variant="ghost" size="sm" onClick={onAssign}>
          <Link className="mr-2 h-4 w-4" />
          Gắn nhãn
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onAssign}>
              <Link className="mr-2 h-4 w-4" />
              Gắn nhãn
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Eye className="mr-2 h-4 w-4" />
              Xem sản phẩm
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  )
}

