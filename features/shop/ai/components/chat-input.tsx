"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Plus, Sparkles } from "lucide-react";
import { useChatContext } from "./chat-provider";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function ChatInput() {
  const [input, setInput] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { sendMessage, isLoading, resetChat, messages } = useChatContext();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const CHARACTER_LIMIT = 500;
  const characterPercentage = Math.min(
    (input.length / CHARACTER_LIMIT) * 100,
    100
  );
  const isNearLimit = characterPercentage > 80;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        120
      )}px`;
    }
  }, [input]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const message = input;
    setInput(""); // Clear input ngay khi gửi
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= CHARACTER_LIMIT) {
      setInput(value);
    } else {
      // Truncate the input if it exceeds the limit
      setInput(value.substring(0, CHARACTER_LIMIT));
    }
  };

  return (
    <div className="border-t bg-background/80 backdrop-blur-sm p-3 md:p-4 relative">
      {/* Progress bar cho character limit */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-muted">
        <motion.div
          className={cn(
            "h-full transition-colors",
            isNearLimit
              ? characterPercentage > 95
                ? "bg-red-500"
                : "bg-amber-500"
              : "bg-primary"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${characterPercentage}%` }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        />
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div
          className={cn(
            "relative flex-1 transition-all duration-300",
            isFocused ? "ring-2 ring-primary/20 rounded-lg" : ""
          )}
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Hỏi về nước hoa..."
            className={cn(
              "min-h-[44px] max-h-[120px] resize-none pr-16",
              "border-muted-foreground/20 focus:border-primary/30",
              "focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-muted-foreground/50",
              isNearLimit && characterPercentage > 95
                ? "border-red-500 focus:border-red-500"
                : ""
            )}
            disabled={false} // Cho phép nhập khi loading, chỉ disable nút gửi
            maxLength={CHARACTER_LIMIT}
            onKeyDown={handleKeyDown}
          />

          {/* Character counter inside textarea */}
          <div
            className={cn(
              "absolute bottom-1.5 right-2 text-xs px-1.5 py-0.5 rounded-full",
              "transition-colors duration-300",
              isNearLimit
                ? characterPercentage > 95
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                : "bg-muted text-muted-foreground"
            )}
          >
            {input.length}/{CHARACTER_LIMIT}
          </div>
        </div>

        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon"
            type="button"
            onClick={resetChat}
            disabled={isLoading || messages.length === 0}
            className={cn(
              "h-9 w-9 rounded-full border-muted-foreground/20",
              "hover:bg-muted hover:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "transition-all duration-200"
            )}
            aria-label="Bắt đầu cuộc trò chuyện mới"
          >
            <Plus className="h-4 w-4" />
            <span className="sr-only">Bắt đầu cuộc trò chuyện mới</span>
          </Button>

          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className={cn(
              "h-9 w-9 rounded-full",
              "bg-primary hover:bg-primary/90",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
              "transition-all duration-200",
              isLoading ? "animate-pulse" : ""
            )}
          >
            {isLoading ? (
              <div className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Gửi</span>
          </Button>
        </div>
      </form>

      {/* Suggestion chips */}
      {messages.length > 0 && input.length === 0 && !isLoading && (
        <div className="mt-3 flex flex-wrap gap-2">
          <SuggestionChip text="Nước hoa nam phổ biến?" />
          <SuggestionChip text="Nước hoa mùa hè?" />
          <SuggestionChip text="Nước hoa lưu hương lâu?" />
        </div>
      )}
    </div>
  );
}

function SuggestionChip({ text }: { text: string }) {
  const { sendMessage } = useChatContext();

  return (
    <button
      onClick={() => sendMessage(text)}
      className={cn(
        "text-xs rounded-full px-3 py-1.5",
        "bg-primary/10 hover:bg-primary/20 text-primary",
        "border border-primary/20",
        "transition-all duration-200",
        "flex items-center gap-1"
      )}
    >
      <Sparkles className="h-3 w-3" />
      {text}
    </button>
  );
}
