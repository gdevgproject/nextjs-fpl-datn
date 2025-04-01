"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Grid, List } from "lucide-react"

export function ProductViewToggle() {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <div className="flex items-center space-x-1 border rounded-md">
      <Button
        variant={view === "grid" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8 rounded-none rounded-l-md"
        onClick={() => setView("grid")}
        aria-label="Grid view"
      >
        <Grid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === "list" ? "secondary" : "ghost"}
        size="icon"
        className="h-8 w-8 rounded-none rounded-r-md"
        onClick={() => setView("list")}
        aria-label="List view"
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  )
}

