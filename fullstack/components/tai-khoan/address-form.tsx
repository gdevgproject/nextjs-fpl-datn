"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { addAddress, updateAddress } from "@/actions/address-actions"
import type { Tables } from "@/types/supabase"
import { Loader2 } from "lucide-react"
import { vietnamProvinces, getDistrictsByProvince, getWardsByDistrict } from "@/lib/vietnam-address"

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
    message: "Địa chỉ cụ thể phải có ít nhất 5 ký tự",
  }),
  is_default: z.boolean().default(false),
})

type AddressFormValues = z.infer<typeof addressFormSchema>

interface AddressFormProps {
  address?: Tables<"addresses">
}

export function AddressForm({ address }: AddressFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [districts, setDistricts] = useState<{ code: string; name: string }[]>([])
  const [wards, setWards] = useState<{ code: string; name: string }[]>([])
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      recipient_name: address?.recipient_name || "",
      recipient_phone: address?.recipient_phone || "",
      province_city: address?.province_city || "",
      district: address?.district || "",
      ward: address?.ward || "",
      street_address: address?.street_address || "",
      is_default: address?.is_default || false,
    },
  })

  // Cập nhật danh sách quận/huyện khi tỉnh/thành phố thay đổi
  useEffect(() => {
    const province = form.watch("province_city")
    if (province) {
      const provinceDistricts = getDistrictsByProvince(province)
      setDistricts(provinceDistricts)

      // Reset quận/huyện và phường/xã nếu tỉnh/thành phố thay đổi
      if (!address || province !== address.province_city) {
        form.setValue("district", "")
        form.setValue("ward", "")
        setWards([])
      }
    }
  }, [form.watch("province_city"), form, address])

  // Cập nhật danh sách phường/xã khi quận/huyện thay đổi
  useEffect(() => {
    const district = form.watch("district")
    if (district) {
      const districtWards = getWardsByDistrict(district)
      setWards(districtWards)

      // Reset phường/xã nếu quận/huyện thay đổi
      if (!address || district !== address.district) {
        form.setValue("ward", "")
      }
    }
  }, [form.watch("district"), form, address])

  // Khởi tạo danh sách quận/huyện và phường/xã khi chỉnh sửa địa chỉ
  useEffect(() => {
    if (address) {
      const provinceDistricts = getDistrictsByProvince(address.province_city)
      setDistricts(provinceDistricts)

      const districtWards = getWardsByDistrict(address.district)
      setWards(districtWards)
    }
  }, [address])

  async function onSubmit(values: AddressFormValues) {
    try {
      setIsSubmitting(true)

      let result

      if (address) {
        // Cập nhật địa chỉ
        result = await updateAddress(address.id, values)
      } else {
        // Thêm địa chỉ mới
        result = await addAddress(values)
      }

      if (result.success) {
        toast({
          title: address ? "Cập nhật địa chỉ thành công" : "Thêm địa chỉ thành công",
          description: address ? "Địa chỉ đã được cập nhật" : "Địa chỉ mới đã được thêm vào danh sách của bạn",
        })
        router.push("/tai-khoan/dia-chi")
      } else {
        toast({
          title: address ? "Cập nhật địa chỉ thất bại" : "Thêm địa chỉ thất bại",
          description: result.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting address:", error)
      toast({
        title: address ? "Cập nhật địa chỉ thất bại" : "Thêm địa chỉ thất bại",
        description: "Đã xảy ra lỗi khi xử lý yêu cầu",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
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
                <FormDescription>Ví dụ: 0912345678 hoặc +84912345678</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="province_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/Thành phố</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Tỉnh/Thành phố" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {vietnamProvinces.map((province) => (
                      <SelectItem key={province.code} value={province.name}>
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
            name="district"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quận/Huyện</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={districts.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Quận/Huyện" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {districts.map((district) => (
                      <SelectItem key={district.code} value={district.name}>
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
            name="ward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phường/Xã</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={wards.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn Phường/Xã" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {wards.map((ward) => (
                      <SelectItem key={ward.code} value={ward.name}>
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
          name="street_address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Địa chỉ cụ thể</FormLabel>
              <FormControl>
                <Input placeholder="Số nhà, tên đường, khu vực..." {...field} />
              </FormControl>
              <FormDescription>Ví dụ: 123 Đường Nguyễn Văn A, Khu phố 1</FormDescription>
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

        <div className="flex gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {address ? "Đang cập nhật" : "Đang thêm"}
              </>
            ) : address ? (
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

