"use client"

import { useState, useEffect } from "react"
import { Search, X, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Scent {
  id: string
  name: string
  description?: string
}

interface ProductScent {
  id?: string
  scent_id: string
  scent_name: string
  scent_type: "top" | "middle" | "base"
  intensity?: number
}

interface ProductScentFormProps {
  onSubmit: (scent: ProductScent) => void
  availableScents: Scent[]
  initialData?: ProductScent
  isEditing?: boolean
}

export function ProductScentForm({ onSubmit, availableScents, initialData, isEditing = false }: ProductScentFormProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedScent, setSelectedScent] = useState<string>(initialData?.scent_id || "")
  const [selectedType, setSelectedType] = useState<"top" | "middle" | "base">(initialData?.scent_type || "top")
  const [intensity, setIntensity] = useState<number>(initialData?.intensity || 3)
  const [recentlyUsedScents, setRecentlyUsedScents] = useState<Scent[]>([])

  // Lọc danh sách hương thơm theo từ khóa tìm kiếm
  const filteredScents = availableScents.filter((scent) => scent.name.toLowerCase().includes(searchTerm.toLowerCase()))

  // Lấy thông tin hương thơm đã chọn
  const selectedScentInfo = availableScents.find((s) => s.id === selectedScent)

  // Xử lý khi submit form
  const handleSubmit = () => {
    if (!selectedScent) return

    const scent = availableScents.find((s) => s.id === selectedScent)
    if (!scent) return

    const newScent: ProductScent = {
      id: initialData?.id,
      scent_id: selectedScent,
      scent_name: scent.name,
      scent_type: selectedType,
      intensity,
    }

    // Thêm vào danh sách đã sử dụng gần đây
    const isExist = recentlyUsedScents.some((s) => s.id === scent.id)
    if (!isExist) {
      const newRecentScents = [scent, ...recentlyUsedScents].slice(0, 5)
      setRecentlyUsedScents(newRecentScents)
      localStorage.setItem("recentScents", JSON.stringify(newRecentScents))
    }

    onSubmit(newScent)
  }

  // Lấy danh sách hương thơm đã sử dụng gần đây từ localStorage
  useEffect(() => {
    const storedRecentScents = localStorage.getItem("recentScents")
    if (storedRecentScents) {
      try {
        const parsedScents = JSON.parse(storedRecentScents)
        setRecentlyUsedScents(parsedScents)
      } catch (error) {
        console.error("Failed to parse recent scents", error)
      }
    }
  }, [])

  return (
    <div className="space-y-4 py-2">
      {/* Tìm kiếm hương thơm */}
      <div className="space-y-2">
        <Label htmlFor="scent-search">Tìm mùi hương</Label>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="scent-search"
            type="search"
            placeholder="Tìm theo tên mùi hương..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setSearchTerm("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Danh sách hương thơm đã sử dụng gần đây */}
      {recentlyUsedScents.length > 0 && !searchTerm && (
        <div className="space-y-2">
          <Label className="text-sm">Đã sử dụng gần đây</Label>
          <div className="flex flex-wrap gap-1">
            {recentlyUsedScents.map((scent) => (
              <Badge
                key={scent.id}
                variant={selectedScent === scent.id ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedScent(scent.id)}
              >
                {scent.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Danh sách hương thơm */}
      <div className="space-y-2">
        <Label>Chọn mùi hương</Label>
        <ScrollArea className="h-[200px] border rounded-md">
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredScents.length > 0 ? (
              filteredScents.map((scent) => (
                <div
                  key={scent.id}
                  className={`p-2 rounded-md cursor-pointer transition-colors ${
                    selectedScent === scent.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
                  }`}
                  onClick={() => setSelectedScent(scent.id)}
                >
                  <div className="font-medium">{scent.name}</div>
                  {scent.description && <div className="text-xs mt-1 opacity-90">{scent.description}</div>}
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-8 text-muted-foreground">
                {searchTerm ? `Không tìm thấy mùi hương "${searchTerm}"` : "Không có mùi hương nào"}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Loại hương */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Loại hương</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Info className="h-4 w-4" />
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
        <RadioGroup
          value={selectedType}
          onValueChange={(value) => setSelectedType(value as "top" | "middle" | "base")}
          className="flex flex-col space-y-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="top" id="top" />
            <Label htmlFor="top" className="font-normal cursor-pointer">
              Hương đầu (Top Notes)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="middle" id="middle" />
            <Label htmlFor="middle" className="font-normal cursor-pointer">
              Hương giữa (Middle Notes)
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="base" id="base" />
            <Label htmlFor="base" className="font-normal cursor-pointer">
              Hương cuối (Base Notes)
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Cường độ hương */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Cường độ hương</Label>
          <span className="text-sm">{intensity}/5</span>
        </div>
        <Slider value={[intensity]} min={1} max={5} step={1} onValueChange={(value) => setIntensity(value[0])} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Nhẹ</span>
          <span>Vừa</span>
          <span>Mạnh</span>
        </div>
      </div>

      {/* Thông tin hương thơm đã chọn */}
      {selectedScentInfo && (
        <div className="p-3 border rounded-md bg-accent/20">
          <div className="flex items-center justify-between">
            <div>
              <Badge variant={selectedType === "top" ? "default" : selectedType === "middle" ? "secondary" : "outline"}>
                {selectedType === "top" ? "Hương đầu" : selectedType === "middle" ? "Hương giữa" : "Hương cuối"}
              </Badge>
              <h4 className="font-medium mt-1">{selectedScentInfo.name}</h4>
              {selectedScentInfo.description && (
                <p className="text-xs text-muted-foreground mt-1">{selectedScentInfo.description}</p>
              )}
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{intensity}</div>
              <div className="text-xs text-muted-foreground">Cường độ</div>
            </div>
          </div>
        </div>
      )}

      {/* Nút submit */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="default" onClick={handleSubmit} disabled={!selectedScent}>
          {isEditing ? "Cập nhật" : "Thêm"} hương thơm
        </Button>
      </div>
    </div>
  )
}

