"use client"

import type React from "react"
import { Check } from "lucide-react"

import { Input } from "@/components/ui/input"

interface ProductLabelColorPickerProps {
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

export function ProductLabelColorPicker({ color, onChange }: ProductLabelColorPickerProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-md border" style={{ backgroundColor: color }} />
        <Input type="text" value={color} onChange={handleInputChange} className="w-32" />
        <Input type="color" value={color} onChange={handleInputChange} className="w-12 h-8 p-0 cursor-pointer" />
      </div>

      <div className="grid grid-cols-10 gap-2">
        {popularColors.map((c) => (
          <button
            key={c}
            type="button"
            className="relative h-6 w-6 rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: c }}
            onClick={() => onChange(c)}
            aria-label={`Chọn màu ${c}`}
          >
            {color === c && <Check className="absolute inset-0 m-auto h-4 w-4 text-white" />}
          </button>
        ))}
      </div>
    </div>
  )
}

