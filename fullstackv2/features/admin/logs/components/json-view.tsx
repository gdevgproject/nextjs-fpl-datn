"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, CopyIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface JsonViewProps {
  data: any
  level?: number
  isLast?: boolean
  property?: string
}

export function JsonView({ data, level = 0, isLast = true, property }: JsonViewProps) {
  const [isExpanded, setIsExpanded] = useState(level < 2)
  const { toast } = useToast()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      description: "Đã sao chép vào clipboard",
      duration: 2000,
    })
  }

  const getIndent = (level: number) => {
    return { paddingLeft: `${level * 16}px` }
  }

  const getType = (value: any) => {
    if (value === null) return "null"
    if (Array.isArray(value)) return "array"
    return typeof value
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "string":
        return "text-green-600 dark:text-green-400"
      case "number":
        return "text-blue-600 dark:text-blue-400"
      case "boolean":
        return "text-purple-600 dark:text-purple-400"
      case "null":
        return "text-gray-500"
      default:
        return ""
    }
  }

  const renderValue = (value: any, type: string) => {
    switch (type) {
      case "string":
        return `"${value}"`
      case "null":
        return "null"
      default:
        return String(value)
    }
  }

  const type = getType(data)
  const isExpandable = type === "object" || type === "array"

  if (!isExpandable) {
    return (
      <div className="flex items-center" style={getIndent(level)}>
        {property && <span className="font-semibold mr-1">"{property}":</span>}
        <span className={getTypeColor(type)}>{renderValue(data, type)}</span>
        {!isLast && <span>,</span>}
      </div>
    )
  }

  const isEmpty = Object.keys(data).length === 0

  return (
    <div>
      <div className="flex items-center" style={getIndent(level)}>
        {isExpandable && !isEmpty && (
          <Button variant="ghost" size="icon" className="h-5 w-5 p-0 mr-1" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}

        {property && <span className="font-semibold mr-1">"{property}":</span>}

        <span>{type === "array" ? "[" : "{"}</span>

        {isEmpty && <span>{type === "array" ? "]" : "}"}</span>}

        {!isEmpty && !isExpanded && <span className="text-gray-500">...</span>}

        {!isEmpty && !isExpanded && <span>{type === "array" ? "]" : "}"}</span>}

        {!isLast && !isEmpty && !isExpanded && <span>,</span>}

        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 ml-1"
          onClick={() => handleCopy(JSON.stringify(data, null, 2))}
          title="Sao chép"
        >
          <CopyIcon className="h-3 w-3" />
        </Button>
      </div>

      {isExpanded && !isEmpty && (
        <div>
          {Object.entries(data).map(([key, value], index, arr) => (
            <JsonView
              key={key}
              data={value}
              level={level + 1}
              isLast={index === arr.length - 1}
              property={type === "object" ? key : undefined}
            />
          ))}

          <div style={getIndent(level)}>
            <span>{type === "array" ? "]" : "}"}</span>
            {!isLast && <span>,</span>}
          </div>
        </div>
      )}
    </div>
  )
}
