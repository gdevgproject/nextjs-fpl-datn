"use client"

import type React from "react"

import { useState } from "react"
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface DiscountCodeImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImport: (file: File) => Promise<void>
}

export function DiscountCodeImportDialog({ open, onOpenChange, onImport }: DiscountCodeImportDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)

    const droppedFile = e.dataTransfer.files[0]
    validateAndSetFile(droppedFile)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0])
    }
  }

  const validateAndSetFile = (file: File) => {
    setError(null)

    // Kiểm tra loại file
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ]
    if (!validTypes.includes(file.type)) {
      setError("Chỉ chấp nhận file Excel (.xls, .xlsx) hoặc CSV")
      return
    }

    // Kiểm tra kích thước file (giới hạn 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Kích thước file không được vượt quá 5MB")
      return
    }

    setFile(file)
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Giả lập tiến trình tải lên
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 100) {
            clearInterval(interval)
            return 100
          }
          return newProgress
        })
      }, 300)

      await onImport(file)

      // Đảm bảo tiến trình hoàn thành
      setUploadProgress(100)

      // Đặt lại trạng thái
      setTimeout(() => {
        setFile(null)
        setIsUploading(false)
        setUploadProgress(0)
      }, 500)
    } catch (error) {
      setError("Có lỗi xảy ra khi nhập dữ liệu. Vui lòng thử lại.")
      setIsUploading(false)
    }
  }

  const handleCancel = () => {
    if (isUploading) return

    setFile(null)
    setError(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={isUploading ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nhập mã giảm giá từ Excel</DialogTitle>
          <DialogDescription>Tải lên file Excel hoặc CSV chứa danh sách mã giảm giá</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!file ? (
            <div
              className={`flex flex-col items-center justify-center rounded-md border-2 border-dashed p-8 transition-colors ${
                isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="mt-4 text-center font-medium">Kéo và thả file Excel hoặc CSV vào đây</p>
              <p className="mt-1 text-center text-sm text-muted-foreground">hoặc nhấp vào đây để chọn file</p>
              <input
                type="file"
                className="absolute inset-0 cursor-pointer opacity-0"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                {!isUploading && (
                  <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-8 w-8">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Xóa file</span>
                  </Button>
                )}
              </div>

              {isUploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="mt-1 text-xs text-muted-foreground">Đang tải lên... {uploadProgress}%</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Lỗi</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Separator />

          <div className="rounded-md border p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                <CheckCircle2 className="h-3 w-3 text-primary" />
              </div>
              <div>
                <p className="font-medium">Hướng dẫn nhập dữ liệu</p>
                <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <li>File Excel phải có các cột: Mã, Loại, Giá trị, Điều kiện, Ngày bắt đầu, Ngày kết thúc</li>
                  <li>Loại mã giảm giá: percentage (phần trăm), fixed (cố định), shipping (vận chuyển)</li>
                  <li>Định dạng ngày: DD/MM/YYYY</li>
                  <li>
                    Tải xuống{" "}
                    <a href="#" className="text-primary underline">
                      mẫu Excel
                    </a>{" "}
                    để xem cấu trúc chuẩn
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isUploading}>
            Hủy
          </Button>
          <Button onClick={handleImport} disabled={!file || isUploading}>
            {isUploading ? "Đang nhập dữ liệu..." : "Nhập dữ liệu"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

