"use client"

import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TruncatedTextProps {
  text: string
  maxLength?: number
}

export function TruncatedText({ text, maxLength = 50 }: TruncatedTextProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false)

  if (text.length <= maxLength) {
    return <span>{text}</span>
  }

  const truncatedText = `${text.substring(0, maxLength)}...`

  return (
    <TooltipProvider>
      <Tooltip open={isTooltipOpen} onOpenChange={setIsTooltipOpen}>
        <TooltipTrigger asChild>
          <span
            className="cursor-help"
            onMouseEnter={() => setIsTooltipOpen(true)}
            onMouseLeave={() => setIsTooltipOpen(false)}
          >
            {truncatedText}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

