"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "@/lib/hooks/use-debounce";

export interface ProductSuggestion {
  id: number;
  name: string;
  slug: string;
  image_url: string;
  price: number;
  sale_price: number | null;
  brand_name: string;
  relevance?: string;
}

interface AISearchResponse {
  suggestions: ProductSuggestion[];
  source?: string;
  timestamp?: number;
}

/**
 * Hook for managing AI search suggestions with rate limiting
 *
 * @param initialQuery - Initial search query (default: empty string)
 * @param options - Additional options
 * @returns Object containing query, setQuery, suggestions, and related states
 */
export function useAISearchSuggestions(
  initialQuery = "",
  options = {
    enabled: true,
    debounceMs: 400,
    minQueryLength: 2,
    requestCooldown: 250, // Minimum time between actual requests (ms)
  }
) {
  const [query, setQuery] = useState(initialQuery);
  const [isStale, setIsStale] = useState(false);
  const lastRequestTime = useRef<number>(0);
  const pendingRequest = useRef<boolean>(false);
  const requestDelayTimeout = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef<boolean>(true);

  // Apply debounce to the query to prevent excessive API calls
  const debouncedQuery = useDebounce(query, options.debounceMs);

  // Track component lifecycle
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (requestDelayTimeout.current) {
        clearTimeout(requestDelayTimeout.current);
      }
    };
  }, []);

  // Use TanStack Query to manage state and caching
  const { data, isLoading, isFetching, error, refetch } =
    useQuery<AISearchResponse>({
      queryKey: ["aiSearchSuggestions", debouncedQuery],
      queryFn: async () => {
        // Skip if query is too short
        if (
          !debouncedQuery.trim() ||
          debouncedQuery.trim().length < options.minQueryLength
        ) {
          return { suggestions: [] };
        }

        // Rate limiting check
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime.current;

        if (timeSinceLastRequest < options.requestCooldown) {
          // If we're making requests too quickly, delay this one
          pendingRequest.current = true;

          return new Promise((resolve) => {
            // Clear any existing timeout
            if (requestDelayTimeout.current) {
              clearTimeout(requestDelayTimeout.current);
            }

            // Set a timeout to make the request after the cooldown period
            requestDelayTimeout.current = setTimeout(async () => {
              if (!isMounted.current) return;

              pendingRequest.current = false;
              lastRequestTime.current = Date.now();

              try {
                const response = await fetch("/api/ai-search", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ query: debouncedQuery }),
                });

                if (!response.ok) {
                  throw new Error(`API Error: ${response.status}`);
                }

                const result = await response.json();
                resolve(result);
              } catch (err) {
                console.error("Error in delayed AI search request:", err);
                resolve({ suggestions: [] });
              }
            }, options.requestCooldown - timeSinceLastRequest);
          });
        }

        // Normal request flow
        pendingRequest.current = false;
        lastRequestTime.current = now;

        const response = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: debouncedQuery }),
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }

        return await response.json();
      },
      enabled:
        options.enabled &&
        Boolean(debouncedQuery.trim()) &&
        debouncedQuery.trim().length >= options.minQueryLength,
      staleTime: 1000 * 60, // Results remain "fresh" for 1 minute
      refetchOnWindowFocus: false,
      retry: false, // Don't retry failed requests to avoid API rate limits
    });

  // Mark results as stale when query changes
  useEffect(() => {
    if (debouncedQuery && data) {
      setIsStale(debouncedQuery !== query);
    }
  }, [debouncedQuery, query, data]);

  // Helper for formatting prices
  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  return {
    query,
    setQuery,
    debouncedQuery,
    suggestions: data?.suggestions || [],
    isLoading: isLoading || isFetching || pendingRequest.current,
    isStale,
    error: error ? (error as Error).message : null,
    refetch,
    formatPrice,
  };
}
