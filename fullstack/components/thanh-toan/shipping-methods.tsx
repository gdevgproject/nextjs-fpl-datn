"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Truck, Clock, Calendar, Info, CheckCircle2 } from "lucide-react"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { formatCurrency } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { UseFormReturn } from "react-hook-form"
import type { CheckoutFormValues } from "@/lib/validators/checkout-validators"

interface ShippingMethodsProps {
  form: UseFormReturn<CheckoutFormValues>
}

export function ShippingMethods({ form }: ShippingMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState("standard")

  const shippingMethods = [
    {
      id: "standard",
      name: "Giao hàng tiêu chuẩn",
      description: "Giao hàng trong 3-5 ngày làm việc",
      price: 0,
      estimatedDelivery: "27/03 - 29/03/2025",
      icon: <Truck className="h-5 w-5" />,
      popular: false,
    },
    {
      id: "express",
      name: "Giao hàng nhanh",
      description: "Giao hàng trong 1-2 ngày làm việc",
      price: 50000,
      estimatedDelivery: "25/03 - 26/03/2025",
      icon: <Clock className="h-5 w-5" />,
      popular: true,
    },
    {
      id: "scheduled",
      name: "Giao hàng theo lịch hẹn",
      description: "Chọn ngày và khung giờ giao hàng",
      price: 100000,
      estimatedDelivery: "Theo lịch hẹn",
      icon: <Calendar className="h-5 w-5" />,
      popular: false,
    },
  ]

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value)
    form.setValue("shippingMethod.shippingMethod", value)
  }

  return (
    <FormField
      control={form.control}
      name="shippingMethod.shippingMethod"
      render={({ field }) => (
        <FormItem className="space-y-4">
          <FormControl>
            <RadioGroup
              onValueChange={(value) => {
                field.onChange(value)
                handleMethodChange(value)
              }}
              defaultValue={field.value}
              className="space-y-4"
            >
              {shippingMethods.map((method) => (
                <motion.div
                  key={method.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative flex cursor-pointer items-start space-x-2 rounded-lg border p-4 transition-all hover:border-primary/50",
                    selectedMethod === method.id ? "border-primary bg-primary/5" : "",
                  )}
                  onClick={() => handleMethodChange(method.id)}
                >
                  <RadioGroupItem value={method.id} id={method.id} className="mt-1" />
                  <div className="flex flex-1 items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <FormLabel htmlFor={method.id} className="cursor-pointer font-medium">
                          {method.name}
                        </FormLabel>
                        {method.popular && (
                          <Badge
                            variant="secondary"
                            className="bg-amber-100 text-amber-800 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/40"
                          >
                            Phổ biến
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <span
                          className={cn(
                            "flex items-center gap-1 rounded-md px-2 py-0.5",
                            selectedMethod === method.id
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {selectedMethod === method.id ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <method.icon className="h-3.5 w-3.5" />
                          )}
                          <span>Dự kiến giao: {method.estimatedDelivery}</span>
                        </span>
                        {method.id === "scheduled" && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-4 w-4 cursor-help text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Bạn sẽ được chọn ngày và khung giờ giao hàng sau khi đặt hàng thành công
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                    <div className="font-medium">
                      {method.price === 0 ? (
                        <span className="text-green-600">Miễn phí</span>
                      ) : (
                        formatCurrency(method.price)
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

