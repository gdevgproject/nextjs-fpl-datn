"use client"
import Image from "next/image"
import Link from "next/link"
import { Calendar, Edit, Eye, MousePointerClick, Trash2, Check, X } from "lucide-react"

import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BannerStatusBadge } from "./banner-status-badge"
import { BannerDeleteDialog } from "./banner-delete-dialog"
import { BannerPreviewDialog } from "./banner-preview-dialog"

interface BannerGridViewProps {
  banners: any[]
  selectedBanners: string[]
  onBannerSelect: (bannerId: string, isSelected: boolean) => void
  onSelectAll: (isSelected: boolean) => void
  onDelete: (id: string) => void
  onPreview: (banner: any) => void
  onStatusToggle: (bannerId: string, newStatus: boolean) => void
  areAllSelected: boolean
  deleteDialogOpen: boolean
  setDeleteDialogOpen: (open: boolean) => void
  handleDeleteConfirm: () => void
  previewDialogOpen: boolean
  setPreviewDialogOpen: (open: boolean) => void
  previewBanner: any
}

export function BannerGridView({
  banners,
  selectedBanners,
  onBannerSelect,
  onSelectAll,
  onDelete,
  onPreview,
  onStatusToggle,
  areAllSelected,
  deleteDialogOpen,
  setDeleteDialogOpen,
  handleDeleteConfirm,
  previewDialogOpen,
  setPreviewDialogOpen,
  previewBanner,
}: BannerGridViewProps) {
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Checkbox id="select-all-grid" checked={areAllSelected} onCheckedChange={onSelectAll} />
        <label htmlFor="select-all-grid" className="ml-2 text-sm font-medium">
          Chọn tất cả
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {banners.map((banner) => (
          <Card
            key={banner.id}
            className={`overflow-hidden ${selectedBanners.includes(banner.id) ? "border-primary" : ""}`}
          >
            <div className="relative">
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedBanners.includes(banner.id)}
                  onCheckedChange={(checked) => onBannerSelect(banner.id, !!checked)}
                  className="bg-white/80"
                />
              </div>
              <div className="absolute top-2 right-2 z-10">
                <BannerStatusBadge banner={banner} />
              </div>
              <div className="h-48 relative">
                <Image src={banner.image_url || "/placeholder.svg"} alt={banner.title} fill className="object-cover" />
              </div>
            </div>
            <CardContent className="p-4">
              <h3 className="font-semibold truncate">{banner.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{banner.subtitle}</p>

              <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(banner.start_date).toLocaleDateString("vi-VN")} -{" "}
                  {new Date(banner.end_date).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <div className="flex items-center">
                  <Eye className="h-3 w-3 mr-1" />
                  {banner.impressions.toLocaleString()}
                </div>
                <div className="flex items-center">
                  <MousePointerClick className="h-3 w-3 mr-1" />
                  {banner.clicks.toLocaleString()}
                </div>
                <div>CTR: {((banner.clicks / banner.impressions) * 100).toFixed(1)}%</div>
              </div>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex flex-wrap gap-2">
              <Button
                variant={banner.is_active ? "outline" : "default"}
                size="sm"
                className="flex-1"
                onClick={() => onStatusToggle(banner.id, !banner.is_active)}
              >
                {banner.is_active ? (
                  <>
                    <X className="h-3.5 w-3.5 mr-1" />
                    Vô hiệu hóa
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Kích hoạt
                  </>
                )}
              </Button>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => onPreview(banner)}>
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Link href={`/admin/banner/${banner.id}`}>
                  <Button variant="outline" size="icon">
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button variant="outline" size="icon" className="text-destructive" onClick={() => onDelete(banner.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      <BannerDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} />

      <BannerPreviewDialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen} banner={previewBanner} />
    </div>
  )
}

