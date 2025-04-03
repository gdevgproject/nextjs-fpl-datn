"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Save, Upload, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { FormDescription, FormLabel } from "@/components/ui/form"
import type { Brand } from "@/types/san-pham"

interface BrandFormProps {
  brandId?: string
}

export function BrandForm({ brandId }: BrandFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Dữ liệu mẫu cho thương hiệu
  const sampleBrands: Brand[] = [
    {
      id: "1",
      name: "Chanel",
      slug: "chanel",
      description: "Thương hiệu nước hoa cao cấp từ Pháp",
      logo_url: "/placeholder.svg?height=200&width=200",
      created_at: "2023-01-01T00:00:00Z",
    },
    {
      id: "2",
      name: "Dior",
      slug: "dior",
      description: "Thương hiệu nước hoa cao cấp từ Pháp",
      logo_url: "/placeholder.svg?height=200&width=200",
      created_at: "2023-01-01T00:00:00Z",
    },
  ]

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logo_url: "",
  })

  useEffect(() => {
    if (brandId) {
      // Giả lập việc lấy dữ liệu từ API
      const brand = sampleBrands.find((b) => b.id === brandId)
      if (brand) {
        setFormData({
          name: brand.name,
          description: brand.description || "",
          logo_url: brand.logo_url || "",
        })
        setLogoPreview(brand.logo_url || null)
      }
    }
  }, [brandId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Giả lập việc gửi dữ liệu lên API
      console.log("Dữ liệu gửi đi:", formData)

      // Chuyển hướng về trang danh sách thương hiệu
      setTimeout(() => {
        router.push("/admin/thuong-hieu")
      }, 1000)
    } catch (error) {
      console.error("Lỗi khi lưu thương hiệu:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const result = event.target?.result as string
        setLogoPreview(result)
        // Trong thực tế, bạn sẽ upload file lên Supabase Storage
        // và lưu URL vào formData
        setFormData((prev) => ({ ...prev, logo_url: result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveLogo = () => {
    setLogoPreview(null)
    setFormData((prev) => ({ ...prev, logo_url: "" }))
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Thông tin thương hiệu</CardTitle>
          <CardDescription>Nhập thông tin chi tiết cho thương hiệu sản phẩm</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <FormLabel htmlFor="name">Tên thương hiệu</FormLabel>
              <Input
                id="name"
                name="name"
                placeholder="Nhập tên thương hiệu"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <FormDescription>Tên hiển thị của thương hiệu trên website</FormDescription>
            </div>

            <div className="space-y-2">
              <FormLabel>Logo thương hiệu</FormLabel>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-md border">
                    <Image src={logoPreview || "/placeholder.svg"} alt="Logo preview" fill className="object-cover" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-1 top-1 h-6 w-6"
                      onClick={handleRemoveLogo}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-md border border-dashed">
                    <span className="text-sm text-gray-500">Chưa có logo</span>
                  </div>
                )}

                <div>
                  <Input id="logo" type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                  <Button type="button" variant="outline" onClick={() => document.getElementById("logo")?.click()}>
                    <Upload className="mr-2 h-4 w-4" />
                    {logoPreview ? "Thay đổi logo" : "Tải lên logo"}
                  </Button>
                </div>
              </div>
              <FormDescription>Logo thương hiệu nên có kích thước vuông và nền trong suốt</FormDescription>
            </div>
          </div>

          <div className="space-y-2">
            <FormLabel htmlFor="description">Mô tả</FormLabel>
            <Textarea
              id="description"
              name="description"
              placeholder="Nhập mô tả cho thương hiệu"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
            <FormDescription>Mô tả ngắn gọn về thương hiệu này</FormDescription>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/thuong-hieu")}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              "Đang lưu..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thương hiệu
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

