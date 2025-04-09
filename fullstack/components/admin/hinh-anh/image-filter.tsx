"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface ImageFilterProps {
  products: { id: string; name: string }[]
  selectedProduct: string | null
  onSelectProduct: (productId: string | null) => void
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ImageFilter({
  products,
  selectedProduct,
  onSelectProduct,
  searchQuery,
  onSearchChange,
}: ImageFilterProps) {
  const handleReset = () => {
    onSelectProduct(null)
    onSearchChange("")
  }

  return (
    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm hình ảnh..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="w-full sm:w-[200px]">
        <Select value={selectedProduct || ""} onValueChange={(value) => onSelectProduct(value || null)}>
          <SelectTrigger>
            <SelectValue placeholder="Lọc theo sản phẩm" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả sản phẩm</SelectItem>
            {products.map((product) => (
              <SelectItem key={product.id} value={product.id}>
                {product.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" onClick={handleReset} className="w-full sm:w-auto">
        Đặt lại
      </Button>
    </div>
  )
}

