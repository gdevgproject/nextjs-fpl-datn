"use client"

import { Share2, Grid, List, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useToast } from "@/components/ui/use-toast"

interface WishlistHeaderProps {
  itemCount: number
  viewMode: "grid" | "list"
  onViewModeChange: (mode: "grid" | "list") => void
}

export function WishlistHeader({ itemCount, viewMode, onViewModeChange }: WishlistHeaderProps) {
  const isMobile = useMediaQuery("(max-width: 768px)")
  const { toast } = useToast()

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Danh sách yêu thích của tôi tại MyBeauty",
          text: "Xem danh sách nước hoa yêu thích của tôi tại MyBeauty",
          url: window.location.href,
        })
      } catch (error) {
        console.error("Lỗi khi chia sẻ:", error)
      }
    } else {
      // Fallback cho các trình duyệt không hỗ trợ Web Share API
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Đã sao chép liên kết",
        description: "Liên kết đến danh sách yêu thích đã được sao chép vào clipboard",
      })
    }
  }

  const handleExport = () => {
    toast({
      title: "Xuất danh sách",
      description: "Tính năng xuất danh sách yêu thích đang được phát triển",
    })
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Sản phẩm yêu thích</h2>
        <p className="text-muted-foreground">
          {itemCount > 0
            ? `Bạn có ${itemCount} sản phẩm trong danh sách yêu thích`
            : "Quản lý danh sách sản phẩm yêu thích của bạn"}
        </p>
      </div>

      {itemCount > 0 && (
        <div className="flex items-center gap-2">
          {!isMobile && (
            <div className="flex items-center border rounded-md p-1">
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${viewMode === "grid" ? "bg-muted" : ""}`}
                onClick={() => onViewModeChange("grid")}
                aria-label="Xem dạng lưới"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-8 w-8 ${viewMode === "list" ? "bg-muted" : ""}`}
                onClick={() => onViewModeChange("list")}
                aria-label="Xem dạng danh sách"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Chia sẻ</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Chia sẻ danh sách
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExport}>
                <Download className="mr-2 h-4 w-4" />
                Xuất danh sách
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

