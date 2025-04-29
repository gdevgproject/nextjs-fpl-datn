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
import { useProfileQuery } from "@/features/auth/hooks";
import { useCartQuery } from "@/features/shop/cart/use-cart";
import { useWishlist } from "@/features/shop/wishlist/hooks/use-wishlist";
import { useShopSettings } from "@/features/shop/shared/hooks/use-shop-settings";

const SYSTEM_PROMPT_KEY = "mybeauty-ai-system-prompt";
const CHAT_HISTORY_KEY = "mybeauty-ai-chat-history";

export function useChat(): ChatContextValue {
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);

  // Lấy context cá nhân hóa
  const { data: sessionData } = useAuthQuery();
  const user = sessionData?.user;
  const { isLoading: isProfileLoading, data: profile } = useProfileQuery(
    user?.id
  );
  const { isLoading: isCartLoading, data: cartItems = [] } = useCartQuery();
  const { isLoading: isWishlistLoading, wishlistItems = [] } = useWishlist();
  const { isLoading: isShopSettingsLoading, settings: shopSettings } =
    useShopSettings();

  // Fetch products for AI context
  const { data: products, isPending: isPendingProducts } = useQuery({
    queryKey: ["ai-products"],
    queryFn: () => getProductsForAIContext(30),
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Initialize system prompt and chat history
  useEffect(() => {
    // Chỉ khởi tạo khi tất cả context đã load xong
    if (
      products &&
      !isInitialized &&
      !isProfileLoading &&
      !isCartLoading &&
      !isWishlistLoading &&
      !isShopSettingsLoading
    ) {
      const storedSystemPrompt = localStorage.getItem(SYSTEM_PROMPT_KEY);
      const newSystemPrompt = generateSystemPrompt(
        products,
        profile,
        cartItems,
        wishlistItems,
        shopSettings
      );

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
  }, [
    products,
    isInitialized,
    profile,
    cartItems,
    wishlistItems,
    shopSettings,
    isProfileLoading,
    isCartLoading,
    isWishlistLoading,
    isShopSettingsLoading,
  ]);

  // Luôn cập nhật lại systemPrompt khi context thay đổi (kể cả sau khi đã init)
  useEffect(() => {
    if (
      products &&
      isInitialized &&
      !isProfileLoading &&
      !isCartLoading &&
      !isWishlistLoading &&
      !isShopSettingsLoading
    ) {
      const newSystemPrompt = generateSystemPrompt(
        products,
        profile,
        cartItems,
        wishlistItems,
        shopSettings
      );
      setSystemPrompt(newSystemPrompt);
      localStorage.setItem(SYSTEM_PROMPT_KEY, newSystemPrompt);
    }
  }, [
    products,
    profile,
    cartItems,
    wishlistItems,
    shopSettings,
    isInitialized,
    isProfileLoading,
    isCartLoading,
    isWishlistLoading,
    isShopSettingsLoading,
  ]);

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
    reset: resetMutation,
    isSuccess,
  } = useMutation({
    mutationFn: async (content: string) => {
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      const messagesForAPI = [
        { role: "system", content: systemPrompt },
        ...formatMessagesForGroq([...messages, userMessage]),
      ];
      let assistantId = uuidv4();
      let lastContent = "";
      await generateAIResponse(messagesForAPI, (partial) => {
        lastContent = partial;
        setMessages((prev) => {
          // Nếu đã có assistant message tạm thời, update nó
          if (prev[prev.length - 1]?.role === "assistant") {
            return [
              ...prev.slice(0, -1),
              { ...prev[prev.length - 1], content: partial },
            ];
          }
          // Nếu chưa có, thêm mới
          return [
            ...prev,
            {
              id: assistantId,
              role: "assistant",
              content: partial,
              createdAt: new Date(),
            },
          ];
        });
      });

      // Log interaction nhưng KHÔNG đợi nó hoàn thành
      // Sử dụng void để báo hiệu chúng ta không quan tâm đến Promise này
      void logChatInteraction(user?.id || null, content, lastContent);

      return { content: lastContent };
    },
    onSettled: () => {
      resetMutation();
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
    // Cập nhật lại systemPrompt khi dọn chat
    if (
      products &&
      !isProfileLoading &&
      !isCartLoading &&
      !isWishlistLoading &&
      !isShopSettingsLoading
    ) {
      const newSystemPrompt = generateSystemPrompt(
        products,
        profile,
        cartItems,
        wishlistItems,
        shopSettings
      );
      setSystemPrompt(newSystemPrompt);
      localStorage.setItem(SYSTEM_PROMPT_KEY, newSystemPrompt);
    }
  }, [
    products,
    profile,
    cartItems,
    wishlistItems,
    shopSettings,
    isProfileLoading,
    isCartLoading,
    isWishlistLoading,
    isShopSettingsLoading,
  ]);

  return {
    messages,
    isLoading: isPending || isPendingProducts,
    error: error as Error,
    sendMessage,
    resetChat,
  };
}
