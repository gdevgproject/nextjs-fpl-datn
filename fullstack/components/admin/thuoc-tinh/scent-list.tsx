"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import {
  Plus,
  Edit,
  Trash2,
  Save,
  Search,
  FileDown,
  FileUp,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  X,
  MoreHorizontal,
  Eye,
  RefreshCw,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { FormLabel } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useToast } from "@/components/ui/use-toast"
import { useMediaQuery } from "@/hooks/use-media-query"

import type { Scent } from "@/types/san-pham"

// Định nghĩa các nhóm mùi hương
const scentGroups = [
  { id: "floral", name: "Hương hoa" },
  { id: "fruity", name: "Hương trái cây" },
  { id: "woody", name: "Hương gỗ" },
  { id: "oriental", name: "Hương phương Đông" },
  { id: "fresh", name: "Hương tươi mát" },
  { id: "spicy", name: "Hương cay nồng" },
  { id: "gourmand", name: "Hương thực phẩm" },
  { id: "green", name: "Hương xanh" },
  { id: "aquatic", name: "Hương biển" },
  { id: "citrus", name: "Hương cam quýt" },
]

export function ScentList() {
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"name" | "group" | "created_at">("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [selectedScents, setSelectedScents] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)

  const [scentToEdit, setScentToEdit] = useState<Scent | null>(null)
  const [scentToDelete, setScentToDelete] = useState<Scent | null>(null)
  const [scentToPreview, setScentToPreview] = useState<Scent | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    group_id: "",
  })

  // Dữ liệu mẫu cho mùi hương với thêm trường group_id
  const sampleScents: (Scent & { group_id?: string; product_count?: number })[] = [
    {
      id: "1",
      name: "Hoa hồng",
      description: "Mùi hương hoa hồng ngọt ngào, lãng mạn",
      created_at: "2023-01-01T00:00:00Z",
      group_id: "floral",
      product_count: 12,
    },
    {
      id: "2",
      name: "Hoa nhài",
      description: "Mùi hương hoa nhài tinh tế, thanh lịch",
      created_at: "2023-01-02T00:00:00Z",
      group_id: "floral",
      product_count: 8,
    },
    {
      id: "3",
      name: "Hoa oải hương",
      description: "Mùi hương hoa oải hương thư giãn, dịu nhẹ",
      created_at: "2023-01-03T00:00:00Z",
      group_id: "floral",
      product_count: 15,
    },
    {
      id: "4",
      name: "Vani",
      description: "Mùi hương vani ngọt ngào, ấm áp",
      created_at: "2023-01-04T00:00:00Z",
      group_id: "gourmand",
      product_count: 20,
    },
    {
      id: "5",
      name: "Gỗ đàn hương",
      description: "Mùi hương gỗ đàn hương ấm áp, sang trọng",
      created_at: "2023-01-05T00:00:00Z",
      group_id: "woody",
      product_count: 10,
    },
    {
      id: "6",
      name: "Xạ hương",
      description: "Mùi hương xạ hương gợi cảm, quyến rũ",
      created_at: "2023-01-06T00:00:00Z",
      group_id: "oriental",
      product_count: 7,
    },
    {
      id: "7",
      name: "Cam Bergamot",
      description: "Mùi hương cam bergamot tươi mát, sảng khoái",
      created_at: "2023-01-07T00:00:00Z",
      group_id: "citrus",
      product_count: 9,
    },
    {
      id: "8",
      name: "Quế",
      description: "Mùi hương quế ấm áp, cay nồng",
      created_at: "2023-01-08T00:00:00Z",
      group_id: "spicy",
      product_count: 5,
    },
    {
      id: "9",
      name: "Biển",
      description: "Mùi hương biển tươi mát, trong lành",
      created_at: "2023-01-09T00:00:00Z",
      group_id: "aquatic",
      product_count: 11,
    },
    {
      id: "10",
      name: "Táo xanh",
      description: "Mùi hương táo xanh tươi mát, ngọt ngào",
      created_at: "2023-01-10T00:00:00Z",
      group_id: "fruity",
      product_count: 6,
    },
    {
      id: "11",
      name: "Cỏ cắt",
      description: "Mùi hương cỏ mới cắt tươi mát, xanh mát",
      created_at: "2023-01-11T00:00:00Z",
      group_id: "green",
      product_count: 4,
    },
    {
      id: "12",
      name: "Chanh",
      description: "Mùi hương chanh tươi mát, sảng khoái",
      created_at: "2023-01-12T00:00:00Z",
      group_id: "citrus",
      product_count: 8,
    },
  ]

  // Lọc và sắp xếp mùi hương
  const filteredScents = useMemo(() => {
    let result = [...sampleScents]

    // Lọc theo từ khóa tìm kiếm
    if (searchTerm) {
      result = result.filter(
        (scent) =>
          scent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          scent.description?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Lọc theo nhóm mùi hương
    if (selectedGroup) {
      result = result.filter((scent) => scent.group_id === selectedGroup)
    }

    // Sắp xếp
    result.sort((a, b) => {
      if (sortBy === "name") {
        return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      } else if (sortBy === "group") {
        const groupA = scentGroups.find((g) => g.id === a.group_id)?.name || ""
        const groupB = scentGroups.find((g) => g.id === b.group_id)?.name || ""
        return sortOrder === "asc" ? groupA.localeCompare(groupB) : groupB.localeCompare(groupA)
      } else {
        return sortOrder === "asc"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return result
  }, [sampleScents, searchTerm, selectedGroup, sortBy, sortOrder])

  // Xử lý chọn tất cả
  const handleSelectAll = useCallback(() => {
    if (selectAll) {
      setSelectedScents([])
    } else {
      setSelectedScents(filteredScents.map((scent) => scent.id))
    }
    setSelectAll(!selectAll)
  }, [selectAll, filteredScents])

  // Xử lý chọn một mùi hương
  const handleSelectScent = useCallback((id: string) => {
    setSelectedScents((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      } else {
        return [...prev, id]
      }
    })
  }, [])

  // Xử lý thêm mùi hương
  const handleAddClick = useCallback(() => {
    setFormData({
      name: "",
      description: "",
      group_id: "",
    })
    setIsAddDialogOpen(true)
  }, [])

  // Xử lý sửa mùi hương
  const handleEditClick = useCallback((scent: Scent & { group_id?: string }) => {
    setScentToEdit(scent)
    setFormData({
      name: scent.name,
      description: scent.description || "",
      group_id: scent.group_id || "",
    })
    setIsEditDialogOpen(true)
  }, [])

  // Xử lý xóa mùi hương
  const handleDeleteClick = useCallback((scent: Scent) => {
    setScentToDelete(scent)
    setIsDeleteDialogOpen(true)
  }, [])

  // Xử lý xem trước mùi hương
  const handlePreviewClick = useCallback((scent: Scent) => {
    setScentToPreview(scent)
    setIsPreviewDialogOpen(true)
  }, [])

  // Xử lý xóa nhiều mùi hương
  const handleBulkDeleteClick = useCallback(() => {
    if (selectedScents.length > 0) {
      setIsBulkDeleteDialogOpen(true)
    }
  }, [selectedScents])

  // Xử lý submit form thêm mùi hương
  const handleAddSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      // Giả lập việc thêm mùi hương
      console.log("Thêm mùi hương:", formData)
      toast({
        title: "Thêm mùi hương thành công",
        description: `Đã thêm mùi hương "${formData.name}" vào hệ thống.`,
      })
      setIsAddDialogOpen(false)
    },
    [formData, toast],
  )

  // Xử lý submit form sửa mùi hương
  const handleEditSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      // Giả lập việc cập nhật mùi hương
      console.log("Cập nhật mùi hương:", scentToEdit?.id, formData)
      toast({
        title: "Cập nhật mùi hương thành công",
        description: `Đã cập nhật mùi hương "${formData.name}".`,
      })
      setIsEditDialogOpen(false)
    },
    [scentToEdit, formData, toast],
  )

  // Xử lý xác nhận xóa mùi hương
  const handleDeleteConfirm = useCallback(() => {
    // Giả lập việc xóa mùi hương
    console.log("Xóa mùi hương:", scentToDelete)
    toast({
      title: "Xóa mùi hương thành công",
      description: `Đã xóa mùi hương "${scentToDelete?.name}".`,
    })
    setIsDeleteDialogOpen(false)
    setScentToDelete(null)
  }, [scentToDelete, toast])

  // Xử lý xác nhận xóa nhiều mùi hương
  const handleBulkDeleteConfirm = useCallback(() => {
    // Giả lập việc xóa nhiều mùi hương
    console.log("Xóa nhiều mùi hương:", selectedScents)
    toast({
      title: "Xóa mùi hương thành công",
      description: `Đã xóa ${selectedScents.length} mùi hương.`,
    })
    setIsBulkDeleteDialogOpen(false)
    setSelectedScents([])
    setSelectAll(false)
  }, [selectedScents, toast])

  // Xử lý import mùi hương
  const handleImportSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      // Giả lập việc import mùi hương
      console.log("Import mùi hương")
      toast({
        title: "Import mùi hương thành công",
        description: "Đã import 5 mùi hương mới vào hệ thống.",
      })
      setIsImportDialogOpen(false)
    },
    [toast],
  )

  // Xử lý export mùi hương
  const handleExport = useCallback(() => {
    // Giả lập việc export mùi hương
    console.log("Export mùi hương")
    toast({
      title: "Export mùi hương thành công",
      description: "Đã export danh sách mùi hương ra file Excel.",
    })
  }, [toast])

  // Xử lý thay đổi form
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({ ...prev, [name]: value }))
    },
    [],
  )

  // Xử lý thay đổi select
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  // Xử lý reset bộ lọc
  const handleResetFilters = useCallback(() => {
    setSearchTerm("")
    setSelectedGroup(null)
    setSortBy("name")
    setSortOrder("asc")
    setIsFilterOpen(false)
  }, [])

  // Render badge nhóm mùi hương
  const renderGroupBadge = useCallback((groupId?: string) => {
    if (!groupId) return null

    const group = scentGroups.find((g) => g.id === groupId)
    if (!group) return null

    const colorMap: Record<string, string> = {
      floral: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      fruity: "bg-orange-100 text-orange-800 hover:bg-orange-200",
      woody: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      oriental: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      fresh: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      spicy: "bg-red-100 text-red-800 hover:bg-red-200",
      gourmand: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      green: "bg-green-100 text-green-800 hover:bg-green-200",
      aquatic: "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
      citrus: "bg-lime-100 text-lime-800 hover:bg-lime-200",
    }

    return (
      <Badge
        variant="outline"
        className={`font-normal ${colorMap[groupId] || "bg-gray-100 text-gray-800 hover:bg-gray-200"}`}
      >
        {group.name}
      </Badge>
    )
  }, [])

  // Render danh sách mùi hương dạng lưới
  const renderGridView = useCallback(() => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
        {filteredScents.map((scent) => (
          <Card key={scent.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1 mr-2">
                  <CardTitle className="text-base font-medium">{scent.name}</CardTitle>
                </div>
                <Checkbox
                  checked={selectedScents.includes(scent.id)}
                  onCheckedChange={() => handleSelectScent(scent.id)}
                  aria-label={`Chọn ${scent.name}`}
                  className="mt-1"
                />
              </div>
              <div className="mt-1">{renderGroupBadge(scent.group_id)}</div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {scent.description && <p className="text-sm text-muted-foreground line-clamp-2">{scent.description}</p>}
              {scent.product_count !== undefined && (
                <p className="text-xs text-muted-foreground mt-2">Sử dụng trong {scent.product_count} sản phẩm</p>
              )}
            </CardContent>
            <CardFooter className="p-2 pt-0 flex justify-end gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => handlePreviewClick(scent)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Xem trước</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => handleEditClick(scent)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Chỉnh sửa</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(scent)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Xóa</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }, [
    filteredScents,
    selectedScents,
    handleSelectScent,
    handlePreviewClick,
    handleEditClick,
    handleDeleteClick,
    renderGroupBadge,
  ])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Danh sách mùi hương</CardTitle>
            <CardDescription>Quản lý các mùi hương được sử dụng trong sản phẩm</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleAddClick}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm mùi hương
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => setIsImportDialogOpen(true)}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Import mùi hương
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport}>
                  <FileDown className="mr-2 h-4 w-4" />
                  Export mùi hương
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleBulkDeleteClick}
                  disabled={selectedScents.length === 0}
                  className={selectedScents.length === 0 ? "text-muted-foreground" : "text-red-600"}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa mùi hương đã chọn
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm mùi hương..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex gap-2">
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Bộ lọc</span>
                    {(selectedGroup || sortBy !== "name" || sortOrder !== "asc") && (
                      <Badge
                        variant="secondary"
                        className="ml-1 rounded-full px-1 py-0 h-5 min-w-5 flex items-center justify-center"
                      >
                        !
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Bộ lọc</h4>
                    <div className="space-y-2">
                      <FormLabel>Nhóm mùi hương</FormLabel>
                      <Select value={selectedGroup || ""} onValueChange={(value) => setSelectedGroup(value || null)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Tất cả nhóm" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả nhóm</SelectItem>
                          {scentGroups.map((group) => (
                            <SelectItem key={group.id} value={group.id}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FormLabel>Sắp xếp theo</FormLabel>
                      <Select
                        value={sortBy}
                        onValueChange={(value) => setSortBy(value as "name" | "group" | "created_at")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="name">Tên mùi hương</SelectItem>
                          <SelectItem value="group">Nhóm mùi hương</SelectItem>
                          <SelectItem value="created_at">Ngày tạo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <FormLabel>Thứ tự</FormLabel>
                      <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "asc" | "desc")}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="asc">Tăng dần</SelectItem>
                          <SelectItem value="desc">Giảm dần</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-between pt-2">
                      <Button variant="outline" size="sm" onClick={handleResetFilters}>
                        <RefreshCw className="mr-2 h-3 w-3" />
                        Đặt lại
                      </Button>
                      <Button size="sm" onClick={() => setIsFilterOpen(false)}>
                        Áp dụng
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <div className="flex rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="icon"
                  className="rounded-r-none"
                  onClick={() => setViewMode("list")}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="icon"
                  className="rounded-l-none"
                  onClick={() => setViewMode("grid")}
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    <div className="w-1.5 h-1.5 rounded-sm bg-current"></div>
                    <div className="w-1.5 h-1.5 rounded-sm bg-current"></div>
                    <div className="w-1.5 h-1.5 rounded-sm bg-current"></div>
                    <div className="w-1.5 h-1.5 rounded-sm bg-current"></div>
                  </div>
                </Button>
              </div>
            </div>
          </div>

          {selectedScents.length > 0 && (
            <div className="flex items-center gap-2 py-2">
              <span className="text-sm text-muted-foreground">Đã chọn {selectedScents.length} mùi hương</span>
              <Button variant="outline" size="sm" onClick={() => setSelectedScents([])} className="h-8">
                <X className="mr-2 h-3 w-3" />
                Bỏ chọn
              </Button>
              <Button variant="destructive" size="sm" onClick={handleBulkDeleteClick} className="h-8">
                <Trash2 className="mr-2 h-3 w-3" />
                Xóa đã chọn
              </Button>
            </div>
          )}

          {viewMode === "list" ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Chọn tất cả" />
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => {
                          if (sortBy === "name") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                          } else {
                            setSortBy("name")
                            setSortOrder("asc")
                          }
                        }}
                      >
                        Tên mùi hương
                        {sortBy === "name" &&
                          (sortOrder === "asc" ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4 transform rotate-180" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead>
                      <div
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => {
                          if (sortBy === "group") {
                            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                          } else {
                            setSortBy("group")
                            setSortOrder("asc")
                          }
                        }}
                      >
                        Nhóm
                        {sortBy === "group" &&
                          (sortOrder === "asc" ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4 transform rotate-180" />
                          ))}
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Mô tả</TableHead>
                    <TableHead className="hidden sm:table-cell">Sản phẩm</TableHead>
                    <TableHead className="w-[100px]">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredScents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        Không tìm thấy mùi hương nào
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredScents.map((scent) => (
                      <TableRow key={scent.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedScents.includes(scent.id)}
                            onCheckedChange={() => handleSelectScent(scent.id)}
                            aria-label={`Chọn ${scent.name}`}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{scent.name}</TableCell>
                        <TableCell>{renderGroupBadge(scent.group_id)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="line-clamp-1">{scent.description}</span>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {scent.product_count !== undefined ? scent.product_count : 0}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handlePreviewClick(scent)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Xem trước</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" onClick={() => handleEditClick(scent)}>
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Chỉnh sửa</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteClick(scent)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Xóa</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            renderGridView()
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Hiển thị {filteredScents.length} / {sampleScents.length} mùi hương
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Trước
              </Button>
              <Button variant="outline" size="sm" disabled>
                Sau
              </Button>
            </div>
          </div>
        </div>
      </CardContent>

      {/* Dialog thêm mùi hương */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Thêm mùi hương mới</DialogTitle>
            <DialogDescription>Nhập thông tin chi tiết cho mùi hương mới</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <FormLabel htmlFor="name">
                  Tên mùi hương <span className="text-red-500">*</span>
                </FormLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nhập tên mùi hương"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="group_id">Nhóm mùi hương</FormLabel>
                <Select value={formData.group_id} onValueChange={(value) => handleSelectChange("group_id", value)}>
                  <SelectTrigger id="group_id">
                    <SelectValue placeholder="Chọn nhóm mùi hương" />
                  </SelectTrigger>
                  <SelectContent>
                    {scentGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="description">Mô tả</FormLabel>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Nhập mô tả cho mùi hương"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Lưu
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog chỉnh sửa mùi hương */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa mùi hương</DialogTitle>
            <DialogDescription>Cập nhật thông tin chi tiết cho mùi hương</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <FormLabel htmlFor="edit-name">
                  Tên mùi hương <span className="text-red-500">*</span>
                </FormLabel>
                <Input
                  id="edit-name"
                  name="name"
                  placeholder="Nhập tên mùi hương"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="edit-group_id">Nhóm mùi hương</FormLabel>
                <Select value={formData.group_id} onValueChange={(value) => handleSelectChange("group_id", value)}>
                  <SelectTrigger id="edit-group_id">
                    <SelectValue placeholder="Chọn nhóm mùi hương" />
                  </SelectTrigger>
                  <SelectContent>
                    {scentGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="edit-description">Mô tả</FormLabel>
                <Textarea
                  id="edit-description"
                  name="description"
                  placeholder="Nhập mô tả cho mùi hương"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa mùi hương */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa mùi hương</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa mùi hương "{scentToDelete?.name}"? Hành động này không thể hoàn tác.
              {scentToDelete && (scentToDelete as any).product_count > 0 && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md text-amber-700">
                  <strong>Lưu ý:</strong> Mùi hương này đang được sử dụng trong {(scentToDelete as any).product_count}{" "}
                  sản phẩm. Việc xóa có thể ảnh hưởng đến các sản phẩm này.
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog xóa nhiều mùi hương */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa nhiều mùi hương</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa {selectedScents.length} mùi hương đã chọn? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsBulkDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleBulkDeleteConfirm}>
              Xóa {selectedScents.length} mùi hương
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog import mùi hương */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Import mùi hương</DialogTitle>
            <DialogDescription>Tải lên file Excel hoặc CSV chứa danh sách mùi hương cần import</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleImportSubmit}>
            <div className="space-y-4 py-4">
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <FileUp className="h-8 w-8 mx-auto text-muted-foreground" />
                <div className="mt-2">
                  <Button variant="secondary" size="sm">
                    Chọn file
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Hỗ trợ file .xlsx, .xls, .csv</p>
              </div>
              <div className="text-sm">
                <p className="font-medium">Hướng dẫn:</p>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1 mt-1">
                  <li>File phải có các cột: Tên mùi hương, Mô tả, Nhóm mùi hương</li>
                  <li>Tên mùi hương không được trùng với các mùi hương đã có</li>
                  <li>Nhóm mùi hương phải khớp với các nhóm có sẵn trong hệ thống</li>
                </ul>
              </div>
              <div>
                <Button variant="outline" size="sm" className="w-full">
                  <FileDown className="mr-2 h-4 w-4" />
                  Tải file mẫu
                </Button>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsImportDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                <FileUp className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog xem trước mùi hương */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Xem trước mùi hương</DialogTitle>
            <DialogDescription>Xem chi tiết và cách hiển thị mùi hương trong sản phẩm</DialogDescription>
          </DialogHeader>
          {scentToPreview && (
            <div className="py-4">
              <Tabs defaultValue="info">
                <TabsList className="mb-4">
                  <TabsTrigger value="info">Thông tin</TabsTrigger>
                  <TabsTrigger value="products">Sản phẩm sử dụng</TabsTrigger>
                  <TabsTrigger value="preview">Xem trước</TabsTrigger>
                </TabsList>
                <TabsContent value="info" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Tên mùi hương</h4>
                      <p className="text-base">{scentToPreview.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Nhóm mùi hương</h4>
                      <p className="text-base">{renderGroupBadge((scentToPreview as any).group_id)}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Mô tả</h4>
                      <p className="text-base">{scentToPreview.description || "Không có mô tả"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Ngày tạo</h4>
                      <p className="text-base">{new Date(scentToPreview.created_at).toLocaleDateString("vi-VN")}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Số sản phẩm sử dụng</h4>
                      <p className="text-base">{(scentToPreview as any).product_count || 0}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="products">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tên sản phẩm</TableHead>
                          <TableHead>Thương hiệu</TableHead>
                          <TableHead>Loại hương</TableHead>
                          <TableHead className="w-[100px]">Thao tác</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(scentToPreview as any).product_count > 0 ? (
                          Array.from({ length: Math.min(5, (scentToPreview as any).product_count) }).map((_, index) => (
                            <TableRow key={index}>
                              <TableCell>Sản phẩm mẫu {index + 1}</TableCell>
                              <TableCell>Thương hiệu mẫu</TableCell>
                              <TableCell>
                                {Math.random() > 0.5 ? "Top" : Math.random() > 0.5 ? "Middle" : "Base"}
                              </TableCell>
                              <TableCell>
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Xem
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                              Không có sản phẩm nào sử dụng mùi hương này
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  {(scentToPreview as any).product_count > 5 && (
                    <div className="mt-2 text-center">
                      <Button variant="link" size="sm">
                        Xem tất cả {(scentToPreview as any).product_count} sản phẩm
                      </Button>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="preview">
                  <div className="space-y-4">
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2">Hiển thị trong chi tiết sản phẩm</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <div className="flex items-center gap-2 mb-2">
                          <h5 className="font-medium">Hương thơm</h5>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <h6 className="text-sm font-medium text-muted-foreground mb-1">Hương đầu (Top)</h6>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-gray-100">
                                Cam Bergamot
                              </Badge>
                              <Badge variant="outline" className="bg-gray-100">
                                Chanh
                              </Badge>
                              {Math.random() > 0.5 && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  {scentToPreview.name}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium text-muted-foreground mb-1">Hương giữa (Middle)</h6>
                            <div className="flex flex-wrap gap-2">
                              <Badge variant="outline" className="bg-gray-100">
                                Hoa nhài
                              </Badge>
                              {Math.random() > 0.5 && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  {scentToPreview.name}
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-gray-100">
                                Hoa oải hương
                              </Badge>
                            </div>
                          </div>
                          <div>
                            <h6 className="text-sm font-medium text-muted-foreground mb-1">Hương cuối (Base)</h6>
                            <div className="flex flex-wrap gap-2">
                              {Math.random() > 0.5 && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800">
                                  {scentToPreview.name}
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-gray-100">
                                Gỗ đàn hương
                              </Badge>
                              <Badge variant="outline" className="bg-gray-100">
                                Xạ hương
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-md p-4">
                      <h4 className="text-sm font-medium mb-2">Hiển thị trong bộ lọc sản phẩm</h4>
                      <div className="bg-gray-50 p-4 rounded-md">
                        <h5 className="font-medium mb-2">Lọc theo mùi hương</h5>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="scent-1" />
                            <label htmlFor="scent-1" className="text-sm">
                              Hoa hồng
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="scent-2" />
                            <label htmlFor="scent-2" className="text-sm">
                              Hoa nhài
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="scent-3" checked />
                            <label htmlFor="scent-3" className="text-sm font-medium">
                              {scentToPreview.name}
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="scent-4" />
                            <label htmlFor="scent-4" className="text-sm">
                              Gỗ đàn hương
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewDialogOpen(false)}>
              Đóng
            </Button>
            {scentToPreview && (
              <Button
                variant="outline"
                onClick={() => {
                  setIsPreviewDialogOpen(false)
                  handleEditClick(scentToPreview)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

