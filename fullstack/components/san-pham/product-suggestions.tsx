"use client"

import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"

export function ProductSuggestions() {
  // Giả lập dữ liệu sản phẩm gợi ý
  const products = [
    {
      id: "3",
      name: "Versace Eros",
      slug: "versace-eros",
      brand: "Versace",
      image: "/placeholder.svg?height=300&width=300",
      price: 2500000,
      salePrice: null,
    },
    {
      id: "4",
      name: "Dolce & Gabbana Light Blue",
      slug: "dolce-gabbana-light-blue",
      brand: "Dolce & Gabbana",
      image: "/placeholder.svg?height=300&width=300",
      price: 2200000,
      salePrice: 1980000,
    },
    {
      id: "5",
      name: "Gucci Bloom",
      slug: "gucci-bloom",
      brand: "Gucci",
      image: "/placeholder.svg?height=300&width=300",
      price: 2800000,
      salePrice: null,
    },
    {
      id: "6",
      name: "Yves Saint Laurent Black Opium",
      slug: "yves-saint-laurent-black-opium",
      brand: "Yves Saint Laurent",
      image: "/placeholder.svg?height=300&width=300",
      price: 3100000,
      salePrice: 2790000,
    },
  ]

  return (
    <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/san-pham/${product.slug}`}
          className="group rounded-lg border p-3 transition-all hover:shadow-md"
        >
          <div className="relative mb-3 aspect-square overflow-hidden rounded-md">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform group-hover:scale-105"
            />
            {product.salePrice && (
              <div className="absolute right-2 top-2 rounded-full bg-red-500 px-2 py-1 text-xs font-medium text-white">
                Giảm {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
              </div>
            )}
          </div>
          <div>
            <h3 className="font-medium group-hover:text-primary">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.brand}</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="font-medium">{formatCurrency(product.salePrice || product.price)}</span>
              {product.salePrice && (
                <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price)}</span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

