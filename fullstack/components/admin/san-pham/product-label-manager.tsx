"use client"

import type React from "react"

import { useState } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Search, Tag, Calendar, Info, X, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"

import { ProductLabelForm } from "./product-label-form"
import { ProductLabelDatePicker } from "./product-label-date-picker"
import { ProductLabelPreview } from "./product-label-preview"

// Dữ liệu mẫu cho nhãn sản phẩm
const sampleLabels = [
  { id: "1", name: "Mới", color_code: "#10b981", description: "Sản phẩm mới ra mắt" },
  { id: "2", name: "Bán chạy", color_code: "#f97316", description: "Sản phẩm bán chạy nhất" },
  { id: "3", name: "Giảm giá", color_code: "#ef4444", description: "Sản phẩm đang giảm giá" },
  { id: "4", name: "Hết hàng", color_code: "#6b7280", description: "Sản phẩm tạm hết hàng" },
  { id: "5", name: "Độc quyền", color_code: "#8b5cf6", description: "Sản phẩm độc quyền" },
  { id: "6", name: "Phiên bản giới hạn", color_code: "#ec4899", description: "Phiên bản giới hạn" },
  { id: "7", name: "Sắp ra mắt", color_code: "#0ea5e9", description: "Sản phẩm sắp ra mắt" },
  { id: "8", name: "Bán chạy nhất", color_code: "#eab308", description: "Sản phẩm bán chạy nhất" },
]

// Dữ liệu mẫu cho nhãn đã gắn
const initialSelectedLabels = [
  {
    id: "1",
    label_id: "1",
    name: "Mới",
    color_code: "#10b981",
    valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày từ hiện tại
  },
  {
    id: "2",
    label_id: "3",
    name: "Giảm giá",
    color_code: "#ef4444",
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 ngày từ hiện tại
  },
]

interface ProductLabelManagerProps {
  productId?: string
  onLabelsChange?: (labels: any[]) => void
}

