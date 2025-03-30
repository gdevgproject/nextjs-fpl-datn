"use client"

import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProductCompareTableProps {
  products: {
    id: number
    name: string
    brand: string
    specifications: {
      concentration: string
      releaseYear: number
      gender: string
      style: string
      sillage: string
      longevity: string
      topNotes: string[]
      middleNotes: string[]
      baseNotes: string[]
    }
    variants: {
      volume: number
      price: number
      salePrice: number | null
    }[]
  }[]
  activeFeature: string | null
}

export function ProductCompareTable({ products, activeFeature }: ProductCompareTableProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(["basic", "performance", "scent", "price"])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const isSectionExpanded = (section: string) => {
    return expandedSections.includes(section)
  }

  if (products.length === 0) return null

  return (
    <div className="mt-8 overflow-x-auto">
      <table className="w-full border-collapse min-w-[640px]">
        <thead>
          <tr className="bg-muted">
            <th className="p-4 text-left font-medium w-1/5">Thông số</th>
            {products.map((product) => (
              <th key={product.id} className="p-4 text-left font-medium">
                {product.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Thông tin cơ bản */}
          <tr className="bg-muted/50">
            <td colSpan={products.length + 1} className="p-4">
              <Button
                variant="ghost"
                className="font-medium p-0 h-auto flex items-center"
                onClick={() => toggleSection("basic")}
              >
                Thông tin cơ bản
                {isSectionExpanded("basic") ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </td>
          </tr>

          {isSectionExpanded("basic") && (
            <>
              <tr className={cn("border-b", activeFeature === "brand" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Thương hiệu</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.brand}
                  </td>
                ))}
              </tr>
              <tr className={cn("border-b", activeFeature === "concentration" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Nồng độ</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.specifications.concentration}
                  </td>
                ))}
              </tr>
              <tr className={cn("border-b", activeFeature === "releaseYear" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Năm phát hành</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.specifications.releaseYear}
                  </td>
                ))}
              </tr>
              <tr className={cn("border-b", activeFeature === "gender" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Giới tính</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.specifications.gender}
                  </td>
                ))}
              </tr>
              <tr className={cn("border-b", activeFeature === "style" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Phong cách</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.specifications.style}
                  </td>
                ))}
              </tr>
            </>
          )}

          {/* Hiệu suất */}
          <tr className="bg-muted/50">
            <td colSpan={products.length + 1} className="p-4">
              <Button
                variant="ghost"
                className="font-medium p-0 h-auto flex items-center"
                onClick={() => toggleSection("performance")}
              >
                Hiệu suất
                {isSectionExpanded("performance") ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </td>
          </tr>

          {isSectionExpanded("performance") && (
            <>
              <tr className={cn("border-b", activeFeature === "sillage" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Độ tỏa hương</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.specifications.sillage}
                  </td>
                ))}
              </tr>
              <tr className={cn("border-b", activeFeature === "longevity" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Độ lưu hương</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.specifications.longevity}
                  </td>
                ))}
              </tr>
            </>
          )}

          {/* Mùi hương */}
          <tr className="bg-muted/50">
            <td colSpan={products.length + 1} className="p-4">
              <Button
                variant="ghost"
                className="font-medium p-0 h-auto flex items-center"
                onClick={() => toggleSection("scent")}
              >
                Mùi hương
                {isSectionExpanded("scent") ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </td>
          </tr>

          {isSectionExpanded("scent") && (
            <>
              <tr className={cn("border-b", activeFeature === "topNotes" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Hương đầu</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.specifications.topNotes.join(", ")}
                  </td>
                ))}
              </tr>
              <tr className={cn("border-b", activeFeature === "middleNotes" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Hương giữa</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.specifications.middleNotes.join(", ")}
                  </td>
                ))}
              </tr>
              <tr className={cn("border-b", activeFeature === "baseNotes" && "bg-primary/5")}>
                <td className="p-4 text-muted-foreground">Hương cuối</td>
                {products.map((product) => (
                  <td key={product.id} className="p-4">
                    {product.specifications.baseNotes.join(", ")}
                  </td>
                ))}
              </tr>
            </>
          )}

          {/* Giá các  ")}
                  </td>
                ))}
              </tr>
            </>
          )}

          {/* Giá các dung tích */}
          <tr className="bg-muted/50">
            <td colSpan={products.length + 1} className="p-4">
              <Button
                variant="ghost"
                className="font-medium p-0 h-auto flex items-center"
                onClick={() => toggleSection("price")}
              >
                Giá các dung tích
                {isSectionExpanded("price") ? (
                  <ChevronUp className="ml-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </td>
          </tr>

          {isSectionExpanded("price") && (
            <>
              {[...new Set(products.flatMap((p) => p.variants.map((v) => v.volume)))]
                .sort((a, b) => a - b)
                .map((volume) => (
                  <tr key={volume} className={cn("border-b", activeFeature === `volume-${volume}` && "bg-primary/5")}>
                    <td className="p-4 text-muted-foreground">{volume}ml</td>
                    {products.map((product) => {
                      const variant = product.variants.find((v) => v.volume === volume)
                      return (
                        <td key={product.id} className="p-4">
                          {variant ? (
                            variant.salePrice ? (
                              <div>
                                <span className="font-medium">{formatCurrency(variant.salePrice)}</span>
                                <span className="text-sm text-muted-foreground line-through ml-2">
                                  {formatCurrency(variant.price)}
                                </span>
                              </div>
                            ) : (
                              formatCurrency(variant.price)
                            )
                          ) : (
                            <span className="text-muted-foreground">Không có</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}

