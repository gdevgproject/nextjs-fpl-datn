"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, CreditCard, ShoppingBag, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

export type Step = {
  id: number
  title: string
  icon: React.ReactNode
  description?: string
}

export const useCheckoutSteps = () => {
  const steps: Step[] = [
    {
      id: 1,
      title: "Giỏ hàng",
      icon: <ShoppingBag className="h-5 w-5" />,
      description: "Xem lại giỏ hàng",
    },
    {
      id: 2,
      title: "Thông tin",
      icon: <User className="h-5 w-5" />,
      description: "Thông tin giao hàng",
    },
    {
      id: 3,
      title: "Thanh toán",
      icon: <CreditCard className="h-5 w-5" />,
      description: "Phương thức thanh toán",
    },
    {
      id: 4,
      title: "Xác nhận",
      icon: <CheckCircle2 className="h-5 w-5" />,
      description: "Hoàn tất đơn hàng",
    },
  ]

  return { steps }
}

interface CheckoutStepperProps {
  currentStep: number
  steps: Step[]
}

export function CheckoutStepper({ currentStep, steps }: CheckoutStepperProps) {
  const [mounted, setMounted] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(max-width: 1024px)")

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  // Hiển thị compact stepper trên mobile
  if (isMobile) {
    return (
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-muted"></div>
        <div className="relative z-10 flex items-center justify-between gap-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full border transition-colors",
                currentStep === step.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep > step.id
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted-foreground/30 bg-background text-muted-foreground",
              )}
            >
              {currentStep > step.id ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <span className="text-xs font-medium">{step.id}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Hiển thị stepper với icon và title trên tablet
  if (isTablet) {
    return (
      <div className="mb-8">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-muted"></div>
          {steps.map((step, index) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{
                  scale: currentStep === step.id ? 1 : 0.8,
                  backgroundColor: currentStep >= step.id ? "var(--primary)" : "var(--background)",
                  borderColor:
                    currentStep > step.id
                      ? "var(--primary)"
                      : currentStep === step.id
                        ? "var(--primary)"
                        : "var(--border)",
                  color: currentStep >= step.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
                }}
                className={cn("flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors")}
              >
                {currentStep > step.id ? <CheckCircle2 className="h-5 w-5" /> : step.icon}
              </motion.div>
              <span
                className={cn(
                  "mt-2 text-xs font-medium",
                  currentStep === step.id
                    ? "text-primary"
                    : currentStep > step.id
                      ? "text-primary/70"
                      : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Hiển thị stepper đầy đủ trên desktop
  return (
    <div className="mb-8">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 bg-muted"></div>
        {steps.map((step, index) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{
                scale: currentStep === step.id ? 1 : 0.8,
                backgroundColor: currentStep >= step.id ? "var(--primary)" : "var(--background)",
                borderColor:
                  currentStep > step.id
                    ? "var(--primary)"
                    : currentStep === step.id
                      ? "var(--primary)"
                      : "var(--border)",
                color: currentStep >= step.id ? "var(--primary-foreground)" : "var(--muted-foreground)",
              }}
              className={cn("flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors")}
            >
              {currentStep > step.id ? <CheckCircle2 className="h-6 w-6" /> : step.icon}
            </motion.div>
            <div className="mt-2 flex flex-col items-center text-center">
              <span
                className={cn(
                  "font-medium",
                  currentStep === step.id
                    ? "text-primary"
                    : currentStep > step.id
                      ? "text-primary/70"
                      : "text-muted-foreground",
                )}
              >
                {step.title}
              </span>
              {step.description && <span className="text-xs text-muted-foreground">{step.description}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

