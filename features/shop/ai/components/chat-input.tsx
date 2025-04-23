"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send, Plus } from "lucide-react"
import { useChatContext } from "./chat-provider"
import { cn } from "@/shared/lib/utils"

export function ChatInput() {
  const [input, setInput] = useState("")
  const { sendMessage, isLoading, resetChat, messages } = useChatContext()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const CHARACTER_LIMIT = 500

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    await sendMessage(input)
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length <= CHARACTER_LIMIT) {
      setInput(value)
    } else {
      // Truncate the input if it exceeds the limit
      setInput(value.substring(0, CHARACTER_LIMIT))
    }
  }

  return (
    <div className="border-t bg-background p-4">
      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={handleInputChange}
          placeholder="Hỏi về nước hoa..."
          className={cn(
            "min-h-[60px] max-h-[200px] resize-none",
            input.length > CHARACTER_LIMIT ? "border-red-500" : "",
          )}
          disabled={isLoading}
          maxLength={CHARACTER_LIMIT}
        />
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={resetChat}
            disabled={isLoading || messages.length === 0}
            className="h-9 w-9"
            aria-label="Bắt đầu cuộc trò chuyện mới"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Bắt đầu cuộc trò chuyện mới</span>
          </Button>
          <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="h-9 w-9">
            <Send className="h-4 w-4" />
            <span className="sr-only">Gửi</span>
          </Button>
        </div>
      </form>
      <p className="text-xs text-muted-foreground mt-1 text-right">
        {input.length}/{CHARACTER_LIMIT}
      </p>
    </div>
  )
}
