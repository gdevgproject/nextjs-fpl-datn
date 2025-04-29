"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  modelUsed?: string;
}

/**
 * Hook for managing AI search suggestions with robust rate limiting and model fallback
 *
 * @param initialQuery - Initial search query (default: empty string)
 * @param options - Additional options
 * @returns Object containing query, setQuery, suggestions, and related states
 */
export function useAISearchSuggestions(
  initialQuery = "",
  options = {
    enabled: true,
    debounceMs: 700, // Debounce time for query input
    minQueryLength: 2,
    requestCooldown: 1000, // Minimum time between requests
    maxRetryAttempts: 3,
    initialBackoff: 2000, // Start with 2 second backoff
  }
) {
  const [query, setQuery] = useState(initialQuery);
  const [isStale, setIsStale] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [backoffTime, setBackoffTime] = useState(options.initialBackoff);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [usingFallbackModel, setUsingFallbackModel] = useState(false);

  const lastRequestTime = useRef<number>(0);
  const pendingRequest = useRef<boolean>(false);
  const requestDelayTimeout = useRef<NodeJS.Timeout | null>(null);
  const retryCount = useRef<number>(0);
  const isMounted = useRef<boolean>(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Apply debounce to the query to prevent excessive API calls
  const debouncedQuery = useDebounce(query, options.debounceMs);

  // Reset states when query changes
  useEffect(() => {
    if (query !== debouncedQuery) {
      setIsStale(true);
      if (rateLimited) {
        setRateLimited(false);
        setErrorMessage(null);
      }
    }
  }, [query, debouncedQuery, rateLimited]);

  // Track component lifecycle and cleanup
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      // Clean up any pending requests/timeouts
      if (requestDelayTimeout.current) {
        clearTimeout(requestDelayTimeout.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Fetch suggestions implementation
  const fetchSuggestions = useCallback(
    async (searchQuery: string): Promise<AISearchResponse> => {
      // Skip if query is too short
      if (
        !searchQuery.trim() ||
        searchQuery.trim().length < options.minQueryLength
      ) {
        return { suggestions: [] };
      }

      // If we're rate limited, return empty results
      if (rateLimited) {
        return { suggestions: [], source: "rate_limited" };
      }

      // Set up abort controller for this request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      try {
        const response = await fetch("/api/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: searchQuery }),
          signal: abortControllerRef.current.signal,
        });

        // Handle non-OK responses
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));

          // Handle rate limiting specifically
          if (
            response.status === 429 ||
            (response.status === 500 &&
              errorData?.error?.includes("rate_limit"))
          ) {
            setRateLimited(true);
            setErrorMessage(
              "Đã đạt giới hạn tìm kiếm. Đang thử mô hình khác..."
            );

            // Implement exponential backoff with jitter
            const jitter = Math.random() * 1000;
            const waitTime =
              backoffTime * (1 << Math.min(retryCount.current, 3)) + jitter;
            retryCount.current++;

            // Auto-retry after backoff if under max attempts
            if (retryCount.current <= options.maxRetryAttempts) {
              if (requestDelayTimeout.current) {
                clearTimeout(requestDelayTimeout.current);
              }

              requestDelayTimeout.current = setTimeout(() => {
                if (isMounted.current) {
                  setRateLimited(false);
                  setErrorMessage(null);
                  refetch(); // Try again with a different model
                }
              }, waitTime);
            } else {
              setErrorMessage(
                "Tất cả mô hình đều đang bận. Vui lòng thử lại sau vài phút."
              );
            }

            return { suggestions: [], source: "rate_limited" };
          }

          // Other errors
          throw new Error(errorData?.error || `API Error: ${response.status}`);
        }

        // Successful response
        const result = await response.json();

        // Check if we're using fallback model
        if (result?.modelUsed) {
          const primaryModel =
            process.env.NEXT_PUBLIC_GROQ_PRIMARY_MODEL ||
            "meta-llama/llama-4-maverick-17b-128e-instruct";
          setUsingFallbackModel(result.modelUsed !== primaryModel);
        } else {
          setUsingFallbackModel(false);
        }

        // Reset error states on success
        retryCount.current = 0;
        setRateLimited(false);
        setErrorMessage(null);

        return result;
      } catch (err) {
        // Only set error if the request wasn't aborted
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          console.error("Error in AI search request:", err);
          setErrorMessage((err as Error).message || "Lỗi khi tìm kiếm");
        }
        return { suggestions: [] };
      }
    },
    [backoffTime, options.maxRetryAttempts, options.minQueryLength, rateLimited]
  );

  // Execute request with rate limiting
  const executeRequest = useCallback(async (): Promise<AISearchResponse> => {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime.current;

    // If we're making requests too quickly, delay this one
    if (timeSinceLastRequest < options.requestCooldown) {
      pendingRequest.current = true;

      return new Promise((resolve) => {
        // Clear any existing timeout
        if (requestDelayTimeout.current) {
          clearTimeout(requestDelayTimeout.current);
        }

        // Set a timeout to make the request after the cooldown period
        const delay = options.requestCooldown - timeSinceLastRequest;
        requestDelayTimeout.current = setTimeout(async () => {
          if (!isMounted.current) return;

          pendingRequest.current = false;
          lastRequestTime.current = Date.now();

          try {
            const result = await fetchSuggestions(debouncedQuery);
            resolve(result);
          } catch (err) {
            console.error("Error in delayed request:", err);
            resolve({ suggestions: [] });
          }
        }, delay);
      });
    }

    // Execute immediately if not rate limited
    pendingRequest.current = false;
    lastRequestTime.current = now;
    return fetchSuggestions(debouncedQuery);
  }, [debouncedQuery, fetchSuggestions, options.requestCooldown]);

  // Use TanStack Query to manage state and caching
  const { data, isLoading, isFetching, error, refetch } =
    useQuery<AISearchResponse>({
      queryKey: ["aiSearchSuggestions", debouncedQuery],
      queryFn: executeRequest,
      enabled:
        options.enabled &&
        Boolean(debouncedQuery.trim()) &&
        debouncedQuery.trim().length >= options.minQueryLength,
      staleTime: 1000 * 60, // Results remain "fresh" for 1 minute
      refetchOnWindowFocus: false,
      retry: false, // We handle retries manually for better control
    });

  // Mark results as stale when query changes
  useEffect(() => {
    if (debouncedQuery && data) {
      setIsStale(debouncedQuery !== query);
    } else {
      setIsStale(false);
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
    usingFallbackModel,
  };
}
