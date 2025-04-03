"use client"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DiscountCodeGeneratorProps {
  onSelectCode: (code: string) => void
}

const SUGGESTED_CODES = [
  "WELCOME10",
  "SUMMER2023",
  "FALL2023",
  "WINTER2023",
  "SPRING2024",
  "NEWYEAR2024",
  "FLASH25",
  "WEEKEND15",
  "HOLIDAY20",
  "BIRTHDAY15",
  "THANKS10",
  "LOYALTY20",
]

export function DiscountCodeGenerator({ onSelectCode }: DiscountCodeGeneratorProps) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null)

  const handleSelectCode = (code: string) => {
    setSelectedCode(code)
    onSelectCode(code)
  }

  return (
    <ScrollArea className="h-32 rounded-md border">
      <div className="p-2 grid grid-cols-2 gap-2">
        {SUGGESTED_CODES.map((code) => (
          <Button
            key={code}
            variant={selectedCode === code ? "default" : "outline"}
            size="sm"
            className="h-8 text-xs justify-start"
            onClick={() => handleSelectCode(code)}
          >
            {code}
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

