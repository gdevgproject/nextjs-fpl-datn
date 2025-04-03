"use client"

import { Calendar, Grid, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { useMediaQuery } from "@/hooks/use-media-query"

interface BannerViewToggleProps {
  view: "list" | "grid" | "calendar"
  onViewChange: (view: "list" | "grid" | "calendar") => void
}

export function BannerViewToggle({ view, onViewChange }: BannerViewToggleProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)")

  return (
    <ToggleGroup type="single" value={view} onValueChange={(value) => value && onViewChange(value as any)}>
      <ToggleGroupItem value="list" aria-label="Chế độ danh sách" title="Chế độ danh sách">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="grid" aria-label="Chế độ lưới" title="Chế độ lưới">
        <Grid className="h-4 w-4" />
      </ToggleGroupItem>
      {isDesktop && (
        <ToggleGroupItem value="calendar" aria-label="Chế độ lịch" title="Chế độ lịch">
          <Calendar className="h-4 w-4" />
        </ToggleGroupItem>
      )}
    </ToggleGroup>
  )
}

