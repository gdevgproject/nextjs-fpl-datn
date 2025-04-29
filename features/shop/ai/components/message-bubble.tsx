"use client";
import type { Message } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
  isSequential?: boolean;
}

export function MessageBubble({
  message,
  isSequential = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { settings } = useShopSettings();
  const botAvatar = settings?.shop_logo_url || "/placeholder-logo.png";
  const userAvatar = "/placeholder-user.jpg";
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn("flex w-full gap-2 items-end group", {
        "justify-end": isUser,
        "mb-1": isSequential,
      })}
    >
      {!isUser && !isSequential && (
        <Avatar className="h-8 w-8 border border-primary/20 shadow-sm">
          <AvatarImage
            src={botAvatar || "/placeholder.svg"}
            alt="AI Assistant"
          />
          <AvatarFallback className="bg-primary/10 text-primary">
            {settings?.shop_name?.[0] || <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      {!isUser && isSequential && <div className="w-8" />}

      <div
        className={cn(
          "relative flex max-w-[85%] sm:max-w-[75%] flex-col gap-1 px-4 py-2.5 shadow-sm",
          isUser
            ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-2xl rounded-br-sm"
            : "bg-gradient-to-br from-muted/80 to-muted/50 backdrop-blur-sm text-foreground rounded-2xl rounded-bl-sm",
          isSequential && isUser ? "rounded-tr-sm" : "",
          isSequential && !isUser ? "rounded-tl-sm" : "",
          "border border-primary/10"
        )}
      >
        {/* Copy button for assistant messages */}
        {!isUser && (
          <button
            onClick={copyToClipboard}
            className={cn(
              "absolute -right-3 -top-3 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-primary/10 shadow-sm",
              "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
              "hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
            )}
            aria-label="Sao chép tin nhắn"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        )}

        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
              p: ({ node, ...props }) => (
                <p {...props} className="mb-2 last:mb-0" />
              ),
              ul: ({ node, ...props }) => (
                <ul {...props} className="pl-5 mb-2 space-y-1" />
              ),
              ol: ({ node, ...props }) => (
                <ol {...props} className="pl-5 mb-2 space-y-1" />
              ),
              li: ({ node, ...props }) => <li {...props} className="mb-0.5" />,
              code: ({ node, inline, ...props }) =>
                inline ? (
                  <code
                    {...props}
                    className="px-1 py-0.5 bg-muted rounded text-xs font-mono"
                  />
                ) : (
                  <code
                    {...props}
                    className="block p-2 bg-muted rounded-md text-xs font-mono overflow-x-auto"
                  />
                ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="text-[10px] opacity-60 self-end">
          {message.createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {isUser && !isSequential && (
        <Avatar className="h-8 w-8 border border-primary/20 shadow-sm">
          <AvatarImage src={userAvatar || "/placeholder.svg"} alt="User" />
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}

      {isUser && isSequential && <div className="w-8" />}
    </div>
  );
}
