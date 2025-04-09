"use client"

import { Edit, Trash2, Check } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ImageCardProps {
  image: {
    id: string
    product_id: string
    product_name: string
    image_url: string
    alt_text: string
    display_order: number
    is_main: boolean
    created_at: string
  }
  onEdit: () => void
  onDelete: () => void
}

export function ImageCard({ image, onEdit, onDelete }: ImageCardProps) {
  const formattedDate = new Date(image.created_at).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        <div className="aspect-square overflow-hidden">
          <Image
            src={image.image_url || "/placeholder.svg"}
            alt={image.alt_text || "Product image"}
            width={300}
            height={300}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>

        {image.is_main && (
          <Badge className="absolute right-2 top-2 bg-primary">
            <Check className="mr-1 h-3 w-3" /> Ảnh chính
          </Badge>
        )}
      </div>

      <CardContent className="p-3">
        <div className="space-y-1">
          <p className="line-clamp-1 font-medium">{image.product_name}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{image.alt_text || "Không có mô tả"}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Thứ tự: {image.display_order}</span>
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-between p-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" onClick={onEdit}>
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
              <Button variant="ghost" size="sm" onClick={onDelete}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xóa</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}

