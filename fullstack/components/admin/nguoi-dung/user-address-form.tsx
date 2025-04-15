"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Định nghĩa schema validation
const addressFormSchema = z.object({
  recipient_name: z.string().min(2, {
    message: "Tên người nhận phải có ít nhất 2 ký tự",
  }),
  recipient_phone: z.string().regex(/^0\d{9}$/, {
    message: "Số điện thoại không hợp lệ (phải có 10 số và bắt đầu bằng số 0)",
  }),
  province_city: z.string().min(1, {
    message: "Vui lòng chọn tỉnh/thành phố",
  }),
  district: z.string().min(1, {
    message: "Vui lòng chọn quận/huyện",
  }),
  ward: z.string().min(1, {
    message: "Vui lòng chọn phường/xã",
  }),
  street_address: z.string().min(5, {
    message: "Địa chỉ chi tiết phải có ít nhất 5 ký tự",
  }),
  is_default: z.boolean().default(false),
})

// Mock data cho select
const provinces = [
  { value: "Thành phố Hồ Chí Minh", label: "Thành phố Hồ Chí Minh" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
  { value: "Cần Thơ", label: "Cần Thơ" },
  { value: "Hải Phòng", label: "Hải Phòng" },
]

const districts = {
  "Thành phố Hồ Chí Minh": [
    { value: "Quận 1", label: "Quận 1" },
    { value: "Quận 2", label: "Quận 2" },
    { value: "Quận 3", label: "Quận 3" },
    { value: "Quận 7", label: "Quận 7" },
    { value: "Quận Bình Thạnh", label: "Quận Bình Thạnh" },
  ],
  "Hà Nội": [
    { value: "Quận Ba Đình", label: "Quận Ba Đình" },
    { value: "Quận Hoàn Kiếm", label: "Quận Hoàn Kiếm" },
    { value: "Quận Cầu Giấy", label: "Quận Cầu Giấy" },
    { value: "Quận Hai Bà Trưng", label: "Quận Hai Bà Trưng" },
  ],
  "Đà Nẵng": [
    { value: "Quận Hải Châu", label: "Quận Hải Châu" },
    { value: "Quận Thanh Khê", label: "Quận Thanh Khê" },
    { value: "Quận Sơn Trà", label: "Quận Sơn Trà" },
  ],
  "Cần Thơ": [
    { value: "Quận Ninh Kiều", label: "Quận Ninh Kiều" },
    { value: "Quận Bình Thủy", label: "Quận Bình Thủy" },
    { value: "Quận Cái Răng", label: "Quận Cái Răng" },
  ],
  "Hải Phòng": [
    { value: "Quận Hồng Bàng", label: "Quận Hồng Bàng" },
    { value: "Quận Ngô Quyền", label: "Quận Ngô Quyền" },
    { value: "Quận Lê Chân", label: "Quận Lê Chân" },
  ],
}

const wards = {
  "Quận 1": [
    { value: "Phường Bến Nghé", label: "Phường Bến Nghé" },
    { value: "Phường Bến Thành", label: "Phường Bến Thành" },
    { value: "Phường Đa Kao", label: "Phường Đa Kao" },
  ],
  "Quận 7": [
    { value: "Phường Tân Phong", label: "Phường Tân Phong" },
    { value: "Phường Tân Thuận Đông", label: "Phường Tân Thuận Đông" },
    { value: "Phường Tân Thuận Tây", label: "Phường Tân Thuận Tây" },
  ],
  "Quận Cầu Giấy": [
    { value: "Phường Dịch Vọng", label: "Phường Dịch Vọng" },
    { value: "Phường Mai Dịch", label: "Phường Mai Dịch" },
    { value: "Phường Nghĩa Đô", label: "Phường Nghĩa Đô" },
  ],
  "Quận Hải Châu": [
    { value: "Phường Thạch Thang", label: "Phường Thạch Thang" },
    { value: "Phường Thanh Bình", label: "Phường Thanh Bình" },
    { value: "Phường Hải Châu 1", label: "Phường Hải Châu 1" },
  ],
  "Quận Ninh Kiều": [
    { value: "Phường Tân An", label: "Phường Tân An" },
    { value: "Phường An Phú", label: "Phường An Phú" },
    { value: "Phường Xuân Khánh", label: "Phường Xuân Khánh" },
  ],
  // Thêm các phường/xã cho các quận/huyện khác
}

interface UserAddressFormProps {
  userId: string
  address?: {
    id: string
    recipient_name: string
    recipient_phone: string
    province_city: string
    district: string
    ward: string
    street_address: string
    is_default: boolean
  }
  onSubmit: () => void
}

export function UserAddressForm({ userId, address, onSubmit }: UserAddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState(address?.province_city || "")
  const [selectedDistrict, setSelectedDistrict] = useState(address?.district || "")

  // Khởi tạo form với giá trị mặc định từ address (nếu có)
  const form = useForm<z.infer<typeof addressFormSchema>>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: address
      ? {
          recipient_name: address.recipient_name,
          recipient_phone: address.recipient_phone,
          province_city: address.province_city,
          district: address.district,
          ward: address.ward,
          street_address: address.street_address,
          is_default: address.is_default,
        }
      : {
          recipient_name: "",
          recipient_phone: "",
          province_city: "",
          district: "",
          ward: "",
          street_address: "",
          is_default: false,
        },
  })

  async function handleSubmit(values: z.infer<typeof addressFormSchema>) {
    setIsSubmitting(true)

    try {
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Form values:", values)
      console.log("User ID:", userId)

      // Gọi callback để đóng dialog
      onSubmit()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="recipient_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên người nhận</FormLabel>
                <FormControl>
                  <Input placeholder="Nguyễn Văn A" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recipient_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="0901234567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="province_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/Thành phố</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedProvince(value)
                    form.setValue("district", "")
                    form.setValue("ward", "")
                    setSelectedDistrict("")
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn tỉnh/thành phố" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {provinces.map((province) => (
                      <SelectItem key={province.value} value={province.value}>
                        {province.label}
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
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quận/Huyện</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    setSelectedDistrict(value)
                    form.setValue("ward", "")
                  }}
                  defaultValue={field.value}
                  disabled={!selectedProvince}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn quận/huyện" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedProvince &&
                      districts[selectedProvince as keyof typeof districts]?.map((district) => (
                        <SelectItem key={district.value} value={district.value}>
                          {district.label}
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
            name="ward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phường/Xã</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedDistrict}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn phường/xã" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedDistrict &&
                      wards[selectedDistrict as keyof typeof wards]?.map((ward) => (
                        <SelectItem key={ward.value} value={ward.value}>
                          {ward.label}
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
          name="street_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ chi tiết</FormLabel>
              <FormControl>
                <Input placeholder="Số nhà, tên đường..." {...field} />
              </FormControl>
              <FormDescription>Nhập số nhà, tên đường, tòa nhà, v.v.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Đặt làm địa chỉ mặc định</FormLabel>
                <FormDescription>Địa chỉ này sẽ được sử dụng làm địa chỉ mặc định cho đơn hàng.</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onSubmit}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {address ? "Cập nhật" : "Thêm mới"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

