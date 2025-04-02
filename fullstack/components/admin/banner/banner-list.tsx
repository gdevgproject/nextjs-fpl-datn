"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Edit, Trash2, GripVertical, ExternalLink, Eye, Calendar, Check, X, MousePointerClick } from "lucide-react"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { BannerStatusBadge } from "./banner-status-badge"
import { BannerDeleteDialog } from "./banner-delete-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { BannerGridView } from "./banner-grid-view"
import { BannerCalendarView } from "./banner-calendar-view"
import { BannerPreviewDialog } from "./banner-preview-dialog"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useToast } from "@/hooks/use-toast"

// Mock data for banners
const mockBanners = [
  {
    id: "1",
    title: "Khuyến mãi mùa hè",
    subtitle: "Giảm giá đến 50% cho tất cả sản phẩm",
    image_url: "/placeholder.svg?height=200&width=600",
    link_url: "/khuyen-mai-mua-he",
    is_active: true,
    start_date: "2023-06-01T00:00:00Z",
    end_date: "2023-08-31T23:59:59Z",
    display_order: 1,
    impressions: 12500,
    clicks: 620,
  },
  {
    id: "2",
    title: "Bộ sưu tập mới",
    subtitle: "Khám phá bộ sưu tập nước hoa mùa thu 2023",
    image_url: "/placeholder.svg?height=200&width=600",
    link_url: "/bo-suu-tap-mua-thu",
    is_active: true,
    start_date: "2023-09-01T00:00:00Z",
    end_date: "2023-11-30T23:59:59Z",
    display_order: 2,
    impressions: 8300,
    clicks: 415,
  },
  {
    id: "3",
    title: "Flash Sale",
    subtitle: "Chỉ trong 24h - Giảm giá sốc",
    image_url: "/placeholder.svg?height=200&width=600",
    link_url: "/flash-sale",
    is_active: false,
    start_date: "2023-07-15T00:00:00Z",
    end_date: "2023-07-16T23:59:59Z",
    display_order: 3,
    impressions: 5600,
    clicks: 280,
  },
  {
    id: "4",
    title: "Quà tặng đặc biệt",
    subtitle: "Nhận quà tặng khi mua sản phẩm từ 1 triệu",
    image_url: "/placeholder.svg?height=200&width=600",
    link_url: "/qua-tang",
    is_active: true,
    start_date: "2023-10-01T00:00:00Z",
    end_date: "2023-10-31T23:59:59Z",
    display_order: 4,
    impressions: 7200,
    clicks: 360,
  },
]

interface BannerListProps {
  filter?: "all" | "active" | "inactive" | "scheduled" | "expired"
  view: "list" | "grid" | "calendar"
  searchQuery: string
  sortOrder: string
  selectedBanners: string[]
  onBannerSelect: (bannerId: string, isSelected: boolean) => void
  onSelectAll: (isSelected: boolean) => void
}

