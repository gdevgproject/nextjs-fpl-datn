"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  // During SSR, default to false to avoid hydration mismatch
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Only run on client
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query)

      // Set initial value
      setMatches(media.matches)

      // Setup listener for changes
      const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
      media.addEventListener("change", listener)

      // Cleanup
      return () => media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}

