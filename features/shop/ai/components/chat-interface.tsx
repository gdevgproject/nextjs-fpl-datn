"use client"
import { ChatProvider } from "./chat-provider"
import { ChatMessages } from "./chat-messages"
import { ChatInput } from "./chat-input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Bot } from "lucide-react"

export function ChatInterface() {
  return (
    <ChatProvider>
      <Card className="flex h-[80vh] flex-col overflow-hidden">
        <CardHeader className="border-b bg-muted/50 px-4 py-3">
          <CardTitle className="flex items-center gap-2 text-lg font-medium">
            <Bot className="h-5 w-5 text-primary" />
            MyBeauty AI
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
          <ChatMessages />
          <ChatInput />
        </CardContent>
      </Card>
    </ChatProvider>
  )
}
