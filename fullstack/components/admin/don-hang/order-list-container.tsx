"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import OrderList from "@/components/admin/don-hang/order-list"
import OrderToolbar from "@/components/admin/don-hang/order-toolbar"
import OrderFilterBar from "@/components/admin/don-hang/order-filter-bar"
import OrderKanban from "@/components/admin/don-hang/order-kanban"
import OrderCalendar from "@/components/admin/don-hang/order-calendar"
import { useMediaQuery } from "@/hooks/use-media-query"

export default function OrderListContainer() {
  const [view, setView] = useState<"list" | "kanban" | "calendar">("list")
  const [filterVisible, setFilterVisible] = useState(false)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const isMobile = useMediaQuery("(max-width: 768px)")

  const toggleFilter = () => {
    setFilterVisible(!filterVisible)
  }

  const handleOrderSelection = (orderIds: string[]) => {
    setSelectedOrders(orderIds)
  }

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
          <TabsList className="mb-2 md:mb-0">
            <TabsTrigger value="all">Tất cả đơn hàng</TabsTrigger>
            <TabsTrigger value="pending">Chờ xử lý</TabsTrigger>
            <TabsTrigger value="processing">Đang xử lý</TabsTrigger>
            <TabsTrigger value="shipped">Đang giao</TabsTrigger>
            <TabsTrigger value="completed">Hoàn thành</TabsTrigger>
            <TabsTrigger value="cancelled">Đã hủy</TabsTrigger>
          </TabsList>

          <OrderToolbar
            view={view}
            onViewChange={setView}
            onToggleFilter={toggleFilter}
            selectedCount={selectedOrders.length}
          />
        </div>

        {filterVisible && <OrderFilterBar />}

        <TabsContent value="all" className="m-0">
          {view === "list" && <OrderList onSelectionChange={handleOrderSelection} />}
          {view === "kanban" && <OrderKanban />}
          {view === "calendar" && <OrderCalendar />}
        </TabsContent>

        <TabsContent value="pending" className="m-0">
          {view === "list" && <OrderList status="Pending" onSelectionChange={handleOrderSelection} />}
          {view === "kanban" && <OrderKanban status="Pending" />}
          {view === "calendar" && <OrderCalendar status="Pending" />}
        </TabsContent>

        <TabsContent value="processing" className="m-0">
          {view === "list" && <OrderList status="Processing" onSelectionChange={handleOrderSelection} />}
          {view === "kanban" && <OrderKanban status="Processing" />}
          {view === "calendar" && <OrderCalendar status="Processing" />}
        </TabsContent>

        <TabsContent value="shipped" className="m-0">
          {view === "list" && <OrderList status="Shipped" onSelectionChange={handleOrderSelection} />}
          {view === "kanban" && <OrderKanban status="Shipped" />}
          {view === "calendar" && <OrderCalendar status="Shipped" />}
        </TabsContent>

        <TabsContent value="completed" className="m-0">
          {view === "list" && <OrderList status="Delivered" onSelectionChange={handleOrderSelection} />}
          {view === "kanban" && <OrderKanban status="Delivered" />}
          {view === "calendar" && <OrderCalendar status="Delivered" />}
        </TabsContent>

        <TabsContent value="cancelled" className="m-0">
          {view === "list" && <OrderList status="Cancelled" onSelectionChange={handleOrderSelection} />}
          {view === "kanban" && <OrderKanban status="Cancelled" />}
          {view === "calendar" && <OrderCalendar status="Cancelled" />}
        </TabsContent>
      </Tabs>
    </div>
  )
}

