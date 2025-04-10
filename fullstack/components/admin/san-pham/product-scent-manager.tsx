"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Droplets, Plus, Search, X, Info, Edit, Trash2, MoveVertical } from "lucide-react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { restrictToVerticalAxis } from "@dnd-kit/modifiers"
import { CSS } from "@dnd-kit/utilities"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ProductScentPyramid } from "./product-scent-pyramid"
import { ProductScentForm } from "./product-scent-form"
import { ProductScentSuggestions } from "./product-scent-suggestions"

// Định nghĩa kiểu dữ liệu cho hương thơm
interface Scent {
  id: string
  name: string
  description?: string
}

interface ProductScent {
  id: string
  scent_id: string
  scent_name: string
  scent_type: "top" | "middle" | "base"
  intensity?: number // 1-5, độ mạnh của hương
  order?: number // Thứ tự hiển thị trong cùng một loại
}

interface ProductScentManagerProps {
  productId?: string
  initialScents?: ProductScent[]
  onScentsChange?: (scents: ProductScent[]) => void
  readOnly?: boolean
}

// Danh sách mùi hương mẫu
const SAMPLE_SCENTS: Scent[] = [
  { id: "1", name: "Bergamot", description: "Hương cam chanh tươi mát" },
  { id: "2", name: "Hoa hồng", description: "Hương hoa hồng cổ điển, nữ tính" },
  { id: "3", name: "Hoa nhài", description: "Hương hoa nhài ngọt ngào, quyến rũ" },
  { id: "4", name: "Hoa oải hương", description: "Hương oải hương thư giãn, dịu nhẹ" },
  { id: "5", name: "Vani", description: "Hương vani ngọt ngào, ấm áp" },
  { id: "6", name: "Gỗ đàn hương", description: "Hương gỗ ấm áp, sang trọng" },
  { id: "7", name: "Xạ hương", description: "Hương xạ hương gợi cảm, bí ẩn" },
  { id: "8", name: "Cam bergamot", description: "Hương cam bergamot tươi mát, sảng khoái" },
  { id: "9", name: "Chanh", description: "Hương chanh tươi mát, sảng khoái" },
  { id: "10", name: "Quế", description: "Hương quế ấm áp, nồng nàn" },
  { id: "11", name: "Hổ phách", description: "Hương hổ phách ấm áp, sang trọng" },
  { id: "12", name: "Hoa lan", description: "Hương hoa lan tinh tế, thanh lịch" },
  { id: "13", name: "Hoa huệ", description: "Hương hoa huệ nồng nàn, quyến rũ" },
  { id: "14", name: "Hoa mộc", description: "Hương hoa mộc ngọt ngào, tinh khiết" },
  { id: "15", name: "Gỗ tuyết tùng", description: "Hương gỗ tuyết tùng mạnh mẽ, nam tính" },
]

