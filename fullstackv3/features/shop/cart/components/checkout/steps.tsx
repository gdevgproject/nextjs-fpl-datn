"use client"

import { useCheckout } from "../../providers/checkout-provider"
import { cn } from "@/lib/utils"
import { CheckCircle, MapPin, CreditCard, ClipboardList } from "lucide-react"

const steps = [
  { id: "address", label: "Địa chỉ", icon: MapPin },
  { id: "payment", label: "Thanh toán", icon: CreditCard },
  { id: "review", label: "Xác nhận", icon: ClipboardList },
]

export function Steps() {
  const { currentStep } = useCheckout()

  return (
    <div className="relative flex justify-between">
      {steps.map((step, index) => {
        // Determine step status
        const isActive = currentStep === step.id
        const isCompleted = getStepIndex(currentStep) > index
        const Icon = step.icon

        return (
          <div
            key={step.id}
            className={cn(
              "flex flex-col items-center z-10 w-24",
              isActive && "text-primary",
              isCompleted && "text-green-600",
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mb-2",
                isActive || isCompleted ? "bg-primary text-primary-foreground" : "bg-muted",
              )}
            >
              {isCompleted ? <CheckCircle className="w-6 h-6" /> : <Icon className="w-4 h-4" />}
            </div>
            <span className="text-sm text-center">{step.label}</span>
          </div>
        )
      })}

      {/* Connecting line */}
      <div className="absolute top-4 left-0 w-full h-0.5 bg-muted -z-0">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{
            width: `${getStepProgressPercentage(currentStep)}%`,
          }}
        />
      </div>
    </div>
  )
}

// Helper functions for step progress
function getStepIndex(step: string): number {
  return steps.findIndex((s) => s.id === step)
}

function getStepProgressPercentage(step: string): number {
  const index = getStepIndex(step)
  if (index === -1) return 0

  const stepCount = steps.length - 1
  if (stepCount === 0) return 100

  return (index / stepCount) * 100
}