export function ProductLabelManager({ productId, onLabelsChange }: ProductLabelManagerProps) {
  const [selectedLabels, setSelectedLabels] = useState(initialSelectedLabels)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showLabelForm, setShowLabelForm] = useState(false)
  const [editingLabel, setEditingLabel] = useState<any | null>(null)
  const [showDatePicker, setShowDatePicker] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { toast } = useToast()

  // Lọc nhãn theo từ khóa tìm kiếm
  const filteredLabels = sampleLabels.filter((label) => label.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Kiểm tra nhãn đã được chọn chưa
  const isLabelSelected = (labelId: string) => {
    return selectedLabels.some((selected) => selected.label_id === labelId)
  }

  // Thêm nhãn
  const handleAddLabel = (labelId: string) => {
    if (isLabelSelected(labelId)) return

    const label = sampleLabels.find((l) => l.id === labelId)
    if (!label) return

    const newSelectedLabel = {
      id: `temp-${Date.now()}`,
      label_id: label.id,
      name: label.name,
      color_code: label.color_code,
      valid_until: null,
    }

    const updatedLabels = [...selectedLabels, newSelectedLabel]
    setSelectedLabels(updatedLabels)

    if (onLabelsChange) {
      onLabelsChange(updatedLabels)
    }

    toast({
      title: "Nhãn đã được thêm",
      description: `Nhãn "${label.name}" đã được thêm vào sản phẩm.`,
    })
  }

  // Xóa nhãn
  const handleRemoveLabel = (id: string) => {
    const labelToRemove = selectedLabels.find((label) => label.id === id)
    if (!labelToRemove) return

    const updatedLabels = selectedLabels.filter((label) => label.id !== id)
    setSelectedLabels(updatedLabels)

    if (onLabelsChange) {
      onLabelsChange(updatedLabels)
    }

    toast({
      title: "Nhãn đã được xóa",
      description: `Nhãn "${labelToRemove.name}" đã được xóa khỏi sản phẩm.`,
      variant: "default",
    })
  }

  // Cập nhật thời hạn nhãn
  const handleUpdateValidUntil = (id: string, date: Date | null) => {
    const updatedLabels = selectedLabels.map((label) => (label.id === id ? { ...label, valid_until: date } : label))
    setSelectedLabels(updatedLabels)

    if (onLabelsChange) {
      onLabelsChange(updatedLabels)
    }

    setShowDatePicker(null)

    const label = selectedLabels.find((l) => l.id === id)
    toast({
      title: "Thời hạn đã được cập nhật",
      description: date
        ? `Nhãn "${label?.name}" sẽ hiển thị đến ngày ${date.toLocaleDateString("vi-VN")}.`
        : `Nhãn "${label?.name}" sẽ hiển thị không giới hạn thời gian.`,
    })
  }

  // Hiển thị danh sách nhãn có sẵn
  const renderAvailableLabels = () => {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm nhãn..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              Tất cả
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex-1">
              Phổ biến
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              Gần đây
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filteredLabels.length === 0 ? (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    Không tìm thấy nhãn phù hợp
                  </div>
                ) : (
                  filteredLabels.map((label) => (
                    <div
                      key={label.id}
                      className={`flex items-center justify-between rounded-md border p-3 transition-colors ${
                        isLabelSelected(label.id)
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: label.color_code }} />
                        <div>
                          <div className="font-medium">{label.name}</div>
                          <div className="text-xs text-muted-foreground">{label.description}</div>
                        </div>
                      </div>
                      <Button
                        variant={isLabelSelected(label.id) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleAddLabel(label.id)}
                        disabled={isLabelSelected(label.id)}
                      >
                        {isLabelSelected(label.id) ? (
                          <Check className="mr-1 h-4 w-4" />
                        ) : (
                          <Plus className="mr-1 h-4 w-4" />
                        )}
                        {isLabelSelected(label.id) ? "Đã thêm" : "Thêm"}
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="popular" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filteredLabels
                  .filter((_, index) => index < 4) // Giả lập nhãn phổ biến
                  .map((label) => (
                    <div
                      key={label.id}
                      className={`flex items-center justify-between rounded-md border p-3 transition-colors ${
                        isLabelSelected(label.id)
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: label.color_code }} />
                        <div>
                          <div className="font-medium">{label.name}</div>
                          <div className="text-xs text-muted-foreground">{label.description}</div>
                        </div>
                      </div>
                      <Button
                        variant={isLabelSelected(label.id) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleAddLabel(label.id)}
                        disabled={isLabelSelected(label.id)}
                      >
                        {isLabelSelected(label.id) ? (
                          <Check className="mr-1 h-4 w-4" />
                        ) : (
                          <Plus className="mr-1 h-4 w-4" />
                        )}
                        {isLabelSelected(label.id) ? "Đã thêm" : "Thêm"}
                      </Button>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filteredLabels
                  .filter((_, index) => index > 2 && index < 7) // Giả lập nhãn gần đây
                  .map((label) => (
                    <div
                      key={label.id}
                      className={`flex items-center justify-between rounded-md border p-3 transition-colors ${
                        isLabelSelected(label.id)
                          ? "border-primary bg-primary/5"
                          : "hover:border-primary/50 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-6 w-6 rounded-full" style={{ backgroundColor: label.color_code }} />
                        <div>
                          <div className="font-medium">{label.name}</div>
                          <div className="text-xs text-muted-foreground">{label.description}</div>
                        </div>
                      </div>
                      <Button
                        variant={isLabelSelected(label.id) ? "secondary" : "outline"}
                        size="sm"
                        onClick={() => handleAddLabel(label.id)}
                        disabled={isLabelSelected(label.id)}
                      >
                        {isLabelSelected(label.id) ? (
                          <Check className="mr-1 h-4 w-4" />
                        ) : (
                          <Plus className="mr-1 h-4 w-4" />
                        )}
                        {isLabelSelected(label.id) ? "Đã thêm" : "Thêm"}
                      </Button>
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  // Hiển thị danh sách nhãn đã chọn
  const renderSelectedLabels = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Nhãn đã chọn ({selectedLabels.length})</h3>
          {selectedLabels.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                    <Eye className="mr-1 h-4 w-4" />
                    Xem trước
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Xem trước hiển thị nhãn trên sản phẩm</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {selectedLabels.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center">
            <Tag className="mx-auto h-8 w-8 text-muted-foreground" />
            <h3 className="mt-2 text-sm font-medium">Chưa có nhãn nào</h3>
            <p className="mt-1 text-xs text-muted-foreground">Thêm nhãn từ danh sách bên trái.</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {selectedLabels.map((label) => (
                <motion.div
                  key={label.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div className="flex items-center space-x-3">
                    <Badge className="h-6 px-2 text-white" style={{ backgroundColor: label.color_code }}>
                      {label.name}
                    </Badge>
                    {label.valid_until && (
                      <span className="text-xs text-muted-foreground">
                        Đến {label.valid_until.toLocaleDateString("vi-VN")}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setShowDatePicker(label.id)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Đặt thời hạn hiển thị</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => handleRemoveLabel(label.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Xóa nhãn</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  {showDatePicker === label.id && (
                    <ProductLabelDatePicker
                      selectedDate={label.valid_until}
                      onSelect={(date) => handleUpdateValidUntil(label.id, date)}
                      onClose={() => setShowDatePicker(null)}
                    />
                  )}
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}

        {showPreview && <ProductLabelPreview labels={selectedLabels} onClose={() => setShowPreview(false)} />}
      </div>
    )
  }

  // Hiển thị trên desktop
  if (isDesktop) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nhãn sản phẩm</CardTitle>
              <CardDescription>Thêm nhãn cho sản phẩm (mới, bán chạy, giảm giá, ...)</CardDescription>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setShowLabelForm(true)}>
                    <Plus className="mr-1 h-4 w-4" />
                    Tạo nhãn mới
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Tạo nhãn mới nếu không tìm thấy nhãn phù hợp</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Chọn nhãn</h3>
              {renderAvailableLabels()}
            </div>
            <div>{renderSelectedLabels()}</div>
          </div>

          {showLabelForm && (
            <ProductLabelForm
              label={editingLabel}
              onClose={() => {
                setShowLabelForm(false)
                setEditingLabel(null)
              }}
              onSave={(label) => {
                toast({
                  title: editingLabel ? "Nhãn đã được cập nhật" : "Nhãn mới đã được tạo",
                  description: `Nhãn "${label.name}" đã được ${editingLabel ? "cập nhật" : "tạo"} thành công.`,
                })
                setShowLabelForm(false)
                setEditingLabel(null)
              }}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Info className="mr-2 h-4 w-4" />
            Nhãn sẽ hiển thị trên trang sản phẩm và danh sách sản phẩm
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setSelectedLabels([])}>
              Xóa tất cả
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Hiển thị trên mobile
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Nhãn sản phẩm</CardTitle>
            <CardDescription>Thêm nhãn cho sản phẩm (mới, bán chạy, giảm giá, ...)</CardDescription>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => setShowLabelForm(true)}>
                  <Plus className="mr-1 h-4 w-4" />
                  Tạo nhãn
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tạo nhãn mới nếu không tìm thấy nhãn phù hợp</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="selected">
          <TabsList className="w-full">
            <TabsTrigger value="selected" className="flex-1">
              Đã chọn ({selectedLabels.length})
            </TabsTrigger>
            <TabsTrigger value="available" className="flex-1">
              Chọn nhãn
            </TabsTrigger>
          </TabsList>
          <TabsContent value="selected" className="mt-4">
            {renderSelectedLabels()}
          </TabsContent>
          <TabsContent value="available" className="mt-4">
            {renderAvailableLabels()}
          </TabsContent>
        </Tabs>

        {showLabelForm && (
          <Drawer open={showLabelForm} onOpenChange={setShowLabelForm}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{editingLabel ? "Chỉnh sửa nhãn" : "Tạo nhãn mới"}</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <ProductLabelForm
                  label={editingLabel}
                  onClose={() => {
                    setShowLabelForm(false)
                    setEditingLabel(null)
                  }}
                  onSave={(label) => {
                    toast({
                      title: editingLabel ? "Nhãn đã được cập nhật" : "Nhãn mới đã được tạo",
                      description: `Nhãn "${label.name}" đã được ${editingLabel ? "cập nhật" : "tạo"} thành công.`,
                    })
                    setShowLabelForm(false)
                    setEditingLabel(null)
                  }}
                />
              </div>
            </DrawerContent>
          </Drawer>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t px-4 py-3">
        <div className="flex items-center text-xs text-muted-foreground">
          <Info className="mr-1 h-3 w-3" />
          Nhãn sẽ hiển thị trên trang sản phẩm
        </div>
        <Button variant="outline" size="sm" onClick={() => setSelectedLabels([])}>
          Xóa tất cả
        </Button>
      </CardFooter>
    </Card>
  )
}

// Thêm component Eye cho xem trước
function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

