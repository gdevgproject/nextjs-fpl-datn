"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Clock, Package, Truck, Home, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface OrderStatusTimelineProps {
  orderId: string
}

type StatusStep = {
  id: string
  title: string
  description: string
  date: string
  icon: React.ReactNode
  completed: boolean
  current: boolean
}

export function OrderStatusTimeline({ orderId }: OrderStatusTimelineProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(false)

  // Gi  setIsLoading] = useState(true)
  // const [showAlert, setShowAlert] = useState(false)

  // Giả lập dữ liệu trạng thái đơn hàng
  const statusSteps: StatusStep[] = [
    {
      id: "pending",
      title: "Đơn hàng đã đặt",
      description: "Đơn hàng của bạn đã được đặt thành công",
      date: new Date().toLocaleDateString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      icon: <CheckCircle2 className="h-5 w-5" />,
      completed: true,
      current: false,
    },
    {
      id: "processing",
      title: "Đang xử lý",
      description: "Đơn hàng của bạn đang được xử lý",
      date: "Đang cập nhật",
      icon: <Clock className="h-5 w-5" />,
      completed: false,
      current: true,
    },
    {
      id: "shipped",
      title: "Đã giao cho đơn vị vận chuyển",
      description: "Đơn hàng đã được giao cho đơn vị vận chuyển",
      date: "Dự kiến: 26/03/2025",
      icon: <Package className="h-5 w-5" />,
      completed: false,
      current: false,
    },
    {
      id: "delivering",
      title: "Đang giao hàng",
      description: "Đơn hàng đang được giao đến địa chỉ của bạn",
      date: "Dự kiến: 27/03/2025",
      icon: <Truck className="h-5 w-5" />,
      completed: false,
      current: false,
    },
    {
      id: "delivered",
      title: "Đã giao hàng",
      description: "Đơn hàng đã được giao thành công",
      date: "Dự kiến: 27/03 - 29/03/2025",
      icon: <Home className="h-5 w-5" />,
      completed: false,
      current: false,
    },
  ]

  // Giả lập loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {showAlert && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-900/20 dark:text-amber-300">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Thông báo</AlertTitle>
          <AlertDescription>
            Đơn hàng của bạn đang được xử lý. Chúng tôi sẽ cập nhật trạng thái đơn hàng sớm nhất có thể.
          </AlertDescription>
        </Alert>
      )}

      <div className="relative">
        {/* Đường kẻ dọc kết nối các bước */}
        <div className="absolute left-5 top-0 h-full w-0.5 -translate-x-1/2 bg-muted"></div>

        {/* Các bước trạng thái */}
        <div className="space-y-8">
          {statusSteps.map((step, index) => (
            <div key={step.id} className="flex gap-4">
              <motion.div
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                  scale: step.completed || step.current ? 1 : 0.8,
                  opacity: step.completed || step.current ? 1 : 0.5,
                  backgroundColor: step.completed
                    ? "var(--primary)"
                    : step.current
                      ? "var(--amber-500)"
                      : "var(--muted)",
                }}
                className={cn(
                  "relative z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-primary-foreground",
                  step.completed ? "bg-primary" : step.current ? "bg-amber-500" : "bg-muted",
                )}
              >
                {step.icon}
              </motion.div>

              <div className="flex-1 pt-1">
                <h3
                  className={cn(
                    "font-medium",
                    step.completed ? "text-primary" : step.current ? "text-amber-600" : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    step.completed ? "text-primary/70" : step.current ? "text-amber-600/70" : "text-muted-foreground",
                  )}
                >
                  {step.date}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowAlert(!showAlert)}>
          <Clock className="h-4 w-4" />
          <span>Cập nhật trạng thái</span>
        </Button>
      </div>
    </div>
  )
}

