"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
// Limit how often we save to localStorage during streaming
const SAVE_DEBOUNCE_MS = 1000;

export function useChat(): ChatContextValue {
  const [messages, setMessages] = useState<Message[]>([]);
  const [systemPrompt, setSystemPrompt] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState(false);
  // Use refs to track streaming state without triggering re-renders
  const streamingRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Debounced save to localStorage
  const debounceSaveMessages = useCallback((messagesToSave: Message[]) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set a new timeout
    saveTimeoutRef.current = setTimeout(() => {
      if (messagesToSave.length > 0) {
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messagesToSave));
      }
      saveTimeoutRef.current = null;
    }, SAVE_DEBOUNCE_MS);
  }, []);

  // Save messages to localStorage when they change, but not during streaming
  useEffect(() => {
    if (isInitialized && messages.length > 0 && !streamingRef.current) {
      debounceSaveMessages(messages);
    }

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [messages, isInitialized, debounceSaveMessages]);

  // AI response mutation
  const {
    mutateAsync: sendMessageMutation,
    isPending,
    error,
    reset: resetMutation,
  } = useMutation({
    mutationFn: async (content: string) => {
      // Create user message
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content,
        createdAt: new Date(),
      };

      // Add user message to state
      setMessages((prev) => {
        const updatedMessages = [...prev, userMessage];
        // Save immediately when adding user message
        localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(updatedMessages));
        return updatedMessages;
      });

      // Prepare AI response
      const messagesForAPI = [
        { role: "system", content: systemPrompt },
        ...formatMessagesForGroq([...messages, userMessage]),
      ];

      const assistantId = uuidv4();
      let lastContent = "";

      // Mark that we're starting to stream
      streamingRef.current = true;

      try {
        // Stream response
        await generateAIResponse(messagesForAPI, (partial) => {
          lastContent = partial;

          setMessages((prev) => {
            // Find if we already have an assistant message
            const lastIndex = prev.findIndex((msg) => msg.id === assistantId);

            if (lastIndex !== -1) {
              // Update existing message
              const updated = [...prev];
              updated[lastIndex] = {
                ...updated[lastIndex],
                content: partial,
              };

              // Debounced save during streaming to reduce writes
              debounceSaveMessages(updated);

              return updated;
            } else {
              // Create new assistant message if not exists
              const updatedMessages = [
                ...prev,
                {
                  id: assistantId,
                  role: "assistant",
                  content: partial,
                  createdAt: new Date(),
                },
              ];

              // Debounced save
              debounceSaveMessages(updatedMessages);

              return updatedMessages;
            }
          });
        });

        // Log chat interaction in the background
        void logChatInteraction(user?.id || null, content, lastContent);

        return { content: lastContent };
      } finally {
        // Always mark streaming as complete, even if there was an error
        streamingRef.current = false;

        // Final save to ensure we have the complete message
        setMessages((currentMessages) => {
          localStorage.setItem(
            CHAT_HISTORY_KEY,
            JSON.stringify(currentMessages)
          );
          return currentMessages;
        });
      }
    },
    onSettled: () => {
      // Safe to reset mutation state after completion
      setTimeout(() => resetMutation(), 100);
    },
  });

  // Send message function
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isPending || streamingRef.current) return;
      await sendMessageMutation(content);
    },
    [sendMessageMutation, isPending]
  );

  // Reset chat function
  const resetChat = useCallback(() => {
    // Clean up any pending operations
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

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
