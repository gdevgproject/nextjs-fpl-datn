"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

interface ProductCompareFeatureProps {
  products: any[]
  activeFeature: string | null
  onFeatureClick: (feature: string) => void
}

export function ProductCompareFeatures({ products, activeFeature, onFeatureClick }: ProductCompareFeatureProps) {
  if (products.length < 2) return null

  // Tìm các điểm khác biệt giữa các sản phẩm
  const findDifferences = () => {
    const differences: Record<string, { name: string; values: string[] }> = {}

    // Thông tin cơ bản
    const basicInfo = [
      { key: "brand", name: "Thương hiệu" },
      { key: "specifications.concentration", name: "Nồng độ" },
      { key: "specifications.releaseYear", name: "Năm phát hành" },
      { key: "specifications.gender", name: "Giới tính" },
      { key: "specifications.style", name: "Phong cách" },
    ]

    basicInfo.forEach(({ key, name }) => {
      const values = new Set()
      products.forEach((product) => {
        const value = key.includes(".") ? product[key.split(".")[0]][key.split(".")[1]] : product[key]
        values.add(value)
      })

      if (values.size > 1) {
        differences[key.split(".")[1] || key] = {
          name,
          values: Array.from(values) as string[],
        }
      }
    })

    // Hiệu suất
    const performance = [
      { key: "specifications.sillage", name: "Độ tỏa hương" },
      { key: "specifications.longevity", name: "Độ lưu hương" },
    ]

    performance.forEach(({ key, name }) => {
      const values = new Set()
      products.forEach((product) => {
        const value = product[key.split(".")[0]][key.split(".")[1]]
        values.add(value)
      })

      if (values.size > 1) {
        differences[key.split(".")[1]] = {
          name,
          values: Array.from(values) as string[],
        }
      }
    })

    // Mùi hương
    const scent = [
      { key: "specifications.topNotes", name: "Hương đầu" },
      { key: "specifications.middleNotes", name: "Hương giữa" },
      { key: "specifications.baseNotes", name: "Hương cuối" },
    ]

    scent.forEach(({ key, name }) => {
      const allNotes = new Set<string>()
      const productNotes: Record<number, Set<string>> = {}

      // Collect all notes and notes per product
      products.forEach((product) => {
        const notes = product[key.split(".")[0]][key.split(".")[1]]
        productNotes[product.id] = new Set(notes)
        notes.forEach((note) => allNotes.add(note))
      })

      // Check if there are differences in notes
      let hasDifference = false
      allNotes.forEach((note) => {
        const productsWithNote = Object.values(productNotes).filter((notes) => notes.has(note))
        if (productsWithNote.length < products.length) {
          hasDifference = true
        }
      })

      if (hasDifference) {
        differences[key.split(".")[1]] = {
          name,
          values: Array.from(allNotes) as string[],
        }
      }
    })

    // Giá các dung tích
    const allVolumes = new Set<number>()
    products.forEach((product) => {
      product.variants.forEach((variant) => {
        allVolumes.add(variant.volume)
      })
    })

    allVolumes.forEach((volume) => {
      const prices = new Set()
      products.forEach((product) => {
        const variant = product.variants.find((v) => v.volume === volume)
        if (variant) {
          prices.add(variant.salePrice || variant.price)
        } else {
          prices.add("N/A")
        }
      })

      if (prices.size > 1) {
        differences[`volume-${volume}`] = {
          name: `Giá ${volume}ml`,
          values: Array.from(prices).map((p) => (p === "N/A" ? "Không có" : `${p} VND`)) as string[],
        }
      }
    })

    return differences
  }

  const differences = findDifferences()
  const differenceKeys = Object.keys(differences)

  if (differenceKeys.length === 0) return null

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Điểm khác biệt chính</h3>

      <ScrollArea className="w-full">
        <div className="flex flex-wrap gap-2 pb-4">
          {differenceKeys.map((key) => (
            <Button
              key={key}
              variant={activeFeature === key ? "default" : "outline"}
              size="sm"
              className={cn("rounded-full", activeFeature === key && "bg-primary text-primary-foreground")}
              onClick={() => onFeatureClick(key)}
            >
              {differences[key].name}
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {activeFeature && (
        <div className="p-4 border rounded-lg bg-muted/30">
          <h4 className="font-medium mb-2">{differences[activeFeature].name}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((product) => {
              let value: React.ReactNode = "Không có thông tin"

              if (activeFeature === "brand") {
                value = product.brand
              } else if (activeFeature.startsWith("volume-")) {
                const volume = Number.parseInt(activeFeature.split("-")[1])
                const variant = product.variants.find((v) => v.volume === volume)
                value = variant ? (
                  variant.salePrice ? (
                    <>
                      <span className="font-medium">{variant.salePrice.toLocaleString()} VND</span>{" "}
                      <span className="text-sm text-muted-foreground line-through">
                        {variant.price.toLocaleString()} VND
                      </span>
                    </>
                  ) : (
                    <span>{variant.price.toLocaleString()} VND</span>
                  )
                ) : (
                  "Không có"
                )
              } else if (["topNotes", "middleNotes", "baseNotes"].includes(activeFeature)) {
                value = (
                  <div className="flex flex-wrap gap-1">
                    {product.specifications[activeFeature].map((note: string, i: number) => (
                      <Badge key={i} variant="outline">
                        {note}
                      </Badge>
                    ))}
                  </div>
                )
              } else {
                value = product.specifications[activeFeature]
              }

              return (
                <div key={product.id} className="flex items-start gap-3 p-3 border rounded-md bg-background">
                  <div className="font-medium min-w-[100px]">{product.name}:</div>
                  <div>{value}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