// Component chính quản lý hương thơm
export function ProductScentManager({
  productId,
  initialScents = [],
  onScentsChange,
  readOnly = false,
}: ProductScentManagerProps) {
  const [scents, setScents] = useState<ProductScent[]>(initialScents)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<"all" | "top" | "middle" | "base">("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [scentToDelete, setScentToDelete] = useState<ProductScent | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [scentToEdit, setScentToEdit] = useState<ProductScent | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "pyramid">("pyramid")

  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Cập nhật scents khi initialScents thay đổi
  useEffect(() => {
    setScents(initialScents)
  }, [initialScents])

  // Gọi callback khi scents thay đổi
  useEffect(() => {
    if (onScentsChange) {
      onScentsChange(scents)
    }
  }, [scents, onScentsChange])

  // Lọc scents theo tab và search term
  const filteredScents = scents.filter((scent) => {
    const matchesTab = activeTab === "all" || scent.scent_type === activeTab
    const matchesSearch = scent.scent_name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesTab && matchesSearch
  })

  // Đếm số lượng scents theo loại
  const topCount = scents.filter((s) => s.scent_type === "top").length
  const middleCount = scents.filter((s) => s.scent_type === "middle").length
  const baseCount = scents.filter((s) => s.scent_type === "base").length

  // Thêm hương thơm mới
  const handleAddScent = (newScent: ProductScent) => {
    setScents((prev) => [...prev, { ...newScent, id: `temp-${Date.now()}` }])
    setIsAddDialogOpen(false)
  }

  // Cập nhật hương thơm
  const handleUpdateScent = (updatedScent: ProductScent) => {
    setScents((prev) => prev.map((s) => (s.id === updatedScent.id ? updatedScent : s)))
    setScentToEdit(null)
    setIsEditMode(false)
  }

  // Xóa hương thơm
  const handleDeleteScent = () => {
    if (scentToDelete) {
      setScents((prev) => prev.filter((s) => s.id !== scentToDelete.id))
      setScentToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  // Chuẩn bị xóa hương thơm
  const prepareDeleteScent = (scent: ProductScent) => {
    setScentToDelete(scent)
    setIsDeleteDialogOpen(true)
  }

  // Chuẩn bị chỉnh sửa hương thơm
  const prepareEditScent = (scent: ProductScent) => {
    setScentToEdit(scent)
    setIsEditMode(true)
  }

  // Sensors cho DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  // Xử lý khi kéo thả kết thúc
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = scents.findIndex((s) => s.id === active.id)
      const newIndex = scents.findIndex((s) => s.id === over.id)

      const newScents = [...scents]
      const [movedItem] = newScents.splice(oldIndex, 1)
      newScents.splice(newIndex, 0, movedItem)

      // Cập nhật thứ tự
      const updatedScents = newScents.map((scent, index) => ({
        ...scent,
        order: index + 1,
      }))

      setScents(updatedScents)
    }
  }

  // Component hiển thị một hương thơm có thể kéo thả
  const SortableScent = ({ scent }: { scent: ProductScent }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: scent.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    }

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="flex items-center justify-between p-3 border rounded-md mb-2 bg-card hover:bg-accent/10 cursor-move"
      >
        <div className="flex items-center gap-2">
          <MoveVertical className="h-4 w-4 text-muted-foreground" />
          <Badge
            variant={scent.scent_type === "top" ? "default" : scent.scent_type === "middle" ? "secondary" : "outline"}
          >
            {scent.scent_type === "top" ? "Đầu" : scent.scent_type === "middle" ? "Giữa" : "Cuối"}
          </Badge>
          <span className="font-medium">{scent.scent_name}</span>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => prepareEditScent(scent)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => prepareDeleteScent(scent)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Quản lý hương thơm
            </CardTitle>
            <CardDescription>Thêm và quản lý các tầng hương cho sản phẩm nước hoa</CardDescription>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex items-center">
              <Button
                variant={viewMode === "pyramid" ? "default" : "outline"}
                size="sm"
                className="rounded-r-none"
                onClick={() => setViewMode("pyramid")}
              >
                Tháp hương
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                Danh sách
              </Button>
            </div>

            {!readOnly && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm hương thơm
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>Thêm hương thơm mới</DialogTitle>
                    <DialogDescription>Chọn mùi hương và loại hương (đầu, giữa, cuối) cho sản phẩm</DialogDescription>
                  </DialogHeader>
                  <ProductScentForm onSubmit={handleAddScent} availableScents={SAMPLE_SCENTS} />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {scents.length === 0 ? (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Chưa có thông tin hương thơm</AlertTitle>
            <AlertDescription>
              Sản phẩm này chưa có thông tin về các tầng hương. Hãy thêm hương thơm để cung cấp thông tin đầy đủ cho
              khách hàng.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm hương thơm..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full">
                <TabsList className="grid grid-cols-4 w-full sm:w-auto">
                  <TabsTrigger value="all">
                    Tất cả{" "}
                    <Badge variant="outline" className="ml-1">
                      {scents.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="top">
                    Đầu{" "}
                    <Badge variant="outline" className="ml-1">
                      {topCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="middle">
                    Giữa{" "}
                    <Badge variant="outline" className="ml-1">
                      {middleCount}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="base">
                    Cuối{" "}
                    <Badge variant="outline" className="ml-1">
                      {baseCount}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {viewMode === "pyramid" ? (
              <ProductScentPyramid
                scents={scents}
                onEdit={!readOnly ? prepareEditScent : undefined}
                onDelete={!readOnly ? prepareDeleteScent : undefined}
              />
            ) : (
              <div className="mt-4">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext items={filteredScents.map((s) => s.id)} strategy={verticalListSortingStrategy}>
                    <div className="space-y-2">
                      {filteredScents.map((scent) => (
                        <SortableScent key={scent.id} scent={scent} />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {filteredScents.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchTerm ? "Không tìm thấy hương thơm phù hợp" : "Chưa có hương thơm nào trong danh mục này"}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {!readOnly && scents.length > 0 && (
        <CardFooter className="flex justify-between border-t pt-6">
          <div className="text-sm text-muted-foreground">Đã thêm {scents.length} hương thơm</div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === "pyramid" ? "list" : "pyramid")}
                >
                  {viewMode === "pyramid" ? "Xem dạng danh sách" : "Xem dạng tháp hương"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Chuyển đổi giữa chế độ xem tháp hương và danh sách</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      )}

      {/* Dialog chỉnh sửa hương thơm */}
      <Dialog open={isEditMode} onOpenChange={setIsEditMode}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa hương thơm</DialogTitle>
            <DialogDescription>Cập nhật thông tin hương thơm cho sản phẩm</DialogDescription>
          </DialogHeader>
          {scentToEdit && (
            <ProductScentForm
              onSubmit={handleUpdateScent}
              availableScents={SAMPLE_SCENTS}
              initialData={scentToEdit}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog xác nhận xóa */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Xác nhận xóa hương thơm</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa hương thơm này khỏi sản phẩm?</DialogDescription>
          </DialogHeader>

          {scentToDelete && (
            <div className="py-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant={
                    scentToDelete.scent_type === "top"
                      ? "default"
                      : scentToDelete.scent_type === "middle"
                        ? "secondary"
                        : "outline"
                  }
                >
                  {scentToDelete.scent_type === "top"
                    ? "Hương đầu"
                    : scentToDelete.scent_type === "middle"
                      ? "Hương giữa"
                      : "Hương cuối"}
                </Badge>
                <span className="font-medium">{scentToDelete.scent_name}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Hành động này không thể hoàn tác. Thông tin hương thơm sẽ bị xóa vĩnh viễn khỏi sản phẩm.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteScent}>
              Xóa hương thơm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gợi ý hương thơm */}
      {!readOnly && scents.length === 0 && (
        <CardFooter className="border-t pt-6">
          <ProductScentSuggestions
            onSelect={(suggestion) => {
              setScents(suggestion)
            }}
          />
        </CardFooter>
      )}
    </Card>
  )
}

