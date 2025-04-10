"use client"

import { useState } from "react"
import { Download, FileSpreadsheet, FileText, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ProductExportProps {
  totalProducts: number
}

export function ProductExport({ totalProducts }: ProductExportProps) {
  const [showExportDialog, setShowExportDialog] = useState(false)
  const [exportFormat, setExportFormat] = useState<"csv" | "excel">("excel")
  const [exportLoading, setExportLoading] = useState(false)

  // Các trường có thể xuất
  const [exportFields, setExportFields] = useState({
    basic: true,
    variants: true,
    categories: true,
    images: true,
    scents: true,
    ingredients: true,
    labels: true,
  })

  const handleExport = () => {
    setExportLoading(true)

    // Giả lập xuất file
    setTimeout(() => {
      setExportLoading(false)
      setShowExportDialog(false)

      // Hiển thị thông báo thành công (trong thực tế sẽ tải file xuống)
      alert(`Đã xuất ${totalProducts} sản phẩm sang định dạng ${exportFormat.toUpperCase()}`)
    }, 1500)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Xuất danh sách sản phẩm</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              setExportFormat("csv")
              setShowExportDialog(true)
            }}
          >
            <FileText className="mr-2 h-4 w-4" />
            Xuất sang CSV
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setExportFormat("excel")
              setShowExportDialog(true)
            }}
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Xuất sang Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xuất danh sách sản phẩm</DialogTitle>
            <DialogDescription>
              Chọn các thông tin bạn muốn xuất sang file {exportFormat === "csv" ? "CSV" : "Excel"}.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-basic"
                  checked={exportFields.basic}
                  onCheckedChange={(checked) => setExportFields({ ...exportFields, basic: checked as boolean })}
                />
                <Label htmlFor="export-basic">Thông tin cơ bản (tên, mã, thương hiệu, giới tính, loại, nồng độ)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-variants"
                  checked={exportFields.variants}
                  onCheckedChange={(checked) => setExportFields({ ...exportFields, variants: checked as boolean })}
                />
                <Label htmlFor="export-variants">Biến thể sản phẩm (dung tích, giá, tồn kho)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-categories"
                  checked={exportFields.categories}
                  onCheckedChange={(checked) => setExportFields({ ...exportFields, categories: checked as boolean })}
                />
                <Label htmlFor="export-categories">Danh mục sản phẩm</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-images"
                  checked={exportFields.images}
                  onCheckedChange={(checked) => setExportFields({ ...exportFields, images: checked as boolean })}
                />
                <Label htmlFor="export-images">Hình ảnh sản phẩm (URL)</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-scents"
                  checked={exportFields.scents}
                  onCheckedChange={(checked) => setExportFields({ ...exportFields, scents: checked as boolean })}
                />
                <Label htmlFor="export-scents">Thông tin hương thơm</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-ingredients"
                  checked={exportFields.ingredients}
                  onCheckedChange={(checked) => setExportFields({ ...exportFields, ingredients: checked as boolean })}
                />
                <Label htmlFor="export-ingredients">Thông tin thành phần</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="export-labels"
                  checked={exportFields.labels}
                  onCheckedChange={(checked) => setExportFields({ ...exportFields, labels: checked as boolean })}
                />
                <Label htmlFor="export-labels">Nhãn sản phẩm</Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExportDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleExport} disabled={exportLoading}>
              {exportLoading ? (
                <>Đang xuất...</>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Xuất {totalProducts} sản phẩm
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

