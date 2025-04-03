"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import { CreditCard, MapPin, Truck, User, ArrowLeft, ArrowRight, ShoppingCart } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AddressForm } from "@/components/thanh-toan/address-form"
import { PaymentMethods } from "@/components/thanh-toan/payment-methods"
import { ShippingMethods } from "@/components/thanh-toan/shipping-methods"
import { OrderReview } from "@/components/thanh-toan/order-review"
import { useCart } from "@/lib/hooks/use-cart"
import { useAuth } from "@/lib/hooks/use-auth"
import { checkoutFormSchema, type CheckoutFormValues } from "@/lib/validators/checkout-validators"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { StockCheckAlert } from "@/components/thanh-toan/stock-check-alert"
import { CheckoutStepper, useCheckoutSteps } from "@/components/thanh-toan/checkout-stepper"
import { GuestCheckoutForm } from "@/components/thanh-toan/guest-checkout-form"

export function CheckoutForm() {
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const { items, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [stockWarning, setStockWarning] = useState<{
    productId: string
    name: string
    available: number
  } | null>(null)
  const [currentStep, setCurrentStep] = useState(user ? 2 : 1) // Bắt đầu từ bước 1 (Guest) hoặc 2 (Thông tin giao hàng)
  const { steps } = useCheckoutSteps()
  const [guestInfo, setGuestInfo] = useState<{ name: string; email: string; phone: string } | null>(null)

  // Khởi tạo form với react-hook-form và zod validation
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerInfo: {
        fullName: user?.user_metadata?.full_name || guestInfo?.name || "",
        email: user?.email || guestInfo?.email || "",
        phone: user?.user_metadata?.phone || guestInfo?.phone || "",
      },
      addressType: "existing",
      shippingMethod: {
        shippingMethod: "standard",
      },
      paymentMethod: {
        paymentMethod: "cod",
      },
      notes: {
        notes: "",
      },
    },
  })

  // Kiểm tra tồn kho trước khi đặt hàng
  const checkStock = async () => {
    // Giả lập kiểm tra tồn kho
    // Trong thực tế, cần gọi API để kiểm tra tồn kho

    // Giả sử sản phẩm có ID "2" chỉ còn 1 sản phẩm trong kho
    const lowStockItem = items.find((item) => item.productId === "2" && item.quantity > 1)

    if (lowStockItem) {
      setStockWarning({
        productId: lowStockItem.productId,
        name: lowStockItem.name,
        available: 1,
      })
      return false
    }

    return true
  }

  const handleSubmit = async (values: CheckoutFormValues) => {
    if (currentStep < 4) {
      // Nếu chưa phải bước cuối, chuyển sang bước tiếp theo
      setCurrentStep(currentStep + 1)
      return
    }

    setIsSubmitting(true)

    try {
      // Kiểm tra tồn kho
      const stockOk = await checkStock()
      if (!stockOk) {
        setIsSubmitting(false)
        return
      }

      // Giả lập API call để tạo đơn hàng
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Xóa giỏ hàng sau khi đặt hàng thành công
      await clearCart()

      // Chuyển hướng đến trang xác nhận đơn hàng
      const orderId = "ORD" + Math.floor(Math.random() * 1000000)
      router.push(`/thanh-toan/thanh-cong/${orderId}`)
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Lỗi",
        description: "Không thể tạo đơn hàng. Vui lòng thử lại sau.",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > (user ? 2 : 1)) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGuestSubmit = (values: { name: string; email: string; phone: string }) => {
    setGuestInfo(values)
    form.setValue("customerInfo.fullName", values.name)
    form.setValue("customerInfo.email", values.email)
    form.setValue("customerInfo.phone", values.phone)
    setCurrentStep(2)
  }

  return (
    <div className="space-y-8">
      <CheckoutStepper currentStep={currentStep} steps={steps} />

      {stockWarning && (
        <StockCheckAlert
          productName={stockWarning.name}
          available={stockWarning.available}
          onClose={() => setStockWarning(null)}
        />
      )}

      <AnimatePresence mode="wait">
        {!user && currentStep === 1 && (
          <motion.div
            key="step-1-guest"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="rounded-lg border p-6">
              <h2 className="mb-6 text-lg font-medium">Thông tin khách hàng</h2>
              <GuestCheckoutForm
                onSubmit={handleGuestSubmit}
                onCancel={() => router.push("/gio-hang")}
              />
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="rounded-lg border p-6">
                    <h2 className="mb-4 flex items-center text-lg font-medium">
                      <User className="mr-2 h-5 w-5" />
                      Thông tin khách hàng
                    </h2>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="customerInfo.fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Họ tên</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập họ tên của bạn" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerInfo.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Số điện thoại</FormLabel>
                            <FormControl>
                              <Input placeholder="Nhập số điện thoại của bạn" {...field} />
                            </FormControl>
                            <FormMessage />
                            />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="customerInfo.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="Nhập email của bạn" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="rounded-lg border p-6">
                    <h2 className="mb-4 flex items-center text-lg font-medium">
                      <MapPin className="mr-2 h-5 w-5" />
                      Địa chỉ giao hàng
                    </h2>

                    <AddressForm form={form} />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/gio-hang")}
                    className="gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Giỏ hàng
                  </Button>

                  <Button type="submit" className="gap-2">
                    Tiếp tục
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </form>
          </Form>
        )}

        {currentStep === 3 && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="space-y-6">
                  <div className="rounded-lg border p-6">
                    <h2 className="mb-4 flex items-center text-lg font-medium">
                      <Truck className="mr-2 h-5 w-5" />
                      Phương thức vận chuyển
                    </h2>
                    <ShippingMethods form={form} />
                  </div>

                  <div className="rounded-lg border p-6">
                    <h2 className="mb-4 flex items-center text-lg font-medium">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Phương thức thanh toán
                    </h2>
                    <PaymentMethods form={form} />
                  </div>

                  <div className="rounded-lg border p-6">
                    <h2 className="mb-4 text-lg font-medium">Ghi chú đơn hàng</h2>
                    <FormField
                      control={form.control}
                      name="notes.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Textarea
                              placeholder="Nhập ghi chú cho đơn hàng (không bắt buộc)"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <Button type="button" variant="outline" onClick={goToPreviousStep} className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Quay lại
                  </Button>

                  <Button type="submit" className="gap-2">
                    Tiếp tục
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            </form>
          </Form>
        )}

        {currentStep === 4 && (
          <OrderReview
            formData={form.getValues()}
            onEdit={setCurrentStep}
            onConfirm={() => handleSubmit(form.getValues())}
            isSubmitting={isSubmitting}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

