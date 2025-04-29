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
    debounceMs: 700, // Increased from 400ms to 700ms to reduce frequency
    minQueryLength: 2,
    requestCooldown: 1000, // Increased from 250ms to 1000ms
    maxRetryAttempts: 3,
    initialBackoff: 2000, // Start with 2 second backoff
  }
) {
  const [query, setQuery] = useState(initialQuery);
  const [isStale, setIsStale] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [backoffTime, setBackoffTime] = useState(options.initialBackoff);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const lastRequestTime = useRef<number>(0);
  const pendingRequest = useRef<boolean>(false);
  const requestDelayTimeout = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef<number>(0);
  const isMounted = useRef<boolean>(true);

  // Apply debounce to the query to prevent excessive API calls
  const debouncedQuery = useDebounce(query, options.debounceMs);

  // Reset rate limited status when query changes
  useEffect(() => {
    if (query !== debouncedQuery) {
      setRateLimited(false);
    }
  }, [query, debouncedQuery]);

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

        // If we've hit rate limits, don't make more requests immediately
        if (rateLimited) {
          return {
            suggestions: [],
            source: "rate_limited",
          };
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
                  // Handle rate limiting specifically
                  if (response.status === 429 || response.status === 500) {
                    const errorData = await response.json();
                    if (errorData?.error?.code === "rate_limit_exceeded") {
                      setRateLimited(true);
                      setErrorMessage(
                        "Đã đạt giới hạn tìm kiếm. Vui lòng đợi một lát và thử lại."
                      );

                      // Implement exponential backoff
                      const waitTime =
                        backoffTime * (1 << Math.min(retryCount.current, 3));
                      retryCount.current++;

                      // Auto-retry after backoff if under max attempts
                      if (retryCount.current <= options.maxRetryAttempts) {
                        setTimeout(() => {
                          if (isMounted.current) {
                            setRateLimited(false);
                            setErrorMessage(null);
                          }
                        }, waitTime);
                      }

                      return {
                        suggestions: [],
                        source: "rate_limited",
                      };
                    }
                  }
                  throw new Error(`API Error: ${response.status}`);
                }

                // Reset retry count on success
                retryCount.current = 0;
                setRateLimited(false);
                setErrorMessage(null);

                const result = await response.json();
                return result;
              } catch (err) {
                console.error("Error in delayed AI search request:", err);
                setErrorMessage((err as Error).message || "Lỗi khi tìm kiếm");
                return { suggestions: [] };
              }
            }, options.requestCooldown - timeSinceLastRequest);
          });
        }

        // Normal request flow
        pendingRequest.current = false;
        lastRequestTime.current = now;

        try {
          const response = await fetch("/api/ai-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: debouncedQuery }),
          });

          if (!response.ok) {
            // Handle rate limiting specifically
            if (response.status === 429 || response.status === 500) {
              const errorData = await response.json();
              if (errorData?.error?.code === "rate_limit_exceeded") {
                setRateLimited(true);
                setErrorMessage(
                  "Đã đạt giới hạn tìm kiếm. Vui lòng đợi một lát và thử lại."
                );

                // Implement exponential backoff
                const waitTime =
                  backoffTime * (1 << Math.min(retryCount.current, 3));
                retryCount.current++;

                // Auto-retry after backoff if under max attempts
                if (retryCount.current <= options.maxRetryAttempts) {
                  setTimeout(() => {
                    if (isMounted.current) {
                      setRateLimited(false);
                      setErrorMessage(null);
                    }
                  }, waitTime);
                }

                return {
                  suggestions: [],
                  source: "rate_limited",
                };
              }
            }
            throw new Error(`API Error: ${response.status}`);
          }

          // Reset retry count on success
          retryCount.current = 0;
          setRateLimited(false);
          setErrorMessage(null);

          return await response.json();
        } catch (err) {
          console.error("Error in AI search request:", err);
          setErrorMessage((err as Error).message || "Lỗi khi tìm kiếm");
          return { suggestions: [] };
        }
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
    error: errorMessage || (error ? (error as Error).message : null),
    refetch,
    formatPrice,
    rateLimited,
  };
}
