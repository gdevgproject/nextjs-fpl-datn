"use client";
import { useState } from "react";
import { X, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import Image from "next/image";
import { ChatProvider } from "./chat-provider";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";

export function FloatingChatBot() {
  const [open, setOpen] = useState(false);
  const { settings } = useShopSettings();
  const logoUrl = settings?.shop_logo_url || "/placeholder-logo.png";

  return (
    <>
      {/* Nút mở chat nổi */}
      <button
        className={cn(
          "fixed z-[100] bottom-4 right-2 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 rounded-full shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all focus:outline-none",
          open && "pointer-events-none opacity-0"
        )}
        aria-label="Mở chat với AI"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-5 w-5 mr-1" />
        <span className="font-semibold hidden sm:inline">Chat với AI</span>
      </button>

      {/* Box chat nổi */}
      {open && (
        <div className="fixed z-[101] inset-0 flex items-end justify-center md:items-end md:justify-end pointer-events-none">
          <div
            className="pointer-events-auto w-full max-w-full sm:max-w-[95vw] md:max-w-md bg-white dark:bg-[#18181b] rounded-t-2xl md:rounded-2xl shadow-2xl border border-primary/10 flex flex-col overflow-hidden animate-fade-in-up mb-0 md:mb-8 md:mr-8"
            style={{ maxHeight: "90vh", height: "auto" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-gradient-to-r from-primary/10 to-primary/20">
              <div className="flex items-center gap-2">
                <Image
                  src={logoUrl}
                  alt="Shop Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover border border-primary"
                />
                <span className="font-semibold text-base">MyBeauty AI</span>
              </div>
              <button
                className="rounded-full p-1 hover:bg-muted transition"
                aria-label="Đóng chat bot"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Nội dung chat */}
            <ChatProvider>
              <div className="flex-1 flex flex-col min-h-0">
                <ChatMessages />
                <ChatInput />
              </div>
            </ChatProvider>
          </div>
        </div>
      )}
    </>
  );
}
