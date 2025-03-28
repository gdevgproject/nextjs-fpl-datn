"use client"

import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Tránh hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Chuyển đổi giao diện</span>
      </Button>
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 transition-all duration-200 hover:bg-accent"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Moon className="h-4 w-4 transition-all" /> : <Sun className="h-4 w-4 transition-all" />}
      <span className="sr-only">Chuyển đổi giao diện</span>
    </Button>
  )
}

