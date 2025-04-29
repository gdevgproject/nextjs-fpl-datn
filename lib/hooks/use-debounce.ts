"use client";

import { useState, useEffect } from "react";

/**
 * A custom hook that returns a debounced value after a specified delay.
 * Useful for search inputs to prevent excessive API calls while typing.
 *
 * @template T - The type of the value to debounce
 * @param {T} value - The value to debounce
 * @param {number} delay - The delay in milliseconds
 * @returns {T} The debounced value
 *
 * @example
 * // Use in a search component
 * const [searchTerm, setSearchTerm] = useState('');
 * const debouncedSearchTerm = useDebounce(searchTerm, 500);
 *
 * // Only perform search when debouncedSearchTerm changes
 * useEffect(() => {
 *   if (debouncedSearchTerm) {
 *     performSearch(debouncedSearchTerm);
 *   }
 * }, [debouncedSearchTerm]);
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set a timer to update the debounced value after the specified delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timer if the value changes before the delay has passed
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
