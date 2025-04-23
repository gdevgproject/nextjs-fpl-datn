"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "./message-bubble";
import { useChatContext } from "./chat-provider";
import { Loader2 } from "lucide-react";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import Image from "next/image";

export function ChatMessages() {
  const { messages, isLoading } = useChatContext();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { settings } = useShopSettings();
  const logoUrl = settings?.shop_logo_url || "/placeholder-logo.png";

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // If no messages, show welcome message
  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center p-8 text-center select-none min-h-0">
        <div className="rounded-full bg-primary/10 p-4 mb-4 shadow-lg animate-fade-in">
          <Image
            src={logoUrl}
            alt="AI Beauty Advisor"
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover border border-primary shadow"
            priority
          />
        </div>
        <h2 className="mt-2 text-2xl font-bold tracking-tight">
          Chào mừng đến với MyBeauty AI
        </h2>
        <p className="mt-2 text-muted-foreground max-w-md mx-auto">
          Tôi là trợ lý ảo của MyBeauty, sẵn sàng giúp bạn tìm kiếm nước hoa phù
          hợp với sở thích của bạn.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          <SuggestionButton text="Nước hoa nam phổ biến?" />
          <SuggestionButton text="Nước hoa mùa hè?" />
          <SuggestionButton text="Nước hoa lưu hương lâu?" />
          <SuggestionButton text="Nước hoa dưới 1 triệu?" />
          <SuggestionButton text="Nước hoa hương gỗ?" />
          <SuggestionButton text="Nước hoa cho buổi hẹn hò?" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}

function SuggestionButton({ text }: { text: string }) {
  const { sendMessage } = useChatContext();

  return (
    <button
      onClick={() => sendMessage(text)}
      className="rounded-lg border bg-background px-3 py-2 text-sm hover:bg-muted"
    >
      {text}
    </button>
  );
}
