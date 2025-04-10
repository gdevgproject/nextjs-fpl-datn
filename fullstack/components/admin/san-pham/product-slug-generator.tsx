"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { RefreshCw, Copy, Check, Edit2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"

interface ProductSlugGeneratorProps {
  productName: string
  initialSlug?: string
  onChange?: (slug: string) => void
}

export function ProductSlugGenerator({ productName, initialSlug, onChange }: ProductSlugGeneratorProps) {
  const [slug, setSlug] = useState(initialSlug || "")
  const [isEditing, setIsEditing] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [isAutoGenerated, setIsAutoGenerated] = useState(!initialSlug)
  const { toast } = useToast()

  // Tự động tạo slug từ tên sản phẩm
  useEffect(() => {
    if (isAutoGenerated && productName) {
      const generatedSlug = generateSlug(productName)
      setSlug(generatedSlug)
      if (onChange) onChange(generatedSlug)
    }
  }, [productName, isAutoGenerated, onChange])

  // Hàm tạo slug từ chuỗi
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  // Xử lý khi thay đổi slug
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSlug = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")

    setSlug(newSlug)
    if (onChange) onChange(newSlug)
  }

  // Xử lý khi tạo lại slug
  const handleRegenerateSlug = () => {
    if (!productName) return

    const newSlug = generateSlug(productName)
    setSlug(newSlug)
    if (onChange) onChange(newSlug)

    toast({
      title: "Đã tạo lại slug",
      description: `Slug đã được tạo lại từ tên sản phẩm: ${newSlug}`,
    })
  }

  // Xử lý khi sao chép slug
  const handleCopySlug = () => {
    navigator.clipboard.writeText(slug)
    setIsCopied(true)

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)

    toast({
      title: "Đã sao chép",
      description: "Slug đã được sao chép vào clipboard",
    })
  }

  // Xử lý khi bắt đầu chỉnh sửa slug
  const handleStartEditing = () => {
    setIsEditing(true)
    setIsAutoGenerated(false)
  }

  // Xử lý khi kết thúc chỉnh sửa slug
  const handleFinishEditing = () => {
    setIsEditing(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor="slug">Slug URL</Label>
        <div className="flex items-center space-x-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setIsAutoGenerated(!isAutoGenerated)}
                >
                  <input type="checkbox" checked={isAutoGenerated} onChange={() => {}} className="h-4 w-4" />
                  <span className="sr-only">Tự động tạo</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isAutoGenerated ? "Tắt tự động tạo slug từ tên sản phẩm" : "Bật tự động tạo slug từ tên sản phẩm"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <span className="text-xs text-muted-foreground">Tự động</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">/san-pham/</span>
          <Input
            id="slug"
            value={slug}
            onChange={handleSlugChange}
            className={`pl-[5.5rem] ${isEditing ? "" : "pr-20"}`}
            placeholder="ten-san-pham"
            readOnly={!isEditing && !isAutoGenerated}
          />
          {!isEditing && !isAutoGenerated && (
            <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleStartEditing}>
                      <Edit2 className="h-3.5 w-3.5" />
                      <span className="sr-only">Chỉnh sửa</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Chỉnh sửa slug</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopySlug}>
                      {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                      <span className="sr-only">Sao chép</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Sao chép slug</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {isEditing ? (
          <Button type="button" variant="outline" size="sm" onClick={handleFinishEditing}>
            Xong
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRegenerateSlug}
                  disabled={isAutoGenerated || !productName}
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Tạo lại</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tạo lại slug từ tên sản phẩm</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Slug sẽ được sử dụng trong URL của sản phẩm: https://mybeauty.vn/san-pham/{slug}
      </p>
    </div>
  )
}

