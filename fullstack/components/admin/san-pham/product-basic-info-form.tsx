"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ProductBasicInfoFormProps {
  productId?: string
  onProgressChange?: (progress: number) => void
  onProductNameChange?: (name: string) => void
}

export function ProductBasicInfoForm({ productId, onProgressChange, onProductNameChange }: ProductBasicInfoFormProps) {
  const [name, setName] = useState("")
  const [productCode, setProductCode] = useState("")
  const [shortDescription, setShortDescription] = useState("")
  const [longDescription, setLongDescription] = useState("")
  const [brand, setBrand] = useState("")

  // Simulate loading product data
  useEffect(() => {
    if (productId) {
      // In a real app, this would be an API call to get product data
      setTimeout(() => {
        if (productId === "1") {
          setName("Chanel No. 5")
          setProductCode("CHAN-5")
          setShortDescription("Iconic fragrance for women")
          setLongDescription(
            'Chanel No. 5 was the first perfume launched by French couturier Gabrielle "Coco" Chanel in 1921.',
          )
          setBrand("1") // Chanel brand ID
        } else if (productId === "2") {
          setName("Dior Sauvage")
          setProductCode("DIOR-S")
          setShortDescription("Fresh and sophisticated fragrance")
          setLongDescription("Dior Sauvage is a radically fresh composition that is raw and noble all at once.")
          setBrand("2") // Dior brand ID
        } else {
          setName("Sản phẩm #" + productId)
          setProductCode("PROD-" + productId)
          setShortDescription("Mô tả ngắn")
          setLongDescription("Mô tả chi tiết")
          setBrand("")
        }
      }, 500)
    }
  }, [productId])

  // Calculate form progress
  useEffect(() => {
    if (onProgressChange) {
      let progress = 0

      if (name) progress += 25
      if (productCode) progress += 25
      if (shortDescription) progress += 25
      if (brand) progress += 25

      onProgressChange(progress)
    }
  }, [name, productCode, shortDescription, brand, onProgressChange])

  // Update parent component with product name
  useEffect(() => {
    if (onProductNameChange && name) {
      onProductNameChange(name)
    }
  }, [name, onProductNameChange])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Thông tin cơ bản</CardTitle>
        <CardDescription>Nhập thông tin cơ bản cho sản phẩm. Các trường có dấu * là bắt buộc.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên sản phẩm <span className="text-destructive">*</span>
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nhập tên sản phẩm" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="product-code">
              Mã sản phẩm <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-code"
              value={productCode}
              onChange={(e) => setProductCode(e.target.value)}
              placeholder="Nhập mã sản phẩm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="short-description">
            Mô tả ngắn <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="short-description"
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            placeholder="Nhập mô tả ngắn cho sản phẩm"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="long-description">Mô tả chi tiết</Label>
          <Textarea
            id="long-description"
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            placeholder="Nhập mô tả chi tiết cho sản phẩm"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand">
            Thương hiệu <span className="text-destructive">*</span>
          </Label>
          <Select value={brand} onValueChange={setBrand}>
            <SelectTrigger id="brand">
              <SelectValue placeholder="Chọn thương hiệu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Chanel</SelectItem>
              <SelectItem value="2">Dior</SelectItem>
              <SelectItem value="3">Gucci</SelectItem>
              <SelectItem value="4">Versace</SelectItem>
              <SelectItem value="5">Calvin Klein</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}

