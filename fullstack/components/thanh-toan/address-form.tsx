"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MapPin, Home, Building2, Plus, CheckCircle2 } from "lucide-react"

import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { UseFormReturn } from "react-hook-form"
import type { CheckoutFormValues } from "@/lib/validators/checkout-validators"

interface AddressFormProps {
  form: UseFormReturn<CheckoutFormValues>
}

// Giả lập dữ liệu địa chỉ đã lưu
const savedAddresses = [
  {
    id: "addr1",
    label: "Nhà riêng",
    icon: <Home className="h-4 w-4" />,
    recipientName: "Nguyễn Văn A",
    recipientPhone: "0901234567",
    provinceCity: "hcm",
    district: "q1",
    ward: "p1",
    streetAddress: "123 Đường Nguyễn Huệ",
    isDefault: true,
  },
  {
    id: "addr2",
    label: "Công ty",
    icon: <Building2 className="h-4 w-4" />,
    recipientName: "Nguyễn Văn A",
    recipientPhone: "0901234567",
    provinceCity: "hn",
    district: "q2",
    ward: "p2",
    streetAddress: "456 Đường Lê Lợi",
    isDefault: false,
  },
]

export function AddressForm({ form }: AddressFormProps) {
  const [addressType, setAddressType] = useState("existing")
  const [selectedAddress, setSelectedAddress] = useState(savedAddresses[0].id)
  const [isLoading, setIsLoading] = useState(true)
  const [provinces, setProvinces] = useState<{ id: string; name: string }[]>([])
  const [districts, setDistricts] = useState<{ id: string; name: string }[]>([])
  const [wards, setWards] = useState<{ id: string; name: string }[]>([])

  // Giả lập loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Giả lập dữ liệu tỉnh/thành phố
      setProvinces([
        { id: "hcm", name: "TP. Hồ Chí Minh" },
        { id: "hn", name: "Hà Nội" },
        { id: "dn", name: "Đà Nẵng" },
        { id: "hp", name: "Hải Phòng" },
        { id: "ct", name: "Cần Thơ" },
      ])

      // Giả lập dữ liệu quận/huyện
      setDistricts([
        { id: "q1", name: "Quận 1" },
        { id: "q2", name: "Quận 2" },
        { id: "q3", name: "Quận 3" },
        { id: "q4", name: "Quận 4" },
        { id: "q5", name: "Quận 5" },
      ])

      // Giả lập dữ liệu phường/xã
      setWards([
        { id: "p1", name: "Phường 1" },
        { id: "p2", name: "Phường 2" },
        { id: "p3", name: "Phường 3" },
        { id: "p4", name: "Phường 4" },
        { id: "p5", name: "Phường 5" },
      ])
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Cập nhật form khi chọn địa chỉ có sẵn
  useEffect(() => {
    if (addressType === "existing" && !isLoading) {
      const address = savedAddresses.find((addr) => addr.id === selectedAddress)
      if (address) {
        form.setValue("existingAddressId", address.id)
      }
    }
  }, [addressType, selectedAddress, form, isLoading])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="flex items-center space-x-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <RadioGroup defaultValue={addressType} onValueChange={setAddressType} className="mb-4">
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="existing" id="existing" />
          <Label htmlFor="existing" className="cursor-pointer">
            Sử dụng địa chỉ đã lưu
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="new" id="new" />
          <Label htmlFor="new" className="cursor-pointer">
            Sử dụng địa chỉ mới
          </Label>
        </div>
      </RadioGroup>

      <AnimatePresence mode="wait">
        {addressType === "existing" ? (
          <motion.div
            key="existing-address"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 overflow-hidden"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {savedAddresses.map((address) => (
                <motion.div
                  key={address.id}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "relative cursor-pointer rounded-lg border p-4 transition-all hover:border-primary/50",
                    selectedAddress === address.id ? "border-primary bg-primary/5" : "",
                  )}
                  onClick={() => setSelectedAddress(address.id)}
                >
                  <div className="absolute right-3 top-3">
                    <div
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded-full border-2",
                        selectedAddress === address.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {selectedAddress === address.id && <CheckCircle2 className="h-3 w-3" />}
                    </div>
                  </div>
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {address.icon}
                    </div>
                    <div className="font-medium">{address.label}</div>
                    {address.isDefault && (
                      <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">{address.recipientName}</p>
                    <p>{address.recipientPhone}</p>
                    <p className="mt-1 text-muted-foreground">
                      {address.streetAddress}, Phường {address.ward === "p1" ? "1" : "2"}, Quận{" "}
                      {address.district === "q1" ? "1" : "2"},{" "}
                      {address.provinceCity === "hcm" ? "TP. Hồ Chí Minh" : "Hà Nội"}
                    </p>
                  </div>
                </motion.div>
              ))}
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed p-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                onClick={() => setAddressType("new")}
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 border-current">
                  <Plus className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium">Thêm địa chỉ mới</span>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="new-address"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 overflow-hidden"
          >
            <Alert className="bg-blue-50 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <MapPin className="h-4 w-4" />
              <AlertDescription>
                Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng để đảm bảo đơn hàng được giao đến đúng nơi.
              </AlertDescription>
            </Alert>

            <FormField
              control={form.control}
              name="shippingAddress.recipientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên người nhận</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên người nhận" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingAddress.recipientPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại người nhận</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập số điện thoại người nhận" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="shippingAddress.provinceCity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tỉnh/Thành phố</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn tỉnh/thành phố" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province.id} value={province.id}>
                            {province.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingAddress.district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quận/Huyện</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn quận/huyện" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {districts.map((district) => (
                          <SelectItem key={district.id} value={district.id}>
                            {district.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingAddress.ward"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phường/Xã</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn phường/xã" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wards.map((ward) => (
                          <SelectItem key={ward.id} value={ward.id}>
                            {ward.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="shippingAddress.streetAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Địa chỉ cụ thể</FormLabel>
                  <FormControl>
                    <Input placeholder="Số nhà, tên đường, khu vực" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shippingAddress.saveAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Lưu địa chỉ này cho lần sau</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

