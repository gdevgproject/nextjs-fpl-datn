"use client"

import { useState } from "react"
import { ActivityLogList } from "@/components/admin/nhat-ky/activity-log-list"
import { ActivityLogSearch } from "@/components/admin/nhat-ky/activity-log-search"
import { ActivityLogFilterEnhanced } from "@/components/admin/nhat-ky/activity-log-filter-enhanced"
import { ActivityLogStats } from "@/components/admin/nhat-ky/activity-log-stats"
import { ActivityLogTrends } from "@/components/admin/nhat-ky/activity-log-trends"
import { ActivityLogTimeline } from "@/components/admin/nhat-ky/activity-log-timeline"
import { ActivityLogMobileView } from "@/components/admin/nhat-ky/activity-log-mobile-view"
import { ActivityLogDetailDialogEnhanced } from "@/components/admin/nhat-ky/activity-log-detail-dialog-enhanced"
import { PageHeader } from "@/components/admin/common/page-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ActivityLogPageClient() {
  const [selectedLog, setSelectedLog] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("list")

  const handleViewDetail = (log: any) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <PageHeader
          heading="Nhật ký hoạt động"
          description="Theo dõi và quản lý các hoạt động của quản trị viên"
          breadcrumbs={[
            { title: "Trang chủ", href: "/admin" },
            { title: "Nhật ký hoạt động", href: "/admin/nhat-ky-hoat-dong" },
          ]}
        />
      </div>

      <ActivityLogStats />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2">
          <ActivityLogSearch />
        </div>
        <div className="md:col-span-1">{/* Mobile tabs */}</div>
      </div>

      <ActivityLogFilterEnhanced />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Fix: Wrap all TabsContent within a Tabs component */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 md:hidden">
              <TabsTrigger value="list">Danh sách</TabsTrigger>
              <TabsTrigger value="timeline">Dòng thời gian</TabsTrigger>
            </TabsList>

            <TabsContent value="list">
              <ActivityLogList />
              <div className="md:hidden">
                <ActivityLogMobileView onViewDetail={handleViewDetail} />
              </div>
            </TabsContent>

            <TabsContent value="timeline">
              <div className="md:hidden">
                <ActivityLogTimeline onViewDetail={handleViewDetail} />
              </div>
            </TabsContent>
          </Tabs>

          {/* Desktop view - no tabs needed */}
          <div className="hidden md:block">
            <ActivityLogList />
          </div>
        </div>

        <div className="hidden lg:block">
          <ActivityLogTimeline onViewDetail={handleViewDetail} />
        </div>
      </div>

      <ActivityLogTrends />

      {selectedLog && (
        <ActivityLogDetailDialogEnhanced log={selectedLog} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
      )}
    </div>
  )
}

