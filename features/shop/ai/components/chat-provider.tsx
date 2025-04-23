"use client"

import { createContext, useContext, type ReactNode } from "react"
import { useChat } from "../hooks/use-chat"
import type { ChatContextValue } from "../types"

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const chatValue = useChat()

  return <ChatContext.Provider value={chatValue}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider")
  }
  return context
}
