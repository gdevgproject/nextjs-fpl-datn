"use client"

import { useState } from "react"
import Image from "next/image"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import {
  Eye,
  Trash2,
  GripVertical,
  MoreVertical,
  Check,
  Pencil,
  Star,
  StarOff,
  MoveUp,
  MoveDown,
  Info,
} from "lucide-react"

// Type definitions based on the database schema
interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  is_main: boolean
  display_order: number
}

interface ImageGridProps {
  images: ProductImage[]
  onReorder: (images: ProductImage[]) => void
  onSetMain: (imageId: string) => void
  onUpdateAltText: (imageId: string, altText: string) => void
  onDelete: (imageId: string) => void
  productName?: string
  loading?: boolean
}

export function ImageGrid({
  images,
  onReorder,
  onSetMain,
  onUpdateAltText,
  onDelete,
  productName = "Sản phẩm",
  loading = false,
}: ImageGridProps) {
  const [selectedImage, setSelectedImage] = useState<ProductImage | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditAltTextOpen, setIsEditAltTextOpen] = useState(false)
  const [newAltText, setNewAltText] = useState("")
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Sort images by display_order
  const sortedImages = [...images].sort((a, b) => a.display_order - b.display_order)

  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(sortedImages)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update display_order for all items
    const reorderedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }))

    onReorder(reorderedItems)
  }

  // Handle setting the main image
  const handleSetMain = (imageId: string) => {
    onSetMain(imageId)
  }

  // Open the preview dialog
  const handlePreview = (image: ProductImage) => {
    setSelectedImage(image)
    setIsPreviewOpen(true)
  }

  // Open the edit alt text dialog
  const handleEditAltText = (image: ProductImage) => {
    setSelectedImage(image)
    setNewAltText(image.alt_text || "")
    setIsEditAltTextOpen(true)
  }

  // Save the updated alt text
  const handleSaveAltText = () => {
    if (selectedImage) {
      onUpdateAltText(selectedImage.id, newAltText)
      setIsEditAltTextOpen(false)
    }
  }

  // Open the delete confirmation dialog
  const handleDeleteConfirm = (image: ProductImage) => {
    setSelectedImage(image)
    setIsDeleteDialogOpen(true)
  }

  // Delete the image
  const handleDelete = () => {
    if (selectedImage) {
      onDelete(selectedImage.id)
      setIsDeleteDialogOpen(false)
    }
  }

  // Quick move up/down functionality (especially useful for mobile)
  const handleMoveUp = (index: number) => {
    if (index === 0) return // Already at the top

    const items = Array.from(sortedImages)
    const temp = items[index]
    items[index] = items[index - 1]
    items[index - 1] = temp

    // Update display_order for all items
    const reorderedItems = items.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
    }))

    onReorder(reorderedItems)
  }

  const handleMoveDown = (index: number) => {
    if (index === sortedImages.length - 1) return // Already at the bottom

    const items = Array.from(sortedImages)
    const temp = items[index]
    items[index] = items[index + 1]
    items[index + 1] = temp

    // Update display_order for all items
    const reorderedItems = items.map((item, idx) => ({
      ...item,
      display_order: idx + 1,
    }))

    onReorder(reorderedItems)
  }

  // Render different layouts for different device sizes
  const renderMobileLayout = () => (
    <div className="space-y-4">
      {sortedImages.map((image, index) => (
        <Card key={image.id} className="overflow-hidden">
          <div className="flex items-start p-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
              <Image
                src={image.image_url || "/placeholder.svg"}
                alt={image.alt_text || `Hình ảnh ${index + 1}`}
                fill
                className="object-cover"
              />
              {image.is_main && (
                <div className="absolute bottom-0 left-0 right-0 bg-primary bg-opacity-80 text-center text-xs text-white">
                  <Check className="mx-auto h-3 w-3" />
                </div>
              )}
            </div>

            <div className="ml-4 flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Hình #{image.display_order}</span>
                {image.is_main && <Badge variant="default">Ảnh chính</Badge>}
              </div>
              <p className="truncate text-xs text-muted-foreground">{image.alt_text || "Không có mô tả"}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handlePreview(image)}>
                  <Eye className="mr-2 h-4 w-4" /> Xem
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEditAltText(image)}>
                  <Pencil className="mr-2 h-4 w-4" /> Sửa alt text
                </DropdownMenuItem>
                {!image.is_main && (
                  <DropdownMenuItem onClick={() => handleSetMain(image.id)}>
                    <Star className="mr-2 h-4 w-4" /> Đặt làm ảnh chính
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => handleMoveUp(index)} disabled={index === 0}>
                  <MoveUp className="mr-2 h-4 w-4" /> Di chuyển lên
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMoveDown(index)} disabled={index === sortedImages.length - 1}>
                  <MoveDown className="mr-2 h-4 w-4" /> Di chuyển xuống
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteConfirm(image)} className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  )

  const renderDesktopLayout = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="images" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {sortedImages.map((image, index) => (
              <Draggable key={image.id} draggableId={image.id} index={index} isDragDisabled={loading}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`rounded-lg border-2 transition-all ${
                      image.is_main ? "border-primary" : "border-gray-200"
                    } ${snapshot.isDragging ? "shadow-lg" : ""} ${loading ? "opacity-50" : ""}`}
                  >
                    <div className="flex items-center justify-between border-b p-2">
                      <div
                        {...provided.dragHandleProps}
                        className={`flex cursor-grab items-center text-xs text-muted-foreground ${
                          loading ? "cursor-not-allowed" : ""
                        }`}
                      >
                        <GripVertical className="mr-1 h-4 w-4" />
                        <span>Thứ tự: {image.display_order}</span>
                      </div>

                      <div className="flex space-x-1">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleEditAltText(image)}
                                disabled={loading}
                              >
                                <Pencil className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Chỉnh sửa alt text</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>

                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive"
                                onClick={() => handleDeleteConfirm(image)}
                                disabled={loading}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Xóa</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>

                    <div className="relative p-2">
                      <div
                        className="relative aspect-square cursor-pointer overflow-hidden rounded-md"
                        onClick={() => handlePreview(image)}
                      >
                        <Image
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.alt_text || `Hình ảnh ${index + 1}`}
                          fill
                          className="object-cover transition-transform hover:scale-105"
                        />

                        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 opacity-0 transition-opacity hover:bg-opacity-30 hover:opacity-100">
                          <Eye className="h-6 w-6 text-white" />
                        </div>
                      </div>

                      {image.is_main && (
                        <Badge className="absolute left-4 top-4 bg-primary">
                          <Check className="mr-1 h-3 w-3" /> Ảnh chính
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3 p-2">
                      <div className="space-y-1">
                        <div className="line-clamp-2 min-h-[2.5rem] text-xs text-muted-foreground">
                          {image.alt_text || (
                            <span className="flex items-center text-amber-500">
                              <Info className="mr-1 h-3 w-3" /> Chưa có mô tả alt text
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <Button
                          variant={image.is_main ? "outline" : "default"}
                          size="sm"
                          className="w-full"
                          onClick={() => handleSetMain(image.id)}
                          disabled={image.is_main || loading}
                        >
                          {image.is_main ? (
                            <>
                              <StarOff className="mr-1 h-3 w-3" /> Đã là ảnh chính
                            </>
                          ) : (
                            <>
                              <Star className="mr-1 h-3 w-3" /> Đặt làm ảnh chính
                            </>
                          )}
                        </Button>
                      </div>
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
  )

  return (
    <div className="space-y-6">
      {/* Conditionally render based on device size */}
      {isMobile ? renderMobileLayout() : renderDesktopLayout()}

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Xem hình ảnh</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-square w-full">
              <Image
                src={selectedImage.image_url || "/placeholder.svg"}
                alt={selectedImage.alt_text || "Hình ảnh sản phẩm"}
                fill
                className="object-contain"
              />
            </div>
          )}
          <div className="mt-4 flex items-center justify-between">
            <div>
              {selectedImage?.is_main && (
                <Badge variant="default">
                  <Check className="mr-1 h-3 w-3" /> Ảnh chính
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{selectedImage?.alt_text || "Không có mô tả"}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Alt Text Dialog */}
      <Dialog open={isEditAltTextOpen} onOpenChange={setIsEditAltTextOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa alt text</DialogTitle>
            <DialogDescription>
              Alt text giúp cải thiện SEO và trải nghiệm cho người dùng không thể xem hình ảnh.
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="grid gap-4 py-4">
              <div className="relative mx-auto h-40 w-40">
                <Image
                  src={selectedImage.image_url || "/placeholder.svg"}
                  alt={selectedImage.alt_text || "Hình ảnh sản phẩm"}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alt-text">Alt Text</Label>
                <Input
                  id="alt-text"
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  placeholder={`${productName} - Hình ${selectedImage.display_order}`}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditAltTextOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveAltText}>Lưu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa hình ảnh này? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {selectedImage && (
            <div className="relative mx-auto h-40 w-40">
              <Image
                src={selectedImage.image_url || "/placeholder.svg"}
                alt={selectedImage.alt_text || "Hình ảnh sản phẩm"}
                fill
                className="object-contain"
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

