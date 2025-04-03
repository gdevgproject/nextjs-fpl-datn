"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { CreditCard, Landmark, Wallet, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { UseFormReturn } from "react-hook-form"
import type { CheckoutFormValues } from "@/lib/validators/checkout-validators"

interface PaymentMethodsProps {
  form: UseFormReturn<CheckoutFormValues>
}

export function PaymentMethods({ form }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState("cod")
  const [cardTab, setCardTab] = useState("credit-card")

  const handleMethodChange = (value: string) => {
    setSelectedMethod(value)
    form.setValue("paymentMethod.paymentMethod", value)
  }

  const paymentMethods = [
    {
      id: "cod",
      name: "Thanh toán khi nhận hàng (COD)",
      description: "Bạn sẽ thanh toán bằng tiền mặt khi nhận hàng",
      icon: <Wallet className="h-5 w-5" />,
      badge: "Phổ biến nhất",
      securityInfo: "Kiểm tra hàng trước khi thanh toán",
      securityIcon: <ShieldCheck className="h-3.5 w-3.5" />,
    },
    {
      id: "bank",
      name: "Chuyển khoản ngân hàng",
      description: "Chuyển khoản đến tài khoản ngân hàng của chúng tôi",
      icon: <Landmark className="h-5 w-5" />,
      badge: null,
      securityInfo: null,
      securityIcon: null,
    },
    {
      id: "card",
      name: "Thanh toán bằng thẻ tín dụng/ghi nợ",
      description: "Thanh toán an toàn với Visa, Mastercard, JCB",
      icon: <CreditCard className="h-5 w-5" />,
      badge: "An toàn",
      securityInfo: null,
      securityIcon: null,
    },
    {
      id: "momo",
      name: "Ví điện tử MoMo",
      description: "Thanh toán nhanh chóng và an toàn với ví MoMo",
      icon: <Smartphone className="h-5 w-5" />,
      badge: "Nhanh chóng",
      securityInfo: null,
      securityIcon: null,
    },
  ]

  return (
    <FormField
      control={form.control}
      name="paymentMethod.paymentMethod"
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
              {paymentMethods.map((method) => (
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
                  <div className="flex-1">
                    <FormLabel htmlFor={method.id} className="flex cursor-pointer items-center font-medium">
                      <span
                        className={cn(
                          "mr-2 flex h-6 w-6 items-center justify-center rounded-full",
                          selectedMethod === method.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {selectedMethod === method.id ? <CheckCircle2 className="h-4 w-4" /> : method.icon}
                      </span>
                      {method.name}
                      {method.badge && (
                        <Badge variant="secondary" className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
                          {method.badge}
                        </Badge>
                      )}
                    </FormLabel>
                    <p className="text-sm text-muted-foreground">{method.description}</p>

                    {method.securityInfo && (
                      <div className="mt-2 flex items-center gap-1 text-sm">
                        <span className="flex items-center gap-1 rounded-md bg-green-100 px-2 py-0.5 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          {method.securityIcon}
                          <span>{method.securityInfo}</span>
                        </span>
                      </div>
                    )}

                    {method.id === "bank" && selectedMethod === "bank" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 rounded-md bg-muted p-3 text-sm"
                      >
                        <p>
                          Ngân hàng: <span className="font-medium">Vietcombank</span>
                        </p>
                        <p>
                          Số tài khoản: <span className="font-medium">1234567890</span>
                        </p>
                        <p>
                          Chủ tài khoản: <span className="font-medium">CÔNG TY TNHH MYBEAUTY</span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">Nội dung: [Tên của bạn] - [Số điện thoại]</p>
                      </motion.div>
                    )}

                    {method.id === "card" && selectedMethod === "card" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 overflow-hidden"
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <img src="/placeholder.svg?height=30&width=40" alt="Visa" className="h-8" />
                          <img src="/placeholder.svg?height=30&width=40" alt="Mastercard" className="h-8" />
                          <img src="/placeholder.svg?height=30&width=40" alt="JCB" className="h-8" />
                        </div>

                        <Tabs value={cardTab} onValueChange={setCardTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="credit-card">Thẻ tín dụng</TabsTrigger>
                            <TabsTrigger value="debit-card">Thẻ ATM nội địa</TabsTrigger>
                          </TabsList>
                          <TabsContent value="credit-card" className="space-y-4 pt-4">
                            <div className="space-y-2">
                              <label htmlFor="card-number" className="text-sm font-medium">
                                Số thẻ
                              </label>
                              <Input id="card-number" placeholder="1234 5678 9012 3456" className="font-mono" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label htmlFor="expiry" className="text-sm font-medium">
                                  Ngày hết hạn
                                </label>
                                <Input id="expiry" placeholder="MM/YY" />
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="cvc" className="text-sm font-medium">
                                  CVC/CVV
                                </label>
                                <Input id="cvc" placeholder="123" />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label htmlFor="card-name" className="text-sm font-medium">
                                Tên chủ thẻ
                              </label>
                              <Input id="card-name" placeholder="NGUYEN VAN A" className="uppercase" />
                            </div>
                          </TabsContent>
                          <TabsContent value="debit-card" className="space-y-4 pt-4">
                            <div className="grid grid-cols-3 gap-2">
                              {["Vietcombank", "Techcombank", "BIDV"].map((bank) => (
                                <Button key={bank} variant="outline" className="h-auto flex-1 py-2">
                                  {bank}
                                </Button>
                              ))}
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {["Agribank", "VPBank", "ACB"].map((bank) => (
                                <Button key={bank} variant="outline" className="h-auto flex-1 py-2">
                                  {bank}
                                </Button>
                              ))}
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Bạn sẽ được chuyển đến cổng thanh toán an toàn của ngân hàng
                            </p>
                          </TabsContent>
                        </Tabs>
                      </motion.div>
                    )}

                    {method.id === "momo" && selectedMethod === "momo" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-2 flex items-center gap-2"
                      >
                        <img src="/placeholder.svg?height=40&width=40" alt="MoMo" className="h-8" />
                        <span className="text-sm text-muted-foreground">
                          Bạn sẽ được chuyển đến ứng dụng MoMo để hoàn tất thanh toán
                        </span>
                      </motion.div>
                    )}
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

