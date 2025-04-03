"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ProductLabelProductsProps {
  labelId: string
  labelName: string
}

// Mock data
const products = [
  {
    id: "1",
    name: "Chanel Coco Mademoiselle",
    sku: "CHAN-COCO-100",
    image: "/placeholder.svg?height=50&width=50",
    valid_until: "2023-12-31",
  },
  {
    id: "3",
    name: "Gucci Bloom",
    sku: "GUCC-BLOM-100",
    image: "/placeholder.svg?height=50&width=50",
    valid_until: null,
  },
]

export function ProductLabelProducts({ labelId, labelName }: ProductLabelProductsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.sku.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Xem sản phẩm ({products.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Sản phẩm có nhãn "{labelName}"</DialogTitle>
          <DialogDescription>Danh sách các sản phẩm được gắn nhãn {labelName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Tìm sản phẩm..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <ScrollArea className="h-[400px] border rounded-md">
            <div className="p-2 space-y-2">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">Không tìm thấy sản phẩm</div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <div className="flex items-center space-x-3">
                      <img
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        className="h-10 w-10 rounded-md object-cover"
                      />
                      <div>
                        <div>{product.name}</div>
                        <div className="text-xs text-muted-foreground">SKU: {product.sku}</div>
                        {product.valid_until && (
                          <div className="text-xs text-muted-foreground">
                            Hiệu lực đến: {new Date(product.valid_until).toLocaleDateString("vi-VN")}
                          </div>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/san-pham/${product.id}`}>
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Xem sản phẩm</span>
                      </Link>
                    </Button>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}

