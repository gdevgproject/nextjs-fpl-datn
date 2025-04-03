"use client"

import { useState } from "react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ProductLabelPreviewProps {
  labels: {
    id: string
    name: string
    color_code: string
    valid_until: Date | null
  }[]
  onClose: () => void
}

export function ProductLabelPreview({ labels, onClose }: ProductLabelPreviewProps) {
  const [view, setView] = useState("grid")

  // Kiểm tra nhãn còn hiệu lực
  const isLabelValid = (validUntil: Date | null) => {
    if (!validUntil) return true
    return new Date() <= validUntil
  }

  // Lọc nhãn còn hiệu lực
  const validLabels = labels.filter((label) => isLabelValid(label.valid_until))

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Xem trước nhãn sản phẩm</DialogTitle>
          <DialogDescription>Dưới đây là cách nhãn sẽ hiển thị trên trang sản phẩm</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="grid" value={view} onValueChange={setView}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="grid">Dạng lưới</TabsTrigger>
              <TabsTrigger value="detail">Trang chi tiết</TabsTrigger>
            </TabsList>
            <div className="text-xs text-muted-foreground">{validLabels.length} nhãn sẽ hiển thị</div>
          </div>

          <TabsContent value="grid" className="mt-4">
            <div className="relative rounded-md border bg-background p-4">
              <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                <img
                  src="/placeholder.svg?height=300&width=300"
                  alt="Sản phẩm mẫu"
                  className="h-full w-full object-cover"
                />
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                  {validLabels.map((label) => (
                    <motion.div
                      key={label.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Badge
                        className="px-2 py-1 text-xs font-medium text-white"
                        style={{ backgroundColor: label.color_code }}
                      >
                        {label.name}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="mt-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="mt-1 h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="detail" className="mt-4">
            <div className="rounded-md border bg-background p-4">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="relative aspect-square w-full max-w-[300px] overflow-hidden rounded-md bg-muted">
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Sản phẩm mẫu"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="h-6 w-3/4 rounded bg-muted" />
                    <div className="h-4 w-1/2 rounded bg-muted" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {validLabels.map((label) => (
                      <motion.div
                        key={label.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge className="px-2 py-1 text-white" style={{ backgroundColor: label.color_code }}>
                          {label.name}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-full rounded bg-muted" />
                    <div className="h-4 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {labels.length > validLabels.length && (
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800/30 dark:bg-amber-900/20 dark:text-amber-500">
            <p>
              <strong>Lưu ý:</strong> {labels.length - validLabels.length} nhãn đã hết hạn và sẽ không hiển thị.
            </p>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Đóng</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

