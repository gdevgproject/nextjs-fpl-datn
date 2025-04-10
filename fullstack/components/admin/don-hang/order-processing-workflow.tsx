"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, Clock, Package, Truck, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { OrderStatusBadge } from "@/components/admin/don-hang/order-status-badge"
import { OrderStatusUpdateDialog } from "@/components/admin/don-hang/order-status-update-dialog"

interface OrderProcessingWorkflowProps {
  orderId: string
  currentStatus: string
}

export function OrderProcessingWorkflow({ orderId, currentStatus }: OrderProcessingWorkflowProps) {
  const { toast } = useToast()
  const [status, setStatus] = useState(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState("")

  // Định nghĩa các trạng thái và quy trình
  const workflowSteps = [
    { id: "Pending", label: "Chờ xử lý", icon: Clock, color: "text-yellow-500" },
    { id: "Processing", label: "Đang xử lý", icon: Package, color: "text-blue-500" },
    { id: "Shipped", label: "Đã giao cho vận chuyển", icon: Truck, color: "text-indigo-500" },
    { id: "Delivered", label: "Đã giao hàng", icon: CheckCircle2, color: "text-green-500" },
    { id: "Cancelled", label: "Đã hủy", icon: XCircle, color: "text-red-500" },
  ]

  // Tìm index của trạng thái hiện tại
  const currentIndex = workflowSteps.findIndex((step) => step.id === status)

  // Xác định các trạng thái có thể chuyển đến từ trạng thái hiện tại
  const getAvailableTransitions = () => {
    switch (status) {
      case "Pending":
        return ["Processing", "Cancelled"]
      case "Processing":
        return ["Shipped", "Cancelled"]
      case "Shipped":
        return ["Delivered", "Cancelled"]
      case "Delivered":
      case "Cancelled":
        return []
      default:
        return []
    }
  }

  const availableTransitions = getAvailableTransitions()

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
    setIsDialogOpen(true)
  }

  const handleConfirmStatusChange = () => {
    setIsUpdating(true)

    // Giả lập cập nhật trạng thái
    setTimeout(() => {
      setStatus(selectedStatus)
      setIsUpdating(false)
      setIsDialogOpen(false)

      toast({
        title: "Trạng thái đã được cập nhật",
        description: `Đơn hàng #${orderId} đã được cập nhật sang trạng thái ${selectedStatus}`,
      })
    }, 1000)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quy trình xử lý đơn hàng</CardTitle>
        <CardDescription>Cập nhật trạng thái đơn hàng theo quy trình</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Trạng thái hiện tại:</span>
          <OrderStatusBadge status={status} />
        </div>

        <Separator />

        {/* Hiển thị quy trình dạng timeline */}
        <div className="relative">
          {/* Đường kẻ nối các bước */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-muted" />

          {workflowSteps.map((step, index) => {
            const StepIcon = step.icon
            const isCompleted = index < currentIndex
            const isCurrent = index === currentIndex
            const isCancelled = status === "Cancelled" && step.id === "Cancelled"

            // Xác định trạng thái của bước
            let stepStatus = "upcoming"
            if (isCompleted) stepStatus = "completed"
            if (isCurrent) stepStatus = "current"
            if (isCancelled) stepStatus = "current"

            return (
              <div key={step.id} className="relative flex items-start mb-6 last:mb-0">
                <div
                  className={`absolute left-4 top-0 flex items-center justify-center w-8 h-8 rounded-full -translate-x-1/2 ${
                    stepStatus === "completed"
                      ? "bg-primary text-primary-foreground"
                      : stepStatus === "current"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </div>

                <div className="ml-6 pl-4">
                  <h3
                    className={`text-base font-medium ${
                      stepStatus === "completed"
                        ? "text-muted-foreground"
                        : stepStatus === "current"
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {step.label}
                  </h3>

                  {isCurrent && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {step.id === "Pending" &&
                          "Đơn hàng đang chờ xử lý. Vui lòng xác nhận và bắt đầu chuẩn bị đơn hàng."}
                        {step.id === "Processing" &&
                          "Đơn hàng đang được chuẩn bị. Khi hoàn tất, hãy cập nhật trạng thái sang 'Đã giao cho vận chuyển'."}
                        {step.id === "Shipped" &&
                          "Đơn hàng đã được giao cho đơn vị vận chuyển. Theo dõi quá trình vận chuyển và cập nhật khi đơn hàng được giao."}
                        {step.id === "Delivered" && "Đơn hàng đã được giao thành công cho khách hàng."}
                        {step.id === "Cancelled" && "Đơn hàng đã bị hủy."}
                      </p>

                      {availableTransitions.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {availableTransitions.map((transition) => {
                            const transitionStep = workflowSteps.find((s) => s.id === transition)
                            const TransitionIcon = transitionStep?.icon || ArrowRight

                            return (
                              <Button
                                key={transition}
                                variant={transition === "Cancelled" ? "destructive" : "default"}
                                size="sm"
                                className="gap-1"
                                onClick={() => handleStatusChange(transition)}
                                disabled={isUpdating}
                              >
                                <TransitionIcon className="w-4 h-4" />
                                <span>
                                  {transition === "Processing" && "Bắt đầu xử lý"}
                                  {transition === "Shipped" && "Giao cho vận chuyển"}
                                  {transition === "Delivered" && "Xác nhận đã giao"}
                                  {transition === "Cancelled" && "Hủy đơn hàng"}
                                </span>
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>

      <OrderStatusUpdateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        orderId={orderId}
        currentStatus={status}
        newStatus={selectedStatus}
        onConfirm={handleConfirmStatusChange}
        isUpdating={isUpdating}
      />
    </Card>
  )
}

