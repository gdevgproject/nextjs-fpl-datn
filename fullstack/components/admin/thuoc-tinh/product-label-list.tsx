"use client"

import { useState, useEffect } from "react"
import { Plus, Search, FileDown, FileUp, SlidersHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProductLabelForm } from "./product-label-form"
import { ProductLabelItem } from "./product-label-item"
import { ProductLabelDeleteDialog } from "./product-label-delete-dialog"
import { ProductLabelAssignmentDialog } from "./product-label-assignment-dialog"
import { ProductLabelBulkAssignDialog } from "./product-label-bulk-assign-dialog"
import { ProductLabelImportDialog } from "./product-label-import-dialog"
import { ProductLabelStats } from "./product-label-stats"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

// Mock data
const productLabels = [
  {
    id: "1",
    name: "Mới",
    color_code: "#10b981",
    product_count: 15,
  },
  {
    id: "2",
    name: "Bán chạy",
    color_code: "#f97316",
    product_count: 8,
  },
  {
    id: "3",
    name: "Giảm giá",
    color_code: "#ef4444",
    product_count: 12,
  },
  {
    id: "4",
    name: "Hết hàng",
    color_code: "#6b7280",
    product_count: 3,
  },
  {
    id: "5",
    name: "Sắp ra mắt",
    color_code: "#8b5cf6",
    product_count: 5,
  },
  {
    id: "6",
    name: "Độc quyền",
    color_code: "#ec4899",
    product_count: 7,
  },
  {
    id: "7",
    name: "Giới hạn",
    color_code: "#f59e0b",
    product_count: 4,
  },
  {
    id: "8",
    name: "Khuyến nghị",
    color_code: "#3b82f6",
    product_count: 9,
  },
]

export function ProductLabelList() {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingLabel, setEditingLabel] = useState<any | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)
  const [bulkAssignDialogOpen, setBulkAssignDialogOpen] = useState(false)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [selectedLabelForAssignment, setSelectedLabelForAssignment] = useState<any | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(true)

  // Giả lập việc tải dữ liệu
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  const filteredLabels = productLabels
    .filter((label) => label.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name)
      } else if (sortBy === "product_count") {
        return b.product_count - a.product_count
      }
      return 0
    })

  const handleEdit = (label: any) => {
    setEditingLabel(label)
    setShowAddForm(true)
  }

  const handleDelete = (id: string) => {
    setSelectedLabelId(id)
    setDeleteDialogOpen(true)
  }

  const handleAssign = (label: any) => {
    setSelectedLabelForAssignment(label)
    setAssignmentDialogOpen(true)
  }

  const handleFormClose = () => {
    setShowAddForm(false)
    setEditingLabel(null)
  }

  const handleFormSubmit = (data: any) => {
    if (editingLabel) {
      // Giả lập việc cập nhật nhãn
      console.log("Cập nhật nhãn:", { id: editingLabel.id, ...data })
      toast({
        title: "Cập nhật thành công",
        description: `Đã cập nhật nhãn "${data.name}"`,
      })
    } else {
      // Giả lập việc thêm nhãn
      console.log("Thêm nhãn:", data)
      toast({
        title: "Thêm thành công",
        description: `Đã thêm nhãn "${data.name}"`,
      })
    }
    setShowAddForm(false)
    setEditingLabel(null)
  }

  const handleExportClick = () => {
    // Giả lập việc xuất dữ liệu
    console.log("Xuất dữ liệu nhãn sản phẩm")
    toast({
      title: "Xuất dữ liệu thành công",
      description: "Dữ liệu nhãn sản phẩm đã được xuất thành công",
    })
  }

  const handleImportClick = () => {
    setImportDialogOpen(true)
  }

  const handleBulkAssignClick = () => {
    setBulkAssignDialogOpen(true)
  }

  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div key={index} className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-32" />
        </div>
        <Skeleton className="h-4 w-full" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-6 w-16" />
          <div className="flex space-x-2">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
    ))
  }

  return (
    <div className="space-y-6">
      <ProductLabelStats />

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <div>
            <CardTitle>Nhãn sản phẩm</CardTitle>
            <CardDescription>Quản lý các nhãn gắn cho sản phẩm như Mới, Bán chạy, Giảm giá</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
            <Button onClick={() => setShowAddForm(true)} disabled={showAddForm}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm nhãn
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportClick}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Xuất dữ liệu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleImportClick}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Nhập dữ liệu
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkAssignClick}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2"
                  >
                    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
                    <path d="M18 14h-8" />
                    <path d="m15 11-3 3 3 3" />
                  </svg>
                  Gán hàng loạt
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative w-full sm:w-auto sm:flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm nhãn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sắp xếp theo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Tên nhãn</SelectItem>
                    <SelectItem value="product_count">Số lượng sản phẩm</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                >
                  {viewMode === "grid" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-list"
                    >
                      <line x1="8" x2="21" y1="6" y2="6" />
                      <line x1="8" x2="21" y1="12" y2="12" />
                      <line x1="8" x2="21" y1="18" y2="18" />
                      <line x1="3" x2="3" y1="6" y2="6" />
                      <line x1="3" x2="3" y1="12" y2="12" />
                      <line x1="3" x2="3" y1="18" y2="18" />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-grid-2x2"
                    >
                      <rect width="18" height="18" x="3" y="3" rx="2" />
                      <path d="M3 12h18" />
                      <path d="M12 3v18" />
                    </svg>
                  )}
                </Button>
              </div>
            </div>

            {showAddForm && (
              <div className="mb-6">
                <ProductLabelForm label={editingLabel} onClose={handleFormClose} onSubmit={handleFormSubmit} />
              </div>
            )}

            <div
              className={`grid grid-cols-1 gap-4 ${viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : ""}`}
            >
              {isLoading ? (
                renderSkeletons()
              ) : filteredLabels.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center p-8 text-center">
                  <div className="rounded-full bg-muted p-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-muted-foreground"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">Không tìm thấy nhãn nào</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Không tìm thấy nhãn nào phù hợp với tìm kiếm của bạn.
                  </p>
                  <Button variant="link" onClick={() => setSearchTerm("")}>
                    Xóa tìm kiếm
                  </Button>
                </div>
              ) : (
                filteredLabels.map((label) => (
                  <ProductLabelItem
                    key={label.id}
                    label={label}
                    viewMode={viewMode}
                    onEdit={() => handleEdit(label)}
                    onDelete={() => handleDelete(label.id)}
                    onAssign={() => handleAssign(label)}
                  />
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ProductLabelDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} labelId={selectedLabelId} />

      <ProductLabelAssignmentDialog
        open={assignmentDialogOpen}
        onOpenChange={setAssignmentDialogOpen}
        label={selectedLabelForAssignment}
      />

      <ProductLabelBulkAssignDialog open={bulkAssignDialogOpen} onOpenChange={setBulkAssignDialogOpen} />

      <ProductLabelImportDialog open={importDialogOpen} onOpenChange={setImportDialogOpen} />
    </div>
  )
}

