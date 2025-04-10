"use client"

import { useState } from "react"
import { CreditCard, Package, Truck, Users } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrderProcessingWorkflow } from "@/components/admin/don-hang/order-processing-workflow"
import { OrderRefundProcess } from "@/components/admin/don-hang/order-refund-process"
import { OrderInventoryManagement } from "@/components/admin/don-hang/order-inventory-management"
import { OrderBatchProcessing } from "@/components/admin/don-hang/order-batch-processing"

interface OrderProcessingManagerProps {
  orderId: string
}

export function OrderProcessingManager({ orderId }: OrderProcessingManagerProps) {
  const [activeView, setActiveView] = useState<"workflow" | "refund" | "inventory" | "batch">("workflow")

  // Mẫu dữ liệu đơn hàng
  const order = {
    id: orderId,
    status: "Processing",
    paymentStatus: "Paid",
    paymentMethod: "Banking",
    totalAmount: 2150000,
  }

  // Mẫu dữ liệu sản phẩm trong đơn hàng
  const orderItems = [
    {
      id: "ITEM-001",
      productName: "Dior Sauvage EDP",
      variantName: "100ml",
      quantity: 1,
      currentStock: 10,
    },
    {
      id: "ITEM-002",
      productName: "Chanel Bleu de Chanel EDP",
      variantName: "50ml",
      quantity: 1,
      currentStock: 8,
    },
  ]

  const handleBack = () => {
    setActiveView("workflow")
  }

  return (
    <div className="space-y-6">
      {activeView === "workflow" && (
        <>
          <Tabs defaultValue="single" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="single" className="gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Xử lý</span> đơn hàng
              </TabsTrigger>
              <TabsTrigger value="refund" onClick={() => setActiveView("refund")} className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Hoàn</span> tiền
              </TabsTrigger>
              <TabsTrigger value="inventory" onClick={() => setActiveView("inventory")} className="gap-2">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Cập nhật</span> tồn kho
              </TabsTrigger>
              <TabsTrigger value="batch" onClick={() => setActiveView("batch")} className="gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Xử lý</span> hàng loạt
              </TabsTrigger>
            </TabsList>
            <TabsContent value="single" className="pt-4">
              <OrderProcessingWorkflow orderId={orderId} currentStatus={order.status} />
            </TabsContent>
          </Tabs>
        </>
      )}

      {activeView === "refund" && (
        <OrderRefundProcess
          orderId={orderId}
          totalAmount={order.totalAmount}
          paymentMethod={order.paymentMethod}
          onBack={handleBack}
        />
      )}

      {activeView === "inventory" && (
        <OrderInventoryManagement orderId={orderId} items={orderItems} onBack={handleBack} />
      )}

      {activeView === "batch" && <OrderBatchProcessing onBack={handleBack} />}
    </div>
  )
}

