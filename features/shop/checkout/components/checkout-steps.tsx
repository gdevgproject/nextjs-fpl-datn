"use client";

import type React from "react";

import type { CheckoutStep } from "@/features/shop/checkout/types";
import { useCheckout } from "@/features/shop/checkout/checkout-provider";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  CreditCard,
  FileText,
  MapPin,
  ChevronRight,
} from "lucide-react";

const steps: { id: CheckoutStep; label: string; icon: React.ReactNode }[] = [
  {
    id: "address",
    label: "Địa chỉ",
    icon: <MapPin className="h-5 w-5" />,
  },
  {
    id: "payment",
    label: "Thanh toán",
    icon: <CreditCard className="h-5 w-5" />,
  },
  {
    id: "review",
    label: "Xác nhận",
    icon: <FileText className="h-5 w-5" />,
  },
];

export function CheckoutSteps() {
  const { currentStep } = useCheckout();

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          // Calculate step status
          const isActive = currentStep === step.id;
          const isCompleted =
            getStepStatus(currentStep, step.id) === "completed";
          const isCurrent = getStepStatus(currentStep, step.id) === "current";
          const isPending = getStepStatus(currentStep, step.id) === "pending";

          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle with status */}
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                  isCompleted
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                    ? "bg-primary/90 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted ? <CheckCircle className="h-5 w-5" /> : step.icon}
              </div>

              {/* Step label - hide on small screens */}
              <span
                className={cn(
                  "ml-2 hidden sm:inline-block font-medium text-sm",
                  isCompleted
                    ? "text-primary"
                    : isCurrent
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="mx-4 flex-1 hidden sm:block">
                  <div
                    className={cn(
                      "h-0.5 w-full",
                      isCompleted ? "bg-primary" : "bg-muted"
                    )}
                  />
                </div>
              )}

              {/* Mobile connector arrow */}
              {index < steps.length - 1 && (
                <ChevronRight className="h-4 w-4 mx-1 sm:hidden text-muted-foreground" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to determine step status
function getStepStatus(
  currentStep: CheckoutStep,
  stepId: CheckoutStep
): "pending" | "current" | "completed" {
  const stepOrder: Record<CheckoutStep, number> = {
    cart: 0,
    address: 1,
    payment: 2,
    review: 3,
    complete: 4,
  };

  if (stepOrder[currentStep] > stepOrder[stepId]) {
    return "completed";
  } else if (currentStep === stepId) {
    return "current";
  } else {
    return "pending";
  }
}
