"use client"

import { useState } from "react"
import { Edit, Trash2, Info } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ProductScent {
  id: string
  scent_id: string
  scent_name: string
  scent_type: "top" | "middle" | "base"
  intensity?: number
}

interface ProductScentPyramidProps {
  scents: ProductScent[]
  onEdit?: (scent: ProductScent) => void
  onDelete?: (scent: ProductScent) => void
}

export function ProductScentPyramid({ scents, onEdit, onDelete }: ProductScentPyramidProps) {
  const [hoveredScent, setHoveredScent] = useState<string | null>(null)

  // Lọc hương thơm theo loại
  const topScents = scents.filter((s) => s.scent_type === "top")
  const middleScents = scents.filter((s) => s.scent_type === "middle")
  const baseScents = scents.filter((s) => s.scent_type === "base")

  // Tính toán màu sắc dựa trên cường độ
  const getIntensityColor = (intensity = 3) => {
    const colors = ["bg-primary/20", "bg-primary/30", "bg-primary/40", "bg-primary/50", "bg-primary/60"]
    return colors[Math.min(intensity - 1, 4)]
  }

  // Tính toán kích thước dựa trên số lượng hương thơm
  const getLayerSize = (type: "top" | "middle" | "base") => {
    const count = type === "top" ? topScents.length : type === "middle" ? middleScents.length : baseScents.length
    const baseSize = type === "top" ? 60 : type === "middle" ? 80 : 100
    return `${baseSize}%`
  }

  return (
    <div className="w-full flex flex-col items-center space-y-6 py-4">
      {/* Mô tả tháp hương */}
      <div className="text-center max-w-md">
        <h3 className="text-sm font-medium mb-1">Tháp hương (Scent Pyramid)</h3>
        <p className="text-sm text-muted-foreground">
          Tháp hương thể hiện cách các mùi hương phát triển theo thời gian khi sử dụng nước hoa
        </p>
      </div>

      {/* Tháp hương */}
      <div className="w-full max-w-md aspect-[3/4] relative">
        {/* Hương đầu */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2" style={{ width: getLayerSize("top") }}>
          <div className="relative bg-primary/10 rounded-t-full pt-6 pb-4 px-4">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <Badge variant="default" className="mb-2">
                Hương đầu
              </Badge>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <AnimatePresence>
                {topScents.map((scent) => (
                  <motion.div
                    key={scent.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    className={`relative rounded-full px-3 py-1 text-xs font-medium ${getIntensityColor(scent.intensity)} cursor-pointer`}
                    onMouseEnter={() => setHoveredScent(scent.id)}
                    onMouseLeave={() => setHoveredScent(null)}
                  >
                    {scent.scent_name}

                    {hoveredScent === scent.id && (onEdit || onDelete) && (
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {onEdit && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => onEdit(scent)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => onDelete(scent)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {topScents.length === 0 && (
                <div className="text-xs text-muted-foreground italic py-2">Chưa có hương đầu</div>
              )}
            </div>
          </div>
        </div>

        {/* Hương giữa */}
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2" style={{ width: getLayerSize("middle") }}>
          <div className="relative bg-secondary/20 py-6 px-4">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary" className="mb-2">
                Hương giữa
              </Badge>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <AnimatePresence>
                {middleScents.map((scent) => (
                  <motion.div
                    key={scent.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    className={`relative rounded-full px-3 py-1 text-xs font-medium ${getIntensityColor(scent.intensity)} cursor-pointer`}
                    onMouseEnter={() => setHoveredScent(scent.id)}
                    onMouseLeave={() => setHoveredScent(null)}
                  >
                    {scent.scent_name}

                    {hoveredScent === scent.id && (onEdit || onDelete) && (
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {onEdit && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => onEdit(scent)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => onDelete(scent)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {middleScents.length === 0 && (
                <div className="text-xs text-muted-foreground italic py-2">Chưa có hương giữa</div>
              )}
            </div>
          </div>
        </div>

        {/* Hương cuối */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2" style={{ width: getLayerSize("base") }}>
          <div className="relative bg-accent/30 rounded-b-full py-6 px-4">
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
              <Badge variant="outline" className="mb-2">
                Hương cuối
              </Badge>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              <AnimatePresence>
                {baseScents.map((scent) => (
                  <motion.div
                    key={scent.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    whileHover={{ scale: 1.05 }}
                    className={`relative rounded-full px-3 py-1 text-xs font-medium ${getIntensityColor(scent.intensity)} cursor-pointer`}
                    onMouseEnter={() => setHoveredScent(scent.id)}
                    onMouseLeave={() => setHoveredScent(null)}
                  >
                    {scent.scent_name}

                    {hoveredScent === scent.id && (onEdit || onDelete) && (
                      <div className="absolute -top-2 -right-2 flex gap-1">
                        {onEdit && (
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => onEdit(scent)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="destructive"
                            size="icon"
                            className="h-6 w-6 rounded-full"
                            onClick={() => onDelete(scent)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {baseScents.length === 0 && (
                <div className="text-xs text-muted-foreground italic py-2">Chưa có hương cuối</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chú thích */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1">
              <Info className="h-4 w-4" />
              <span className="text-xs">Thông tin về tháp hương</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2 text-sm">
              <p>
                <strong>Hương đầu:</strong> Cảm nhận ngay khi xịt, tồn tại trong 15-30 phút đầu tiên.
              </p>
              <p>
                <strong>Hương giữa:</strong> Xuất hiện sau khi hương đầu tan, kéo dài 2-4 giờ.
              </p>
              <p>
                <strong>Hương cuối:</strong> Lưu lại lâu nhất, có thể kéo dài 6-12 giờ hoặc hơn.
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}

