"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Check, Copy, Palette } from "lucide-react"
import { motion } from "framer-motion"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface ProductLabelColorPickerEnhancedProps {
  color: string
  onChange: (color: string) => void
}

// Danh sách màu sắc phổ biến
const popularColors = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
  "#6b7280", // gray
  "#000000", // black
]

// Danh sách màu sắc theo xu hướng
const trendingColors = [
  "#0891b2", // Cyan 600
  "#db2777", // Pink 600
  "#4f46e5", // Indigo 600
  "#16a34a", // Green 600
  "#9333ea", // Purple 600
  "#ea580c", // Orange 600
  "#0284c7", // Sky 600
  "#0f766e", // Teal 600
  "#4338ca", // Indigo 700
  "#be123c", // Rose 700
]

// Danh sách màu sắc theo chủ đề
const themeColors = {
  "Mùa xuân": ["#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4"],
  "Mùa hè": ["#f97316", "#f59e0b", "#eab308", "#facc15", "#fbbf24"],
  "Mùa thu": ["#b45309", "#92400e", "#a16207", "#a3e635", "#d97706"],
  "Mùa đông": ["#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7"],
  Pastel: ["#fecaca", "#fed7aa", "#fef3c7", "#d9f99d", "#bfdbfe"],
  Neon: ["#fb7185", "#fb923c", "#fbbf24", "#a3e635", "#38bdf8"],
}

export function ProductLabelColorPickerEnhanced({ color, onChange }: ProductLabelColorPickerEnhancedProps) {
  const [activeTab, setActiveTab] = useState("popular")
  const [activeTheme, setActiveTheme] = useState<keyof typeof themeColors>("Mùa xuân")
  const [copiedColor, setCopiedColor] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState(color)
  const inputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  // Đồng bộ input value khi color thay đổi từ bên ngoài
  useEffect(() => {
    setInputValue(color)
  }, [color])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    // Kiểm tra xem giá trị có phải là mã màu hợp lệ không
    if (/^#([0-9A-F]{3}){1,2}$/i.test(value)) {
      onChange(value)
    }
  }

  const handleColorSelect = (selectedColor: string) => {
    onChange(selectedColor)
    setInputValue(selectedColor)
  }

  const handleCopyColor = (colorToCopy: string) => {
    navigator.clipboard.writeText(colorToCopy)
    setCopiedColor(colorToCopy)

    toast({
      title: "Đã sao chép",
      description: `Mã màu ${colorToCopy} đã được sao chép vào clipboard`,
      duration: 2000,
    })

    setTimeout(() => {
      setCopiedColor(null)
    }, 2000)
  }

  const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(inputValue)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "h-10 w-10 rounded-md border cursor-pointer transition-all",
            !isValidHex && "border-red-500 animate-pulse",
          )}
          style={{ backgroundColor: isValidHex ? inputValue : "#ffffff" }}
          onClick={() => inputRef.current?.focus()}
        />
        <div className="flex-1 flex items-center gap-2">
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            className={cn("w-32 font-mono", !isValidHex && "border-red-500 focus-visible:ring-red-500")}
            placeholder="#000000"
          />
          <Input
            type="color"
            value={isValidHex ? inputValue : "#ffffff"}
            onChange={(e) => {
              onChange(e.target.value)
              setInputValue(e.target.value)
            }}
            className="w-12 h-10 p-0 cursor-pointer"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyColor(inputValue)}
                  disabled={!isValidHex}
                >
                  {copiedColor === inputValue ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sao chép mã màu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="icon">
                <Palette className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="p-3 w-[300px]">
                <Tabs defaultValue="popular" value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full grid grid-cols-3">
                    <TabsTrigger value="popular">Phổ biến</TabsTrigger>
                    <TabsTrigger value="trending">Xu hướng</TabsTrigger>
                    <TabsTrigger value="themes">Chủ đề</TabsTrigger>
                  </TabsList>

                  <TabsContent value="popular" className="mt-3">
                    <div className="grid grid-cols-5 gap-2">
                      {popularColors.map((c) => (
                        <ColorButton
                          key={c}
                          color={c}
                          isSelected={inputValue === c}
                          onClick={() => handleColorSelect(c)}
                          onCopy={() => handleCopyColor(c)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="trending" className="mt-3">
                    <div className="grid grid-cols-5 gap-2">
                      {trendingColors.map((c) => (
                        <ColorButton
                          key={c}
                          color={c}
                          isSelected={inputValue === c}
                          onClick={() => handleColorSelect(c)}
                          onCopy={() => handleCopyColor(c)}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="themes" className="mt-3">
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {Object.keys(themeColors).map((theme) => (
                          <Button
                            key={theme}
                            type="button"
                            variant={activeTheme === theme ? "default" : "outline"}
                            size="sm"
                            onClick={() => setActiveTheme(theme as keyof typeof themeColors)}
                            className="text-xs"
                          >
                            {theme}
                          </Button>
                        ))}
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {themeColors[activeTheme].map((c) => (
                          <ColorButton
                            key={c}
                            color={c}
                            isSelected={inputValue === c}
                            onClick={() => handleColorSelect(c)}
                            onCopy={() => handleCopyColor(c)}
                          />
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {!isValidHex && <p className="text-xs text-red-500">Vui lòng nhập mã màu hợp lệ (ví dụ: #FF0000)</p>}
    </div>
  )
}

interface ColorButtonProps {
  color: string
  isSelected: boolean
  onClick: () => void
  onCopy: () => void
}

function ColorButton({ color, isSelected, onClick, onCopy }: ColorButtonProps) {
  const [showCopy, setShowCopy] = useState(false)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            type="button"
            className={cn(
              "relative h-8 w-8 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2",
              isSelected && "ring-2 ring-offset-2 ring-primary",
            )}
            style={{ backgroundColor: color }}
            onClick={onClick}
            onMouseEnter={() => setShowCopy(true)}
            onMouseLeave={() => setShowCopy(false)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isSelected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <Check className="h-4 w-4 text-white drop-shadow-md" />
              </motion.div>
            )}

            {showCopy && !isSelected && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-md"
                onClick={(e) => {
                  e.stopPropagation()
                  onCopy()
                }}
              >
                <Copy className="h-3 w-3 text-white" />
              </motion.div>
            )}
          </motion.button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{color}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

