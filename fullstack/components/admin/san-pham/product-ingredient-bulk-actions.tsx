"use client"

import { Trash2, X } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface ProductIngredientBulkActionsProps {
  count: number
  onDelete: () => void
  onClearSelection: () => void
}

export function ProductIngredientBulkActions({ count, onDelete, onClearSelection }: ProductIngredientBulkActionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Đã chọn {count} thành phần</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClearSelection}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="destructive" size="sm" onClick={onDelete} className="h-8">
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa đã chọn
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

