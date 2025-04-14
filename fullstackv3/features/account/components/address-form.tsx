"use client"

import { useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { useAddAddress, useUpdateAddress, useUserAddresses } from "../queries"
import { Loader2 } from "lucide-react"
import type { Address } from "@/lib/types/shared.types"

// Schema cho form địa chỉ
const addressFormSchema = z.object({
  recipient_name: z.string().min(2, { message: "Tên người nhận phải có ít nhất 2 ký tự" }),
  recipient_phone: z.string().regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, {
    message: "Số điện thoại không hợp lệ",
  }),
  province_city: z.string().min(1, { message: "Vui lòng nhập tỉnh/thành phố" }),
  district: z.string().min(1, { message: "Vui lòng nhập quận/huyện" }),
  ward: z.string().min(1, { message: "Vui lòng nhập phường/xã" }),
  street_address: z.string().min(1, { message: "Vui lòng nhập địa chỉ cụ thể" }),
  postal_code: z.string().optional(),
  is_default: z.boolean().default(false),
})

type AddressFormValues = z.infer<typeof addressFormSchema>

interface AddressFormProps {
  address?: Address
  onCancel: () => void
  onSuccess: () => void
}

export function AddressForm({ address, onCancel, onSuccess }: AddressFormProps) {
  const { toast } = useToast()
  const addAddressMutation = useAddAddress()
  const updateAddressMutation = useUpdateAddress()
  const { data: addresses, isLoading: isLoadingAddresses } = useUserAddresses()

  // Kiểm tra xem đây có phải là địa chỉ đầu tiên không
  const isFirstAddress = !isLoadingAddresses && (!addresses || addresses.length === 0)

  // Khởi tạo form với giá trị mặc định
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      recipient_name: address?.recipient_name || "",
      recipient_phone: address?.recipient_phone || "",
      province_city: address?.province_city || "",
      district: address?.district || "",
      ward: address?.ward || "",
      street_address: address?.street_address || "",
      postal_code: address?.postal_code || "",
      is_default: address?.is_default || isFirstAddress, // Tự động chọn là mặc định nếu là địa chỉ đầu tiên
    },
  })

  // Cập nhật form khi address thay đổi hoặc khi biết đây là địa chỉ đầu tiên
  useEffect(() => {
    if (address) {
      form.reset({
        recipient_name: address.recipient_name,
        recipient_phone: address.recipient_phone,
        province_city: address.province_city,
        district: address.district,
        ward: address.ward,
        street_address: address.street_address,
        postal_code: address.postal_code || "",
        is_default: address.is_default,
      })
    } else if (isFirstAddress) {
      form.setValue("is_default", true)
    }
  }, [address, form, isFirstAddress])

  // Xử lý khi submit form
  async function onSubmit(values: AddressFormValues) {
    try {
      if (address) {
        // Cập nhật địa chỉ
        await updateAddressMutation.mutateAsync({
          id: address.id,
          ...values,
        })
        toast({
          title: "Cập nhật địa chỉ thành công",
          description: "Địa chỉ của bạn đã được cập nhật",
        })
      } else {
        // Thêm địa chỉ mới
        await addAddressMutation.mutateAsync(values)
        toast({
          title: "Thêm địa chỉ thành công",
          description: "Địa chỉ mới đã được thêm vào danh sách của bạn",
        })
      }
      onSuccess()
    } catch (error) {
      toast({
        title: address ? "Cập nhật địa chỉ thất bại" : "Thêm địa chỉ thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi khi lưu địa chỉ",
        variant: "destructive",
      })
    }
  }

  const isSubmitting = addAddressMutation.isPending || updateAddressMutation.isPending

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Form fields remain the same */}
        <div className="grid gap-4 sm:grid-cols-2">
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
                  <Input placeholder="0912345678" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="province_city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tỉnh/Thành phố</FormLabel>
                <FormControl>
                  <Input placeholder="Hà Nội" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="Cầu Giấy" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="ward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phường/Xã</FormLabel>
                <FormControl>
                  <Input placeholder="Dịch Vọng" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="postal_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mã bưu điện (tùy chọn)</FormLabel>
                <FormControl>
                  <Input placeholder="100000" {...field} />
                </FormControl>
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
                <Input placeholder="Số 1, Đường ABC" {...field} />
              </FormControl>
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
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isFirstAddress} // Disable nếu là địa chỉ đầu tiên
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Đặt làm địa chỉ mặc định
                  {isFirstAddress && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (Địa chỉ đầu tiên sẽ tự động là mặc định)
                    </span>
                  )}
                </FormLabel>
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
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

