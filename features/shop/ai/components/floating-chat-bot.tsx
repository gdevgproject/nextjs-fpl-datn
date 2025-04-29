"use client";
import { useState, useEffect } from "react";
import { X, MessageCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import Image from "next/image";
import { ChatProvider } from "./chat-provider";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingChatBot() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { settings } = useShopSettings();
  const logoUrl = settings?.shop_logo_url || "/placeholder-logo.png";

  // Tránh hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Ngăn cuộn trang khi chat đang mở trên mobile
  useEffect(() => {
    if (open && window.innerWidth < 768) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!mounted) return null;

  return (
    <>
      {/* Nút mở chat nổi với animation */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "fixed z-[100] bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8",
              "flex items-center gap-2 px-4 py-3 rounded-full",
              "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground",
              "shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30",
              "transition-all duration-300 ease-out",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
            )}
            aria-label="Mở chat với AI"
            onClick={() => setOpen(true)}
          >
            <div className="relative">
              <MessageCircle className="h-5 w-5" />
              {/* Hiệu ứng pulse */}
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-foreground opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-foreground"></span>
              </span>
            </div>
            <span className="font-medium text-sm hidden sm:inline-flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 mr-0.5" />
              Chat với AI
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Overlay khi chat mở */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[99] md:bg-transparent md:backdrop-blur-none"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Box chat nổi với animation */}
      <AnimatePresence>
        {open && (
          <div className="fixed z-[101] inset-0 flex items-end justify-center md:items-end md:justify-end pointer-events-none">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="pointer-events-auto w-full max-w-full sm:max-w-[95vw] md:max-w-md h-[85vh] md:h-[600px] bg-background dark:bg-zinc-900 rounded-t-2xl md:rounded-2xl shadow-2xl border border-primary/10 flex flex-col overflow-hidden mb-0 md:mb-8 md:mr-8"
            >
              {/* Header với gradient và blur */}
              <div className="flex items-center justify-between gap-2 px-4 py-3 border-b bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                    <Image
                      src={logoUrl || "/placeholder.svg"}
                      alt="Shop Logo"
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover border border-primary/30 relative z-10"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-base flex items-center">
                      MyBeauty AI
                      <Sparkles className="h-3.5 w-3.5 ml-1 text-primary" />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Trợ lý mua sắm thông minh
                    </span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  className="rounded-full p-1.5 hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Đóng chat bot"
                  onClick={() => setOpen(false)}
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              {/* Nội dung chat */}
              <ChatProvider>
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  <ChatMessages />
                  <ChatInput />
                </div>
              </ChatProvider>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
