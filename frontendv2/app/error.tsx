"use client"

import { Button } from "@/components/ui/Button"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { useEffect } from "react"

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
