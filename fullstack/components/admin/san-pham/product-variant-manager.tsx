"use client"

import { useState, useEffect } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import { Plus, Copy, ArrowUpDown, BarChart3, Settings, AlertCircle, Layers } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ProductVariantForm } from "./product-variant-form"
import { ProductVariantBulkActions } from "./product-variant-bulk-actions"
import { ProductVariantStockChart } from "./product-variant-stock-chart"

interface ProductVariant {
  id: string
  volume_ml: number
  price: number
  sale_price: number | null
  sku: string
  stock_quantity: number
  is_default?: boolean
}

interface ProductVariantManagerProps {
  productId?: string
  productName?: string
  initialVariants?: ProductVariant[]
  onChange?: (variants: ProductVariant[]) => void
}

export function ProductVariantManager({
  productId,
  productName = "Sản phẩm mới",
  initialVariants = [],
  onChange,
}: ProductVariantManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>(initialVariants)
  const [selectedVariants, setSelectedVariants] = useState<string[]>([])
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isStockChartOpen, setIsStockChartOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [sortField, setSortField] = useState<keyof ProductVariant>("volume_ml")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [searchQuery, setSearchQuery] = useState("")

  const isDesktop = useMediaQuery("(min-width: 768px)")
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Cập nhật variants khi có thay đổi
  useEffect(() => {
    if (onChange) {
      onChange(variants)
    }
  }, [variants, onChange])

  // Thêm biến thể mới
  const handleAddVariant = (variant: Omit<ProductVariant, "id">) => {
    const newVariant: ProductVariant = {
      ...variant,
      id: `temp-${Date.now()}`,
    }

    setVariants([...variants, newVariant])
    setIsAddDialogOpen(false)
  }

  // Cập nhật biến thể
  const handleUpdateVariant = (updatedVariant: ProductVariant) => {
    setVariants(variants.map((v) => (v.id === updatedVariant.id ? updatedVariant : v)))
    setIsEditDialogOpen(false)
    setEditingVariant(null)
  }

  // Xóa biến thể
  const handleDeleteVariant = (id: string) => {
    setVariants(variants.filter((v) => v.id !== id))
    setIsDeleteDialogOpen(false)
  }

  // Xóa nhiều biến thể
  const handleDeleteSelectedVariants = () => {
    setVariants(variants.filter((v) => !selectedVariants.includes(v.id)))
    setSelectedVariants([])
  }

  // Sao chép biến thể
  const handleDuplicateVariant = (variant: ProductVariant) => {
    const newVariant: ProductVariant = {
      ...variant,
      id: `temp-${Date.now()}`,
      sku: `${variant.sku}-copy`,
      is_default: false,
    }

    setVariants([...variants, newVariant])
  }

  // Đặt biến thể mặc định
  const handleSetDefaultVariant = (id: string) => {
    setVariants(
      variants.map((v) => ({
        ...v,
        is_default: v.id === id,
      })),
    )
  }

  // Chọn/bỏ chọn tất cả biến thể
  const handleSelectAll = (selected: boolean) => {
    if (selected) {
      setSelectedVariants(filteredVariants.map((v) => v.id))
    } else {
      setSelectedVariants([])
    }
  }

  // Chọn/bỏ chọn một biến thể
  const handleSelectVariant = (id: string, selected: boolean) => {
    if (selected) {
      setSelectedVariants([...selectedVariants, id])
    } else {
      setSelectedVariants(selectedVariants.filter((v) => v !== id))
    }
  }

  // Sắp xếp biến thể
  const handleSort = (field: keyof ProductVariant) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Lọc biến thể theo tab
  const getFilteredVariantsByTab = () => {
    switch (activeTab) {
      case "low-stock":
        return variants.filter((v) => v.stock_quantity <= 10)
      case "out-of-stock":
        return variants.filter((v) => v.stock_quantity === 0)
      case "on-sale":
        return variants.filter((v) => v.sale_price !== null)
      default:
        return variants
    }
  }

  // Lọc biến thể theo tìm kiếm
  const filteredVariants = getFilteredVariantsByTab().filter((v) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      v.sku.toLowerCase().includes(query) ||
      v.volume_ml.toString().includes(query) ||
      v.price.toString().includes(query)
    )
  })

  // Sắp xếp biến thể
  const sortedVariants = [...filteredVariants].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue === null) return sortDirection === "asc" ? 1 : -1
    if (bValue === null) return sortDirection === "asc" ? -1 : 1

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1

    return 0
  })

  // Format giá tiền
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  // Tính phần trăm giảm giá
  const calculateDiscountPercentage = (price: number, salePrice: number) => {
    return Math.round(((price - salePrice) / price) * 100)
  }

  // Tạo mã SKU tự động
  const generateSku = (volumeMl: number) => {
    if (!productName) return ""

    // Tạo mã từ tên sản phẩm
    const nameCode = productName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]/g, "")
      .toUpperCase()
      .substring(0, 3)

    // Thêm dung tích
    return `${nameCode}-${volumeMl}ML`
  }

  // Tính tổng số lượng tồn kho
  const totalStock = variants.reduce((sum, variant) => sum + variant.stock_quantity, 0)

  // Tính giá trị tồn kho
  const totalStockValue = variants.reduce((sum, variant) => {
    const price = variant.sale_price !== null ? variant.sale_price : variant.price
    return sum + price * variant.stock_quantity
  }, 0)

  // Tính số lượng biến thể đang giảm giá
  const onSaleCount = variants.filter((v) => v.sale_price !== null).length

  // Tính số lượng biến thể sắp hết hàng
  const lowStockCount = variants.filter((v) => v.stock_quantity > 0 && v.stock_quantity <= 10).length

  // Tính số lượng biến thể hết hàng
  const outOfStockCount = variants.filter((v) => v.stock_quantity === 0).length

  // Render bảng biến thể cho desktop
  const renderDesktopTable = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300"
              checked={filteredVariants.length > 0 && selectedVariants.length === filteredVariants.length}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
          </TableHead>
          <TableHead className="w-[100px] cursor-pointer" onClick={() => handleSort("volume_ml")}>
            <div className="flex items-center">
              Dung tích (ml)
              {sortField === "volume_ml" && (
                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("price")}>
            <div className="flex items-center">
              Giá
              {sortField === "price" && (
                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </div>
          </TableHead>
          <TableHead>Giá khuyến mãi</TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("sku")}>
            <div className="flex items-center">
              Mã SKU
              {sortField === "sku" && (
                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </div>
          </TableHead>
          <TableHead className="cursor-pointer" onClick={() => handleSort("stock_quantity")}>
            <div className="flex items-center">
              Tồn kho
              {sortField === "stock_quantity" && (
                <ArrowUpDown className={`ml-1 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
              )}
            </div>
          </TableHead>
          <TableHead className="text-right">Thao tác</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedVariants.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              Chưa có biến thể nào. Hãy thêm biến thể đầu tiên.
            </TableCell>
          </TableRow>
        ) : (
          sortedVariants.map((variant) => (
            <TableRow key={variant.id}>
              <TableCell>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedVariants.includes(variant.id)}
                  onChange={(e) => handleSelectVariant(variant.id, e.target.checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {variant.volume_ml}
                  {variant.is_default && (
                    <Badge variant="outline" className="ml-2">
                      Mặc định
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatPrice(variant.price)}</TableCell>
              <TableCell>
                {variant.sale_price ? (
                  <div className="flex flex-col">
                    <span className="text-red-600">{formatPrice(variant.sale_price)}</span>
                    <span className="text-xs text-muted-foreground">
                      Giảm {calculateDiscountPercentage(variant.price, variant.sale_price)}%
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Không có</span>
                )}
              </TableCell>
              <TableCell>{variant.sku}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <span
                    className={`mr-2 ${variant.stock_quantity === 0 ? "text-red-600" : variant.stock_quantity <= 10 ? "text-amber-600" : ""}`}
                  >
                    {variant.stock_quantity}
                  </span>
                  {variant.stock_quantity === 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Hết hàng
                    </Badge>
                  )}
                  {variant.stock_quantity > 0 && variant.stock_quantity <= 10 && (
                    <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                      Sắp hết
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-1">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingVariant(variant)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Chỉnh sửa</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => handleDuplicateVariant(variant)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Sao chép</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!variant.is_default && (
                        <DropdownMenuItem onClick={() => handleSetDefaultVariant(variant.id)}>
                          Đặt làm mặc định
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem
                        onClick={() => {
                          setEditingVariant(variant)
                          setIsDeleteDialogOpen(true)
                        }}
                      >
                        Xóa biến thể
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )

  // Render danh sách biến thể cho mobile
  const renderMobileList = () => (
    <div className="space-y-4">
      {sortedVariants.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Chưa có biến thể nào. Hãy thêm biến thể đầu tiên.</div>
      ) : (
        sortedVariants.map((variant) => (
          <Card key={variant.id} className="overflow-hidden">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedVariants.includes(variant.id)}
                  onChange={(e) => handleSelectVariant(variant.id, e.target.checked)}
                />
                <div>
                  <div className="font-medium">{variant.volume_ml} ml</div>
                  <div className="text-xs text-muted-foreground">{variant.sku}</div>
                </div>
                {variant.is_default && (
                  <Badge variant="outline" className="ml-2">
                    Mặc định
                  </Badge>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingVariant(variant)
                      setIsEditDialogOpen(true)
                    }}
                  >
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDuplicateVariant(variant)}>Sao chép</DropdownMenuItem>
                  {!variant.is_default && (
                    <DropdownMenuItem onClick={() => handleSetDefaultVariant(variant.id)}>
                      Đặt làm mặc định
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem
                    onClick={() => {
                      setEditingVariant(variant)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    Xóa biến thể
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-sm text-muted-foreground">Giá</div>
                  <div>{formatPrice(variant.price)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Giá khuyến mãi</div>
                  {variant.sale_price ? (
                    <div className="flex flex-col">
                      <span className="text-red-600">{formatPrice(variant.sale_price)}</span>
                      <span className="text-xs text-muted-foreground">
                        Giảm {calculateDiscountPercentage(variant.price, variant.sale_price)}%
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Không có</span>
                  )}
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Tồn kho</div>
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${variant.stock_quantity === 0 ? "text-red-600" : variant.stock_quantity <= 10 ? "text-amber-600" : ""}`}
                    >
                      {variant.stock_quantity}
                    </span>
                    {variant.stock_quantity === 0 && (
                      <Badge variant="destructive" className="text-xs">
                        Hết hàng
                      </Badge>
                    )}
                    {variant.stock_quantity > 0 && variant.stock_quantity <= 10 && (
                      <Badge variant="outline" className="text-xs text-amber-600 border-amber-600">
                        Sắp hết
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="mr-2 h-5 w-5" />
            Biến thể sản phẩm
          </CardTitle>
          <CardDescription>Quản lý các biến thể khác nhau của sản phẩm (dung tích, giá, tồn kho)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Thống kê tổng quan */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Tổng biến thể</div>
                <div className="text-2xl font-bold">{variants.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Tổng tồn kho</div>
                <div className="text-2xl font-bold">{totalStock}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Giá trị tồn kho</div>
                <div className="text-2xl font-bold">{formatPrice(totalStockValue)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Đang giảm giá</div>
                <div className="text-2xl font-bold">{onSaleCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Cảnh báo nếu không có biến thể */}
          {variants.length === 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Chưa có biến thể</AlertTitle>
              <AlertDescription>
                Sản phẩm cần có ít nhất một biến thể để có thể bán được. Hãy thêm biến thể đầu tiên.
              </AlertDescription>
            </Alert>
          )}

          {/* Thanh công cụ */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="flex flex-1 items-center space-x-2">
              <Input
                placeholder="Tìm kiếm theo SKU, dung tích, giá..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-[300px]"
              />
              <Button variant="outline" size="icon" onClick={() => setIsStockChartOpen(true)}>
                <BarChart3 className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              {selectedVariants.length > 0 && (
                <ProductVariantBulkActions
                  selectedCount={selectedVariants.length}
                  onDelete={handleDeleteSelectedVariants}
                />
              )}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm biến thể
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Thêm biến thể mới</DialogTitle>
                    <DialogDescription>Nhập thông tin cho biến thể mới của sản phẩm</DialogDescription>
                  </DialogHeader>
                  <ProductVariantForm
                    productName={productName}
                    onSubmit={handleAddVariant}
                    onCancel={() => setIsAddDialogOpen(false)}
                    generateSku={generateSku}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all" className="relative">
                Tất cả
                <Badge className="ml-2">{variants.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="low-stock" className="relative">
                Sắp hết hàng
                {lowStockCount > 0 && (
                  <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                    {lowStockCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="out-of-stock" className="relative">
                Hết hàng
                {outOfStockCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {outOfStockCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="on-sale" className="relative">
                Đang giảm giá
                {onSaleCount > 0 && (
                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 hover:bg-green-100">
                    {onSaleCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-4">
              {isDesktop ? renderDesktopTable() : renderMobileList()}
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <div className="text-sm text-muted-foreground">
            Hiển thị {sortedVariants.length} / {variants.length} biến thể
          </div>
        </CardFooter>
      </Card>

      {/* Dialog chỉnh sửa biến  biến thể
          </div>
        </CardFooter>
      </Card>

      {/* Dialog chỉnh sửa biến thể */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa biến thể</DialogTitle>
            <DialogDescription>Cập nhật thông tin cho biến thể sản phẩm</DialogDescription>
          </DialogHeader>
          {editingVariant && (
            <ProductVariantForm
              productName={productName}
              initialData={editingVariant}
              onSubmit={handleUpdateVariant}
              onCancel={() => setIsEditDialogOpen(false)}
              generateSku={generateSku}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog xóa biến thể */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Xóa biến thể</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa biến thể này không?</DialogDescription>
          </DialogHeader>
          {editingVariant && (
            <>
              <div className="py-4">
                <div className="rounded-md bg-muted p-4">
                  <div className="flex items-center">
                    <div className="font-medium">{editingVariant.volume_ml} ml</div>
                    {editingVariant.is_default && (
                      <Badge variant="outline" className="ml-2">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">SKU: {editingVariant.sku}</div>
                  <div className="mt-1 text-sm">Giá: {formatPrice(editingVariant.price)}</div>
                  {editingVariant.sale_price && (
                    <div className="mt-1 text-sm text-red-600">
                      Giá khuyến mãi: {formatPrice(editingVariant.sale_price)}
                    </div>
                  )}
                  <div className="mt-1 text-sm">Tồn kho: {editingVariant.stock_quantity}</div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Hủy
                </Button>
                <Button variant="destructive" onClick={() => handleDeleteVariant(editingVariant.id)}>
                  Xóa biến thể
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog biểu đồ tồn kho */}
      <Dialog open={isStockChartOpen} onOpenChange={setIsStockChartOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Biểu đồ tồn kho</DialogTitle>
            <DialogDescription>Phân tích tồn kho theo dung tích sản phẩm</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <ProductVariantStockChart variants={variants} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

