"use client"

import type React from "react"

import { useState } from "react"
import { FileUp, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"

interface ProductLabelImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductLabelImportDialog({ open, onOpenChange }: ProductLabelImportDialogProps) {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = () => {
    if (!file) {
      toast({
        title: "Không thể nhập dữ liệu",
        description: "Vui lòng chọn file để nhập",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    // Giả lập việc nhập dữ liệu
    setTimeout(() => {
      console.log("Nhập dữ liệu từ file:", file.name)

      toast({
        title: "Nhập dữ liệu thành công",
        description: `Đã nhập dữ liệu từ file ${file.name}`,
      })

      setIsUploading(false)
      setFile(null)
      onOpenChange(false)
    }, 1500)
  }

  const handleDownloadTemplate = () => {
    // Giả lập việc tải xuống mẫu
    console.log("Tải xuống mẫu nhập liệu")

    toast({
      title: "Đã tải xuống mẫu",
      description: "Mẫu nhập liệu đã được tải xuống",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nhập dữ liệu nhãn sản phẩm</DialogTitle>
          <DialogDescription>Tải lên file Excel hoặc CSV chứa dữ liệu nhãn sản phẩm</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            {file ? (
              <div className="space-y-2">
                <div className="flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-green-500"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                <Button variant="outline" size="sm" onClick={() => setFile(null)}>
                  Chọn file khác
                </Button>
              </div>
            ) : (
              <>
                <FileUp className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">Kéo và thả file vào đây hoặc click để chọn file</p>
                <Input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  id="file-upload"
                  onChange={handleFileChange}
                />
                <Button variant="outline" onClick={() => document.getElementById("file-upload")?.click()}>
                  Chọn file
                </Button>
                <p className="text-xs text-muted-foreground mt-2">Hỗ trợ định dạng: .xlsx, .xls, .csv</p>
              </>
            )}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Tải xuống mẫu file nhập liệu để đảm bảo định dạng chính xác</p>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
              <Download className="mr-2 h-4 w-4" />
              Tải mẫu
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleImport} disabled={!file || isUploading}>
            {isUploading ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Đang nhập...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Nhập dữ liệu
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

