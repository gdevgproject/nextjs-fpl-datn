"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ExternalLink, MousePointerClick, Eye } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface BannerPreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  banner: any
}

export function BannerPreviewDialog({ open, onOpenChange, banner }: BannerPreviewDialogProps) {
  if (!banner) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Xem trước banner</DialogTitle>
          <DialogDescription>Xem trước banner trước khi hiển thị trên trang web</DialogDescription>
        </DialogHeader>
        <div className="p-6 space-y-4">
          <div className="relative w-full h-[300px] rounded-md overflow-hidden">
            <Image src={banner.image_url || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold">{banner.title}</h3>
              <p className="text-muted-foreground mt-1">{banner.subtitle}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={banner.is_active ? "outline" : "secondary"}>
                {banner.is_active ? "Đang hoạt động" : "Không hoạt động"}
              </Badge>
              <div className="text-sm text-muted-foreground">Thứ tự: {banner.display_order}</div>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                {format(new Date(banner.start_date), "dd MMMM yyyy", { locale: vi })} -{" "}
                {format(new Date(banner.end_date), "dd MMMM yyyy", { locale: vi })}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center text-sm">
                <Eye className="h-4 w-4 mr-1" />
                {banner.impressions?.toLocaleString() || 0} lượt xem
              </div>
              <div className="flex items-center text-sm">
                <MousePointerClick className="h-4 w-4 mr-1" />
                {banner.clicks?.toLocaleString() || 0} lượt nhấp
              </div>
              {banner.impressions > 0 && (
                <div className="text-sm">CTR: {((banner.clicks / banner.impressions) * 100).toFixed(1)}%</div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium mb-1">Liên kết</h4>
              <a
                href={banner.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center"
              >
                {banner.link_url}
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Đóng
              </Button>
              <Link href={`/admin/banner/${banner.id}`}>
                <Button>Chỉnh sửa</Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

