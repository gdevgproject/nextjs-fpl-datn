"use client"

import { X, ExternalLink } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { useMediaQuery } from "@/hooks/use-media-query"

interface ProductIngredientDetailProps {
  ingredient: any
  onClose: () => void
}

export function ProductIngredientDetail({ ingredient, onClose }: ProductIngredientDetailProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")

  // Mẫu dữ liệu cho các loại thành phần
  const categoryMap: Record<string, { name: string; color: string }> = {
    alcohol: { name: "Cồn", color: "bg-red-100 text-red-800 border-red-200" },
    "essential-oils": { name: "Tinh dầu", color: "bg-green-100 text-green-800 border-green-200" },
    fixatives: { name: "Chất cố định", color: "bg-blue-100 text-blue-800 border-blue-200" },
    solvents: { name: "Dung môi", color: "bg-purple-100 text-purple-800 border-purple-200" },
    colorants: { name: "Chất màu", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    default: { name: "Khác", color: "bg-gray-100 text-gray-800 border-gray-200" },
  }

  const category = categoryMap[ingredient.category || "default"]

  // Mẫu dữ liệu chi tiết thành phần
  const ingredientDetails = {
    description: "Hợp chất hữu cơ tự nhiên có mùi chanh mạnh mẽ, được tìm thấy trong nhiều loại tinh dầu thực vật.",
    properties: [
      { name: "Mùi hương", value: "Chanh, cam quýt" },
      { name: "Độ bền", value: "Trung bình" },
      { name: "Nguồn gốc", value: "Tự nhiên" },
      { name: "Độ phổ biến", value: "Cao" },
    ],
    usages: ["Tạo hương đầu tươi mát", "Kết hợp tốt với các hương hoa", "Thường dùng trong nước hoa nam và unisex"],
    safetyInfo: "Có thể gây kích ứng da ở một số người. Nồng độ an toàn khuyến nghị: dưới 0.5%.",
    relatedIngredients: ["Limonene", "Citronellal", "Linalool"],
  }

  const renderContent = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">{ingredient.ingredient_name}</h3>
          <div className="flex items-center mt-1">
            <Badge variant="outline" className={`${category.color} font-normal`}>
              {category.name}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Mô tả</h4>
        <p className="text-sm text-muted-foreground">{ingredientDetails.description}</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Đặc tính</h4>
        <div className="grid grid-cols-2 gap-2">
          {ingredientDetails.properties.map((property, index) => (
            <div key={index} className="space-y-1">
              <p className="text-xs text-muted-foreground">{property.name}</p>
              <p className="text-sm">{property.value}</p>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Công dụng</h4>
        <ul className="text-sm space-y-1 list-disc list-inside">
          {ingredientDetails.usages.map((usage, index) => (
            <li key={index}>{usage}</li>
          ))}
        </ul>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Thông tin an toàn</h4>
        <p className="text-sm text-muted-foreground">{ingredientDetails.safetyInfo}</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Thành phần liên quan</h4>
        <div className="flex flex-wrap gap-2">
          {ingredientDetails.relatedIngredients.map((related, index) => (
            <Badge key={index} variant="outline">
              {related}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Chi tiết thành phần</DialogTitle>
            <DialogDescription>Thông tin chi tiết về thành phần {ingredient.ingredient_name}</DialogDescription>
          </DialogHeader>
          {renderContent()}
          <div className="flex justify-between mt-4">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button variant="outline" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Xem thêm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Chi tiết thành phần</CardTitle>
              <CardDescription>Thông tin chi tiết về thành phần {ingredient.ingredient_name}</CardDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>{renderContent()}</CardContent>
        <CardFooter className="flex justify-between border-t p-4">
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
          <Button variant="outline" className="gap-2">
            <ExternalLink className="h-4 w-4" />
            Xem thêm
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

