"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const addressFormSchema = z.object({
  recipient_name: z.string().min(2, {
    message: "Tên người nhận phải có ít nhất 2 ký tự",
  }),
  recipient_phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, {
    message: "Số điện thoại không hợp lệ",
  }),
  province_city: z.string({
    required_error: "Vui lòng chọn Tỉnh/Thành phố",
  }),
  district: z.string({
    required_error: "Vui lòng chọn Quận/Huyện",
  }),
  ward: z.string({
    required_error: "Vui lòng chọn Phường/Xã",
  }),
  street_address: z.string().min(5, {
    message: "Địa chỉ phải có ít nhất 5 ký tự",
  }),
  is_default: z.boolean().default(false),
})

type AddressFormValues = z.infer<typeof addressFormSchema>

interface AddressFormProps {
  initialData?: {
    id: number
    recipient_name: string
    recipient_phone: string
    province_city: string
    district: string
    ward: string
    street_address: string
    is_default: boolean
  }
}

// Dữ liệu mẫu cho dropdown
const provinces = [
  { value: "Hồ Chí Minh", label: "Hồ Chí Minh" },
  { value: "Hà Nội", label: "Hà Nội" },
  { value: "Đà Nẵng", label: "Đà Nẵng" },
]

const districts = {
  "Hồ Chí Minh": [
    { value: "Quận 1", label: "Quận 1" },
    { value: "Quận 2", label: "Quận 2" },
    { value: "Quận 3", label: "Quận 3" },
  ],
  "Hà Nội": [
    { value: "Quận Ba Đình", label: "Quận Ba Đình" },
    { value: "Quận Hoàn Kiếm", label: "Quận Hoàn Kiếm" },
    { value: "Quận Hai Bà Trưng", label: "Quận Hai Bà Trưng" },
  ],
  "Đà Nẵng": [
    { value: "Quận Hải Châu", label: "Quận Hải Châu" },
    { value: "Quận Thanh Khê", label: "Quận Thanh Khê" },
    { value: "Quận Liên Chiểu", label: "Quận Liên Chiểu" },
  ],
}

const wards = {
  "Quận 1": [
    { value: "Phường Bến Nghé", label: "Phường Bến Nghé" },
    { value: "Phường Bến Thành", label: "Phường Bến Thành" },
  ],
  "Quận Ba Đình": [
    { value: "Phường Điện Biên", label: "Phường Điện Biên" },
    { value: "Phường Đội Cấn", label: "Phường Đội Cấn" },
  ],
  "Quận Hải Châu": [
    { value: "Phường Hải Châu 1", label: "Phường Hải Châu 1" },
    { value: "Phường Hải Châu 2", label: "Phường Hải Châu 2" },
  ],
}

export function AddressForm({ initialData }: AddressFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProvince, setSelectedProvince] = useState(initialData?.province_city || "")
  const [selectedDistrict, setSelectedDistrict] = useState(initialData?.district || "")

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: initialData
      ? {
          recipient_name: initialData.recipient_name,
          recipient_phone: initialData.recipient_phone,
          province_city: initialData.province_city,
          district: initialData.district,
          ward: initialData.ward,
          street_address: initialData.street_address,
          is_default: initialData.is_default,
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

  function onSubmit(data: AddressFormValues) {
    setIsSubmitting(true)

    // Giả lập API call
    setTimeout(() => {
      console.log(data)
      toast({
        title: initialData ? "Cập nhật địa chỉ thành công" : "Thêm địa chỉ thành công",
        description: initialData
          ? "Địa chỉ của bạn đã được cập nhật"
          : "Địa chỉ mới đã được thêm vào sổ địa chỉ của bạn",
      })
      setIsSubmitting(false)
      router.push("/tai-khoan/dia-chi")
    }, 1000)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="recipient_name"
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
            name="recipient_phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Số điện thoại</FormLabel>
                <FormControl>
                  <Input placeholder="Nhập số điện thoại" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
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
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
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
                      <SelectValue placeholder="Chọn Quận/Huyện" />
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
                      <SelectValue placeholder="Chọn Phường/Xã" />
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
              <FormLabel>Địa chỉ cụ thể</FormLabel>
              <FormControl>
                <Input placeholder="Số nhà, tên đường, khu vực" {...field} />
              </FormControl>
              <FormDescription>Vui lòng nhập số nhà, tên đường, tòa nhà, khu vực...</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Đặt làm địa chỉ mặc định</FormLabel>
                <FormDescription>Địa chỉ này sẽ được sử dụng mặc định khi thanh toán</FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex space-x-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý
              </>
            ) : initialData ? (
              "Cập nhật địa chỉ"
            ) : (
              "Thêm địa chỉ"
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/tai-khoan/dia-chi")}>
            Hủy
          </Button>
        </div>
      </form>
    </Form>
  )
}

