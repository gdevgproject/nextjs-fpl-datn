"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)

    // Cập nhật state ban đầu
    setMatches(media.matches)

    // Callback khi media query thay đổi
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Đăng ký listener
    media.addEventListener("change", listener)

    // Cleanup
    return () => {
      media.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}

