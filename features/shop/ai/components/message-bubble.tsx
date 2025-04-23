import type { Message } from "../types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";
  const { settings } = useShopSettings();
  const botAvatar = settings?.shop_logo_url || "/placeholder-logo.png";
  const userAvatar = "/placeholder-user.jpg";

  return (
    <div
      className={cn("flex w-full gap-3 p-4", {
        "justify-end": isUser,
      })}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={botAvatar} alt="AI Assistant" />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {settings?.shop_name?.[0] || <Bot className="h-4 w-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          "flex max-w-[80%] flex-col gap-2 rounded-lg px-4 py-3",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-muted-foreground dark:bg-muted/70"
        )}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({ node, ...props }) => (
                <a
                  {...props}
                  className="text-blue-600 dark:text-blue-400 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="text-xs opacity-50">
          {message.createdAt.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={userAvatar} alt="User" />
          <AvatarFallback className="bg-secondary">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
