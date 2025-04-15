"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"

interface UserAddressExportProps {
  addresses: Array<{
    id: string
    recipient_name: string
    recipient_phone: string
    province_city: string
    district: string
    ward: string
    street_address: string
    is_default: boolean
    created_at: string
    updated_at: string
  }>
  onExport: () => void
}

export function UserAddressExport({ addresses, onExport }: UserAddressExportProps) {
  const [exportFormat, setExportFormat] = useState<"csv" | "excel" | "pdf">("csv")
  const [isExporting, setIsExporting] = useState(false)
  const [includeFields, setIncludeFields] = useState({
    recipient_name: true,
    recipient_phone: true,
    province_city: true,
    district: true,
    ward: true,
    street_address: true,
    is_default: true,
    created_at: false,
    updated_at: false,
  })

  const handleExport = async () => {
    setIsExporting(true)

    try {
      // Giả lập xuất file
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Xuất dữ liệu thành công",
        description: `Đã xuất ${addresses.length} địa chỉ sang định dạng ${exportFormat.toUpperCase()}`,
      })

      onExport()
    } catch (error) {
      console.error("Error exporting addresses:", error)
      toast({
        title: "Xuất dữ liệu thất bại",
        description: "Đã xảy ra lỗi khi xuất dữ liệu. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const toggleField = (field: keyof typeof includeFields) => {
    setIncludeFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  return (
    <div className="space-y-6">
      <RadioGroup
        defaultValue={exportFormat}
        onValueChange={(value) => setExportFormat(value as "csv" | "excel" | "pdf")}
        className="grid grid-cols-3 gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="csv" id="csv" />
          <Label htmlFor="csv" className="flex items-center cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            CSV
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="excel" id="excel" />
          <Label htmlFor="excel" className="flex items-center cursor-pointer">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pdf" id="pdf" />
          <Label htmlFor="pdf" className="flex items-center cursor-pointer">
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Label>
        </div>
      </RadioGroup>

      <div className="space-y-2">
        <Label>Chọn trường dữ liệu</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recipient_name"
              checked={includeFields.recipient_name}
              onCheckedChange={() => toggleField("recipient_name")}
            />
            <Label htmlFor="recipient_name" className="cursor-pointer">
              Tên người nhận
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="recipient_phone"
              checked={includeFields.recipient_phone}
              onCheckedChange={() => toggleField("recipient_phone")}
            />
            <Label htmlFor="recipient_phone" className="cursor-pointer">
              Số điện thoại
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="province_city"
              checked={includeFields.province_city}
              onCheckedChange={() => toggleField("province_city")}
            />
            <Label htmlFor="province_city" className="cursor-pointer">
              Tỉnh/Thành phố
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="district" checked={includeFields.district} onCheckedChange={() => toggleField("district")} />
            <Label htmlFor="district" className="cursor-pointer">
              Quận/Huyện
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox id="ward" checked={includeFields.ward} onCheckedChange={() => toggleField("ward")} />
            <Label htmlFor="ward" className="cursor-pointer">
              Phường/Xã
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="street_address"
              checked={includeFields.street_address}
              onCheckedChange={() => toggleField("street_address")}
            />
            <Label htmlFor="street_address" className="cursor-pointer">
              Địa chỉ chi tiết
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_default"
              checked={includeFields.is_default}
              onCheckedChange={() => toggleField("is_default")}
            />
            <Label htmlFor="is_default" className="cursor-pointer">
              Địa chỉ mặc định
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="created_at"
              checked={includeFields.created_at}
              onCheckedChange={() => toggleField("created_at")}
            />
            <Label htmlFor="created_at" className="cursor-pointer">
              Ngày tạo
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="updated_at"
              checked={includeFields.updated_at}
              onCheckedChange={() => toggleField("updated_at")}
            />
            <Label htmlFor="updated_at" className="cursor-pointer">
              Ngày cập nhật
            </Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onExport}>
          Hủy
        </Button>
        <Button onClick={handleExport} disabled={isExporting || Object.values(includeFields).every((v) => !v)}>
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xuất...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Xuất {addresses.length} địa chỉ
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

