"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Loader2, Filter, X } from "lucide-react"

interface UserAddressFilterProps {
  onApply: () => void
}

export function UserAddressFilter({ onApply }: UserAddressFilterProps) {
  const [isApplying, setIsApplying] = useState(false)
  const [defaultFilter, setDefaultFilter] = useState<"all" | "default" | "non-default">("all")
  const [selectedProvinces, setSelectedProvinces] = useState<string[]>([])
  const [searchText, setSearchText] = useState("")

  // Mock data cho select
  const provinces = [
    { value: "Thành phố Hồ Chí Minh", label: "Thành phố Hồ Chí Minh" },
    { value: "Hà Nội", label: "Hà Nội" },
    { value: "Đà Nẵng", label: "Đà Nẵng" },
    { value: "Cần Thơ", label: "Cần Thơ" },
    { value: "Hải Phòng", label: "Hải Phòng" },
  ]

  const handleApplyFilter = async () => {
    setIsApplying(true)

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Filter applied:", {
        defaultFilter,
        selectedProvinces,
        searchText,
      })

      onApply()
    } catch (error) {
      console.error("Error applying filter:", error)
    } finally {
      setIsApplying(false)
    }
  }

  const handleResetFilter = () => {
    setDefaultFilter("all")
    setSelectedProvinces([])
    setSearchText("")
  }

  const toggleProvince = (province: string) => {
    setSelectedProvinces((prev) => (prev.includes(province) ? prev.filter((p) => p !== province) : [...prev, province]))
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label>Tìm kiếm</Label>
        <div className="relative">
          <Input
            placeholder="Tìm kiếm theo tên, số điện thoại, địa chỉ..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          {searchText && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0.5 top-0.5 h-7 w-7 p-0"
              onClick={() => setSearchText("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Xóa tìm kiếm</span>
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Trạng thái</Label>
        <RadioGroup
          defaultValue={defaultFilter}
          onValueChange={(value) => setDefaultFilter(value as "all" | "default" | "non-default")}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="all" />
            <Label htmlFor="all" className="cursor-pointer">
              Tất cả địa chỉ
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="default" id="default" />
            <Label htmlFor="default" className="cursor-pointer">
              Chỉ địa chỉ mặc định
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="non-default" id="non-default" />
            <Label htmlFor="non-default" className="cursor-pointer">
              Chỉ địa chỉ không mặc định
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label>Tỉnh/Thành phố</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 border rounded-md p-4 max-h-[200px] overflow-y-auto">
          {provinces.map((province) => (
            <div key={province.value} className="flex items-center space-x-2">
              <Checkbox
                id={`province-${province.value}`}
                checked={selectedProvinces.includes(province.value)}
                onCheckedChange={() => toggleProvince(province.value)}
              />
              <Label htmlFor={`province-${province.value}`} className="cursor-pointer">
                {province.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handleResetFilter}
          disabled={defaultFilter === "all" && selectedProvinces.length === 0 && !searchText}
        >
          <X className="mr-2 h-4 w-4" />
          Đặt lại
        </Button>
        <Button onClick={handleApplyFilter} disabled={isApplying}>
          {isApplying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang áp dụng...
            </>
          ) : (
            <>
              <Filter className="mr-2 h-4 w-4" />
              Áp dụng bộ lọc
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

