"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Message, ChatContextValue } from "../types";
import {
  formatMessagesForGroq,
  generateAIResponse,
  generateSystemPrompt,
} from "../services";
import { getProductsForAIContext, logChatInteraction } from "../actions";
import { v4 as uuidv4 } from "uuid";
import { useAuthQuery } from "@/features/auth/hooks";

const SYSTEM_PROMPT_KEY = "mybeauty-ai-system-prompt";
const CHAT_HISTORY_KEY = "mybeauty-ai-chat-history";

export function useChat(): ChatContextValue {
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Lấy user từ TanStack Query
  const { data: sessionData } = useAuthQuery();
  const user = sessionData?.user;

  // Fetch products for AI context
  const { data: products, isPending: isPendingProducts } = useQuery({
    queryKey: ["ai-products"],
    queryFn: () => getProductsForAIContext(30),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Initialize system prompt and chat history
  useEffect(() => {
    if (products && !isInitialized) {
      const storedSystemPrompt = localStorage.getItem(SYSTEM_PROMPT_KEY);
      const newSystemPrompt = generateSystemPrompt(products);

      // Only update if the system prompt has changed
      if (storedSystemPrompt !== newSystemPrompt) {
        localStorage.setItem(SYSTEM_PROMPT_KEY, newSystemPrompt);
        setSystemPrompt(newSystemPrompt);
      } else {
        setSystemPrompt(storedSystemPrompt || newSystemPrompt);
      }

      // Load chat history from localStorage
      try {
        const storedMessages = localStorage.getItem(CHAT_HISTORY_KEY);
        if (storedMessages) {
          const parsedMessages = JSON.parse(storedMessages) as Message[];
          // Convert string dates back to Date objects
          const formattedMessages = parsedMessages.map((msg) => ({
            ...msg,
            createdAt: new Date(msg.createdAt),
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error loading chat history:", error);
        // If there's an error, start fresh
        localStorage.removeItem(CHAT_HISTORY_KEY);
      }

      setIsInitialized(true);
    }
  }, [products, isInitialized]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
    }
  }, [messages, isInitialized]);

  // AI response mutation
  const {
    mutateAsync: sendMessageMutation,
    isPending,
    error,
  } = useMutation({
    mutationFn: async (content: string) => {
      // Create a new user message
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content,
        createdAt: new Date(),
      };

      // Add user message to state
      setMessages((prev) => [...prev, userMessage]);

      // Prepare messages for the API, including system prompt
      const messagesForAPI = [
        { role: "system", content: systemPrompt },
        ...formatMessagesForGroq([...messages, userMessage]),
      ];

      // Get AI response
      const aiResponse = await generateAIResponse(messagesForAPI);

      // Create assistant message
      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: aiResponse,
        createdAt: new Date(),
      };

      // Add assistant message to state
      setMessages((prev) => [...prev, assistantMessage]);

      // Log the interaction for analytics
      await logChatInteraction(user?.id || null, content, aiResponse);

      return assistantMessage;
    },
  });

  // Send message function
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isPending) return;
      await sendMessageMutation(content);
    },
    [sendMessageMutation, isPending]
  );

  // Reset chat function
  const resetChat = useCallback(() => {
    setMessages([]);
    localStorage.removeItem(CHAT_HISTORY_KEY);
  }, []);

  return {
    messages,
    isLoading: isPending || isPendingProducts,
    error: error as Error,
    sendMessage,
    resetChat,
  };
}
