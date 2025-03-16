"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <ThemeProvider>
      <div className="error-container">
        <h2>Something went wrong!</h2>
        <Button onClick={() => reset()}>Try again</Button>
      </div>
    </ThemeProvider>
  )
}