export function BannerList({
  filter = "all",
  view,
  searchQuery,
  sortOrder,
  selectedBanners,
  onBannerSelect,
  onSelectAll,
}: BannerListProps) {
  const [banners, setBanners] = useState(mockBanners)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedBannerId, setSelectedBannerId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  const [previewBanner, setPreviewBanner] = useState<any>(null)
  const { toast } = useToast()
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Filter banners based on the selected filter
  const filteredBanners = banners.filter((banner) => {
    const now = new Date()
    const startDate = new Date(banner.start_date)
    const endDate = new Date(banner.end_date)

    // Apply filter
    let passesFilter = true
    switch (filter) {
      case "active":
        passesFilter = banner.is_active && startDate <= now && endDate >= now
        break
      case "inactive":
        passesFilter = !banner.is_active
        break
      case "scheduled":
        passesFilter = banner.is_active && startDate > now
        break
      case "expired":
        passesFilter = banner.is_active && endDate < now
        break
    }

    // Apply search
    const matchesSearch = searchQuery
      ? banner.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        banner.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
      : true

    return passesFilter && matchesSearch
  })

  // Sort banners
  const sortedBanners = [...filteredBanners].sort((a, b) => {
    switch (sortOrder) {
      case "display_order":
        return a.display_order - b.display_order
      case "created_at_desc":
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      case "created_at_asc":
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      case "start_date_asc":
        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      case "start_date_desc":
        return new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      case "end_date_asc":
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
      case "end_date_desc":
        return new Date(b.end_date).getTime() - new Date(a.end_date).getTime()
      case "title_asc":
        return a.title.localeCompare(b.title)
      case "title_desc":
        return b.title.localeCompare(a.title)
      default:
        return a.display_order - b.display_order
    }
  })

  const handleDeleteClick = (id: string) => {
    setSelectedBannerId(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (selectedBannerId) {
      setBanners(banners.filter((banner) => banner.id !== selectedBannerId))
      setDeleteDialogOpen(false)
      setSelectedBannerId(null)
      toast({
        title: "Xóa banner thành công",
        description: "Banner đã được xóa khỏi hệ thống",
      })
    }
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(banners)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    // Update display_order for each item
    const updatedItems = items.map((item, index) => ({
      ...item,
      display_order: index + 1,
    }))

    setBanners(updatedItems)
    toast({
      title: "Cập nhật thứ tự thành công",
      description: "Thứ tự hiển thị banner đã được cập nhật",
    })
  }

  const handlePreviewClick = (banner: any) => {
    setPreviewBanner(banner)
    setPreviewDialogOpen(true)
  }

  const handleStatusToggle = (bannerId: string, newStatus: boolean) => {
    setBanners(banners.map((banner) => (banner.id === bannerId ? { ...banner, is_active: newStatus } : banner)))

    toast({
      title: newStatus ? "Kích hoạt banner thành công" : "Vô hiệu hóa banner thành công",
      description: newStatus
        ? "Banner đã được kích hoạt và sẽ hiển thị trên trang web"
        : "Banner đã bị vô hiệu hóa và sẽ không hiển thị trên trang web",
    })
  }

  const areAllSelected =
    filteredBanners.length > 0 && filteredBanners.every((banner) => selectedBanners.includes(banner.id))

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 h-48 md:h-auto relative">
                  <Skeleton className="h-full w-full" />
                </div>
                <div className="p-6 flex-1 space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <div className="flex items-center gap-2 mt-4">
                    <Skeleton className="h-6 w-24" />
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (filteredBanners.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium">Không có banner nào</h3>
        <p className="text-muted-foreground mt-2">
          Chưa có banner nào được tạo hoặc không có banner nào phù hợp với bộ lọc.
        </p>
        <Link href="/admin/banner/them">
          <Button className="mt-4">Thêm Banner Mới</Button>
        </Link>
      </div>
    )
  }

  // Grid view
  if (view === "grid") {
    return (
      <BannerGridView
        banners={sortedBanners}
        selectedBanners={selectedBanners}
        onBannerSelect={onBannerSelect}
        onSelectAll={onSelectAll}
        onDelete={handleDeleteClick}
        onPreview={handlePreviewClick}
        onStatusToggle={handleStatusToggle}
        areAllSelected={areAllSelected}
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        handleDeleteConfirm={handleDeleteConfirm}
        previewDialogOpen={previewDialogOpen}
        setPreviewDialogOpen={setPreviewDialogOpen}
        previewBanner={previewBanner}
      />
    )
  }

  // Calendar view
  if (view === "calendar") {
    return (
      <BannerCalendarView
        banners={sortedBanners}
        onPreview={handlePreviewClick}
        previewDialogOpen={previewDialogOpen}
        setPreviewDialogOpen={setPreviewDialogOpen}
        previewBanner={previewBanner}
      />
    )
  }

  // List view (default)
  return (
    <div className="p-4">
      <div className="flex items-center mb-4">
        <Checkbox id="select-all" checked={areAllSelected} onCheckedChange={onSelectAll} />
        <label htmlFor="select-all" className="ml-2 text-sm font-medium">
          Chọn tất cả
        </label>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="banners">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {sortedBanners.map((banner, index) => (
                <Draggable key={banner.id} draggableId={banner.id} index={index}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} className="mb-4">
                      <Card
                        className={`overflow-hidden ${selectedBanners.includes(banner.id) ? "border-primary" : ""}`}
                      >
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div className="relative w-full md:w-1/3 h-48 md:h-auto">
                              <div className="absolute top-2 left-2 z-10">
                                <Checkbox
                                  checked={selectedBanners.includes(banner.id)}
                                  onCheckedChange={(checked) => onBannerSelect(banner.id, !!checked)}
                                  className="bg-white/80"
                                />
                              </div>
                              <Image
                                src={banner.image_url || "/placeholder.svg"}
                                alt={banner.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-6 flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-semibold">{banner.title}</h3>
                                  <p className="text-muted-foreground mt-1">{banner.subtitle}</p>
                                </div>
                                {!isMobile && (
                                  <div {...provided.dragHandleProps} className="cursor-grab">
                                    <GripVertical className="h-6 w-6 text-muted-foreground" />
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-4">
                                <BannerStatusBadge banner={banner} />
                                <div className="text-sm text-muted-foreground">Thứ tự: {banner.display_order}</div>
                                <div className="text-sm text-muted-foreground">
                                  {new Date(banner.start_date).toLocaleDateString("vi-VN")} -{" "}
                                  {new Date(banner.end_date).toLocaleDateString("vi-VN")}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-4 mt-3">
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Eye className="h-3.5 w-3.5 mr-1" />
                                  {banner.impressions.toLocaleString()} lượt xem
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <MousePointerClick className="h-3.5 w-3.5 mr-1" />
                                  {banner.clicks.toLocaleString()} lượt nhấp
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground">
                                  <Calendar className="h-3.5 w-3.5 mr-1" />
                                  {Math.round(
                                    (new Date(banner.end_date).getTime() - new Date().getTime()) /
                                      (1000 * 60 * 60 * 24),
                                  )}{" "}
                                  ngày còn lại
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 mt-2">
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

                              <div className="flex flex-wrap justify-between items-center gap-2 mt-4">
                                <div className="flex items-center">
                                  <Button
                                    variant={banner.is_active ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => handleStatusToggle(banner.id, !banner.is_active)}
                                    className="mr-2"
                                  >
                                    {banner.is_active ? (
                                      <>
                                        <X className="h-4 w-4 mr-1" />
                                        Vô hiệu hóa
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-1" />
                                        Kích hoạt
                                      </>
                                    )}
                                  </Button>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button variant="outline" size="icon" onClick={() => handlePreviewClick(banner)}>
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Link href={`/admin/banner/${banner.id}`}>
                                    <Button variant="outline" size="icon">
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                  </Link>
                                  <Button
                                    variant="outline"
                                    size="icon"
                                    className="text-destructive"
                                    onClick={() => handleDeleteClick(banner.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <BannerDeleteDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} onConfirm={handleDeleteConfirm} />

      <BannerPreviewDialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen} banner={previewBanner} />
    </div>
  )
}

