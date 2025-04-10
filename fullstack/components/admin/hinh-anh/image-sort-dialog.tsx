"use client"

import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { GripVertical, Check } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface ImageItem {
  id: string
  product_id: string
  product_name: string
  image_url: string
  alt_text: string
  display_order: number
  is_main: boolean
}

interface ImageSortDialogProps {
  images: ImageItem[]
  productName: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (sortedImages: ImageItem[]) => void
}

export function ImageSortDialog({ images, productName, open, onOpenChange, onSave }: ImageSortDialogProps) {
  const [sortedImages, setSortedImages] = useState<ImageItem[]>(
    [...images].sort((a, b) => a.display_order - b.display_order),
  )

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sortedImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Cập nhật display_order cho tất cả các items
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }))

    setSortedImages(updatedItems)
  }

  const handleSave = () => {
    onSave(sortedImages)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sắp xếp thứ tự hình ảnh</DialogTitle>
          <DialogDescription>
            Kéo và thả để sắp xếp thứ tự hiển thị hình ảnh cho sản phẩm {productName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="images">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                  {sortedImages.map((image, index) => (
                    <Draggable key={image.id} draggableId={image.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className="flex items-center rounded-md border p-2"
                        >
                          <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="relative h-16 w-16 overflow-hidden rounded-md">
                            <Image
                              src={image.image_url || "/placeholder.svg"}
                              alt={image.alt_text || "Product image"}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">Thứ tự: {index + 1}</span>
                              {image.is_main && (
                                <Badge className="bg-primary">
                                  <Check className="mr-1 h-3 w-3" /> Ảnh chính
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{image.alt_text || "Không có mô tả"}</p>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleSave}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

