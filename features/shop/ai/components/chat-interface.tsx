"use client";
import { ChatProvider } from "./chat-provider";
import { ChatMessages } from "./chat-messages";
import { ChatInput } from "./chat-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";
import Image from "next/image";

export function ChatInterface() {
  const { settings } = useShopSettings();
  const logoUrl = settings?.shop_logo_url || "/placeholder-logo.png";
  return (
    <ChatProvider>
      <Card className="flex h-[80vh] flex-col overflow-hidden">
        <CardHeader className="border-b bg-muted/50 px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Image
              src={logoUrl}
              alt="Shop Logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-full object-cover"
            />
            MyBeauty AI
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <ChatMessages />
          <ChatInput />
        </CardContent>
      </Card>
    </ChatProvider>
  );
}
