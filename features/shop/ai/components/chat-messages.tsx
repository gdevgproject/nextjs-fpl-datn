"use client";

import { useEffect, useRef, useState } from "react";
import { MessageBubble } from "./message-bubble";
import { useChatContext } from "./chat-provider";
import { Sparkles } from "lucide-react";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function ChatMessages() {
  const { messages, isLoading, sendMessage } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showTyping, setShowTyping] = useState(false);
  const { settings } = useShopSettings();
  const logoUrl = settings?.shop_logo_url || "/placeholder-logo.png";
  const shopName = settings?.shop_name || "MyBeauty";

  // Tắt typing ngay khi có message assistant mới
  useEffect(() => {
    if (messages.length === 0) {
      setShowTyping(false);
      return;
    }
    const lastMsg = messages[messages.length - 1];
    if (isLoading && lastMsg.role !== "assistant") {
      setShowTyping(true);
    } else {
      setShowTyping(false);
    }
  }, [isLoading, messages]);

  // Auto scroll khi có tin nhắn mới hoặc loading
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // If no messages, show welcome message
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-8 text-center select-none min-h-0 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            damping: 20,
            stiffness: 300,
            delay: 0.1,
          }}
          className="relative"
        >
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
          <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-4 mb-4 shadow-lg relative">
            <Image
              src={logoUrl || "/placeholder.svg"}
              alt="AI Beauty Advisor"
              width={80}
              height={80}
              className="h-20 w-20 rounded-full object-cover border-2 border-primary/30 shadow-inner"
              priority
            />
            <motion.div
              className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full p-1"
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                duration: 1.5,
              }}
            >
              <Sparkles className="h-4 w-4" />
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="mt-2 text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Chào mừng đến với {shopName} AI
          </h2>
          <p className="mt-2 text-muted-foreground max-w-md mx-auto">
            Tôi là trợ lý ảo của {shopName}, sẵn sàng giúp bạn tìm kiếm nước hoa
            phù hợp với sở thích của bạn.
          </p>
        </motion.div>

        <motion.div
          className="mt-6 grid gap-2 grid-cols-2 sm:grid-cols-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <SuggestionButton text="Nước hoa nam phổ biến?" />
          <SuggestionButton text="Nước hoa mùa hè?" />
          <SuggestionButton text="Nước hoa lưu hương lâu?" />
          <SuggestionButton text="Nước hoa dưới 1 triệu?" />
          <SuggestionButton text="Nước hoa hương gỗ?" />
          <SuggestionButton text="Nước hoa cho buổi hẹn hò?" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4 scroll-smooth">
      <AnimatePresence initial={false}>
        {messages.map((message, index) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MessageBubble
              message={message}
              isSequential={
                index > 0 && messages[index - 1].role === message.role
              }
            />
          </motion.div>
        ))}

        {showTyping && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
          >
            <BotTypingBubble logoUrl={logoUrl} />
          </motion.div>
        )}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
}

function BotTypingBubble({ logoUrl }: { logoUrl: string }) {
  return (
    <div className="flex w-full gap-2 items-end">
      <div className="h-8 w-8 rounded-full border border-primary/30 shadow-sm overflow-hidden flex items-center justify-center bg-white dark:bg-muted">
        <Image
          src={logoUrl || "/placeholder.svg"}
          alt="AI Assistant"
          width={32}
          height={32}
          className="h-8 w-8 object-cover"
        />
      </div>
      <div className="flex flex-col max-w-[70%] bg-gradient-to-br from-muted/80 to-muted/50 backdrop-blur-sm text-muted-foreground border border-primary/10 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-1.5">
          <motion.span
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.5,
              ease: "easeInOut",
            }}
            className="block h-2 w-2 rounded-full bg-primary"
          />
          <motion.span
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.2,
            }}
            className="block h-2 w-2 rounded-full bg-primary"
          />
          <motion.span
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.5,
              ease: "easeInOut",
              delay: 0.4,
            }}
            className="block h-2 w-2 rounded-full bg-primary"
          />
          <span className="text-xs text-muted-foreground ml-1">
            AI đang trả lời...
          </span>
        </div>
      </div>
    </div>
  );
}

function SuggestionButton({ text }: { text: string }) {
  const { sendMessage } = useChatContext();

  return (
    <button
      onClick={() => sendMessage(text)}
      className={cn(
        "rounded-lg border bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30 px-3 py-2 text-sm",
        "hover:bg-primary/10 dark:hover:bg-primary/20 hover:border-primary/30 dark:hover:border-primary/40 hover:shadow-sm",
        "transition-all duration-200 text-primary dark:text-primary-foreground",
        "flex items-center justify-center gap-1.5"
      )}
    >
      <Sparkles className="h-3 w-3 text-primary" />
      <span className="line-clamp-2 text-center text-xs">{text}</span>
    </button>
  );
}
