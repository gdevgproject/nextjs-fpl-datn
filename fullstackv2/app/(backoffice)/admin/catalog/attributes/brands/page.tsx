"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminLayout } from "@/components/layout/backoffice/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, ArrowUpDown, Loader2 } from "lucide-react"
import { useBrands } from "./hooks/use-brands"
import { useDeleteBrand } from "./hooks/use-delete-brand"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"
import { useDebounce } from "./hooks/use-debounce"
import { BrandDialog } from "./components/brand-dialog"
import { formatDate } from "@/shared/lib/utils"

export default function BrandsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useSonnerToast()

  // State for search, pagination, and sorting
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery, 500)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [sortColumn, setSortColumn] = useState<string>("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // State for brand dialog and delete confirmation
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<any>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch brands with pagination, search, and sorting
  const {
    data: brandsData,
    isLoading,
    error,
    refetch,
  } = useBrands(
    { search: debouncedSearch },
    { page: currentPage, pageSize },
    { column: sortColumn, direction: sortDirection },
  )

  // Delete brand mutation
  const deleteBrandMutation = useDeleteBrand()

  // Handle sort toggle
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortColumn(column)
      setSortDirection("asc")
    }
  }

  // Handle brand edit
  const handleEdit = (brand: any) => {
    setSelectedBrand(brand)
    setIsEditDialogOpen(true)
  }

  // Handle brand delete
  const handleDelete = (brand: any) => {
    setSelectedBrand(brand)
    setIsDeleteDialogOpen(true)
  }

  // Confirm brand deletion
  const confirmDelete = async () => {
    if (!selectedBrand) return

    try {
      setIsDeleting(true)
      await deleteBrandMutation.mutateAsync({ id: selectedBrand.id })

      // Đóng dialog trước khi hiển thị toast
      setIsDeleteDialogOpen(false)

      // Refetch data sau khi xóa thành công
      await refetch()

      toast.success("Thương hiệu đã được xóa thành công")
    } catch (error) {
      console.error("Error deleting brand:", error)
      toast.error(`Lỗi khi xóa thương hiệu: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Calculate total pages
  const totalItems = brandsData?.count || 0
  const totalPages = Math.ceil(totalItems / pageSize)

  // Generate pagination items
  const generatePaginationItems = () => {
    const items = []
    const maxVisiblePages = 5

    // Always show first page
    items.push(
      <PaginationItem key="first">
        <PaginationLink
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setCurrentPage(1)
          }}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    )

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i <= 1 || i >= totalPages) continue

      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setCurrentPage(i)
            }}
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key="last">
          <PaginationLink
            href="#"
            onClick={(e) => {
              e.preventDefault()
              setCurrentPage(totalPages)
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý thương hiệu</h1>
          <p className="text-muted-foreground">Quản lý danh sách các thương hiệu nước hoa trong hệ thống</p>
        </div>

        <Tabs defaultValue="list" className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="list">Danh sách</TabsTrigger>
              <TabsTrigger value="grid">Lưới</TabsTrigger>
            </TabsList>
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Tìm kiếm thương hiệu..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm thương hiệu
              </Button>
            </div>
          </div>

          <TabsContent value="list" className="space-y-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead className="w-[80px]">Logo</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("name")}>
                        <div className="flex items-center">
                          Tên thương hiệu
                          {sortColumn === "name" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead>Mô tả</TableHead>
                      <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                        <div className="flex items-center">
                          Ngày tạo
                          {sortColumn === "created_at" && (
                            <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-8" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-10 w-10 rounded-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-48" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-8 w-16 ml-auto" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : error ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-red-500">
                          Lỗi khi tải dữ liệu: {error instanceof Error ? error.message : "Unknown error"}
                        </TableCell>
                      </TableRow>
                    ) : brandsData?.data?.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center">
                          Không có thương hiệu nào. Hãy thêm thương hiệu mới.
                        </TableCell>
                      </TableRow>
                    ) : (
                      brandsData?.data?.map((brand: any) => (
                        <TableRow key={brand.id}>
                          <TableCell>{brand.id}</TableCell>
                          <TableCell>
                            <Avatar className="h-10 w-10">
                              {brand.logo_url ? <AvatarImage src={brand.logo_url} alt={brand.name} /> : null}
                              <AvatarFallback>{brand.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                          </TableCell>
                          <TableCell className="font-medium">{brand.name}</TableCell>
                          <TableCell className="max-w-xs truncate">{brand.description || "—"}</TableCell>
                          <TableCell>{formatDate(brand.created_at)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Mở menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEdit(brand)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-destructive focus:text-destructive"
                                  onClick={() => handleDelete(brand)}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Xóa
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Pagination */}
            {!isLoading && brandsData?.data?.length > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {generatePaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </TabsContent>

          <TabsContent value="grid" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <Card key={index} className="overflow-hidden">
                    <div className="aspect-square bg-muted flex items-center justify-center">
                      <Skeleton className="h-16  w-16 rounded-full" />
                    </div>
                    <CardContent className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3 mt-1" />
                    </CardContent>
                  </Card>
                ))
              ) : error ? (
                <div className="col-span-full text-center text-red-500">
                  Lỗi khi tải dữ liệu: {error instanceof Error ? error.message : "Unknown error"}
                </div>
              ) : brandsData?.data?.length === 0 ? (
                <div className="col-span-full text-center">Không có thương hiệu nào. Hãy thêm thương hiệu mới.</div>
              ) : (
                brandsData?.data?.map((brand: any) => (
                  <Card key={brand.id} className="overflow-hidden">
                    <div className="aspect-square bg-muted flex items-center justify-center p-6">
                      {brand.logo_url ? (
                        <img
                          src={brand.logo_url || "/placeholder.svg"}
                          alt={brand.name}
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-4xl font-bold text-primary">
                          {brand.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold truncate">{brand.name}</h3>
                        <Badge variant="outline">ID: {brand.id}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 h-10">
                        {brand.description || "Không có mô tả"}
                      </p>
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-xs text-muted-foreground">{formatDate(brand.created_at)}</span>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(brand)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Chỉnh sửa</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(brand)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Xóa</span>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Pagination for grid view */}
            {!isLoading && brandsData?.data?.length > 0 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                      aria-disabled={currentPage === 1}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>

                  {generatePaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                      aria-disabled={currentPage === totalPages}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Brand Dialog */}
      <BrandDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} mode="create" />

      {/* Edit Brand Dialog */}
      {selectedBrand && (
        <BrandDialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen} mode="edit" brand={selectedBrand} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này sẽ xóa thương hiệu "{selectedBrand?.name}" và không thể hoàn tác.
              {selectedBrand?.product_count > 0 && (
                <span className="text-destructive font-medium block mt-2">
                  Cảnh báo: Thương hiệu này đang được sử dụng bởi {selectedBrand.product_count} sản phẩm. Việc xóa có
                  thể ảnh hưởng đến dữ liệu liên quan.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xóa...
                </>
              ) : (
                "Xóa"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
