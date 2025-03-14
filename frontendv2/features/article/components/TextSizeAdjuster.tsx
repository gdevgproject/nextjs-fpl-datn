"use client"

import { Button } from "@/components/ui/Button"
import { useEffect, useState } from "react"

type TextSize = "default" | "large"

interface TextSizeAdjusterProps {
  className?: string
}

export default function TextSizeAdjuster({ className = "" }: TextSizeAdjusterProps) {
  const [activeSize, setActiveSize] = useState<TextSize>("default")

  useEffect(() => {
    // Apply text size to article content
    const articleContent = document.querySelector(".article-content")
    if (articleContent) {
      // Remove existing classes
      articleContent.classList.remove("text-base", "text-lg")

      // Add transition classes
      if (!articleContent.classList.contains("transition-all")) {
        articleContent.classList.add("transition-all", "duration-300", "delay-100")
      }

      // Apply text size classes to paragraphs and list items only
      const textElements = articleContent.querySelectorAll("p, li, td")
      textElements.forEach((element) => {
        element.classList.remove("text-base", "text-lg", "leading-normal", "leading-relaxed")

        if (!element.classList.contains("transition-all")) {
          element.classList.add("transition-all", "duration-300", "delay-100")
        }

        if (activeSize === "default") {
          element.classList.add("text-base", "leading-normal")
        } else {
          element.classList.add("text-lg", "leading-relaxed")
        }
      })
    }
  }, [activeSize])

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-[#6C757D]">Kích thước chữ</span>
      <div className="flex">
        <Button
          variant={activeSize === "default" ? "default" : "outline"}
          size="sm"
          className={`rounded-l-md rounded-r-none border-r-0 ${
            activeSize === "default"
              ? "bg-[#0D6EFD] text-white hover:bg-[#0D6EFD]/90"
              : "bg-white text-[#0D6EFD] hover:bg-gray-50"
          }`}
          onClick={() => setActiveSize("default")}
        >
          Mặc định
        </Button>
        <Button
          variant={activeSize === "large" ? "default" : "outline"}
          size="sm"
          className={`rounded-l-none rounded-r-md ${
            activeSize === "large"
              ? "bg-[#0D6EFD] text-white hover:bg-[#0D6EFD]/90"
              : "bg-white text-[#0D6EFD] hover:bg-gray-50"
          }`}
          onClick={() => setActiveSize("large")}
        >
          Lớn hơn
        </Button>
      </div>
    </div>
  )
}
