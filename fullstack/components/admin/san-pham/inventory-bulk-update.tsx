"use client"

import type React from "react"

import { useState } from "react"
import { Upload, FileText, AlertTriangle, Check, X, Download } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface InventoryBulkUpdateProps {
  onClose: () => void
}

export function InventoryBulkUpdate({ onClose }: InventoryBulkUpdateProps) {
  const [activeTab, setActiveTab] = useState("manual")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "success" | "error">("idle")
  const [fileName, setFileName] = useState("")
  const [updateReason, setUpdateReason] = useState("")

  // Dữ liệu mẫu cho cập nhật thủ công
  const [manualItems, setManualItems] = useState([
    { id: "1", sku: "CH-N5-50ML", name: "Chanel No. 5 (50ml)", current: 15, add: 5, new: 20 },
    { id: "2", sku: "DR-SV-100ML", name: "Dior Sauvage (100ml)", current: 8, add: 10, new: 18 },
    { id: "3", sku: "GC-BL-50ML", name: "Gucci Bloom (50ml)", current: 12, add: 8, new: 20 },
  ])

  // Xử lý thay đổi số lượng thêm vào
  const handleQuantityChange = (id: string, value: number) => {
    setManualItems(
      manualItems.map((item) => (item.id === id ? { ...item, add: value, new: item.current + value } : item)),
    )
  }

  // Xử lý thêm sản phẩm mới
  const handleAddItem = () => {
    setManualItems([...manualItems, { id: `new-${Date.now()}`, sku: "", name: "", current: 0, add: 0, new: 0 }])
  }

  // Xử lý xóa sản phẩm
  const handleRemoveItem = (id: string) => {
    setManualItems(manualItems.filter((item) => item.id !== id))
  }

  // Xử lý upload file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFileName(file.name)
      setUploadStatus("uploading")

      // Giả lập tiến trình upload
      let progress = 0
      const interval = setInterval(() => {
        progress += 10
        setUploadProgress(progress)

        if (progress >= 100) {
          clearInterval(interval)
          setUploadStatus("success")
        }
      }, 300)
    }
  }

  // Xử lý cập nhật hàng loạt
  const handleBulkUpdate = () => {
    console.log("Bulk update", {
      items: manualItems,
      reason: updateReason,
    })

    // Đóng dialog sau khi cập nhật
    onClose()
  }

  return (
    <div className="py-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manual">Nhập thủ công</TabsTrigger>
          <TabsTrigger value="file">Tải lên file</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="update-reason">Lý do cập nhật</Label>
            <Textarea
              id="update-reason"
              placeholder="Nhập lý do cập nhật tồn kho"
              value={updateReason}
              onChange={(e) => setUpdateReason(e.target.value)}
            />
          </div>

          <div className="border rounded-md">
            <ScrollArea className="h-[300px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>SKU</TableHead>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="w-[80px] text-right">Hiện tại</TableHead>
                    <TableHead className="w-[100px] text-right">Thêm vào</TableHead>
                    <TableHead className="w-[80px] text-right">Mới</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {manualItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          value={item.sku}
                          onChange={(e) => {
                            setManualItems(
                              manualItems.map((i) => (i.id === item.id ? { ...i, sku: e.target.value } : i)),
                            )
                          }}
                          className="h-8"
                          placeholder="SKU"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={item.name}
                          onChange={(e) => {
                            setManualItems(
                              manualItems.map((i) => (i.id === item.id ? { ...i, name: e.target.value } : i)),
                            )
                          }}
                          className="h-8"
                          placeholder="Tên sản phẩm"
                        />
                      </TableCell>
                      <TableCell className="text-right">{item.current}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={0}
                          value={item.add}
                          onChange={(e) => handleQuantityChange(item.id, Number(e.target.value))}
                          className="h-8 text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right font-medium">{item.new}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveItem(item.id)}
                          className="h-8 w-8"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" size="sm" onClick={handleAddItem}>
              Thêm sản phẩm
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Tải mẫu Excel
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="file" className="mt-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Tải lên file Excel</Label>
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              {uploadStatus === "idle" && (
                <>
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Kéo thả file Excel hoặc nhấp vào đây để tải lên</p>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button variant="outline" size="sm" onClick={() => document.getElementById("file-upload")?.click()}>
                    Chọn file
                  </Button>
                </>
              )}

              {uploadStatus === "uploading" && (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-blue-500 mr-2" />
                      <span className="text-sm font-medium">{fileName}</span>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Đang tải lên
                    </Badge>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-right">{uploadProgress}%</p>
                </div>
              )}

              {uploadStatus === "success" && (
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-sm font-medium">{fileName}</span>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
                      <Check className="h-3 w-3 mr-1" />
                      Đã tải lên
                    </Badge>
                  </div>
                  <Alert className="mt-4">
                    <Check className="h-4 w-4" />
                    <AlertTitle>Tải lên thành công</AlertTitle>
                    <AlertDescription>
                      Đã tìm thấy 15 sản phẩm trong file. Nhấn "Cập nhật" để tiếp tục.
                    </AlertDescription>
                  </Alert>
                </div>
              )}

              {uploadStatus === "error" && (
                <div className="w-full space-y-2">
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Lỗi tải lên</AlertTitle>
                    <AlertDescription>
                      Có lỗi xảy ra khi tải lên file. Vui lòng kiểm tra định dạng file và thử lại.
                    </AlertDescription>
                  </Alert>
                  <Button variant="outline" size="sm" onClick={() => setUploadStatus("idle")}>
                    Thử lại
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file-update-reason">Lý do cập nhật</Label>
            <Textarea
              id="file-update-reason"
              placeholder="Nhập lý do cập nhật tồn kho"
              value={updateReason}
              onChange={(e) => setUpdateReason(e.target.value)}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose}>
          Hủy
        </Button>
        <Button
          onClick={handleBulkUpdate}
          disabled={uploadStatus === "uploading" || (!updateReason && activeTab === "manual")}
        >
          Cập nhật
        </Button>
      </div>
    </div>
  )
}

