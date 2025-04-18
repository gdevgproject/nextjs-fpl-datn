"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useSonnerToast } from "@/lib/hooks/use-sonner-toast";
import { useAddAddress, useUpdateAddress } from "../queries";
import type { Address } from "../types";
import { Loader2 } from "lucide-react";
import { useAuthQuery } from "@/features/auth/hooks";

const addressSchema = z.object({
  recipient_name: z.string().min(2, "Tên người nhận phải có ít nhất 2 ký tự"),
  recipient_phone: z
    .string()
    .regex(/^(0|\+84)[3|5|7|8|9][0-9]{8}$/, "Số điện thoại không hợp lệ"),
  province_city: z.string().min(1, "Vui lòng nhập tỉnh/thành phố"),
  district: z.string().min(1, "Vui lòng nhập quận/huyện"),
  ward: z.string().min(1, "Vui lòng nhập phường/xã"),
  street_address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
  postal_code: z.string().optional(),
  is_default: z.boolean().default(false),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  address?: Address;
  onCancel: () => void;
  onSuccess: () => void;
  isFirstAddress?: boolean;
}

export function AddressForm({
  address,
  onCancel,
  onSuccess,
  isFirstAddress = false,
}: AddressFormProps) {
  const { toast } = useSonnerToast();
  const { data: session } = useAuthQuery();
  const userId = session?.user?.id;
  const addAddressMutation = useAddAddress(userId);
  const updateAddressMutation = useUpdateAddress(userId);
  const isSubmitting =
    addAddressMutation.isPending || updateAddressMutation.isPending;

  // Form setup with default values
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: address
      ? {
          recipient_name: address.recipient_name,
          recipient_phone: address.recipient_phone,
          province_city: address.province_city,
          district: address.district,
          ward: address.ward,
          street_address: address.street_address,
          postal_code: address.postal_code || "",
          is_default: address.is_default,
        }
      : {
          recipient_name: "",
          recipient_phone: "",
          province_city: "",
          district: "",
          ward: "",
          street_address: "",
          postal_code: "",
          is_default: isFirstAddress,
        },
  });

  // Update form if address changes
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
      });
    }
  }, [address, form]);

  // Form submission handler
  async function onSubmit(values: AddressFormValues) {
    // If editing an existing address
    if (address) {
      updateAddressMutation.mutate(
        { id: address.id, ...values },
        {
          onSuccess: () => {
            toast("Địa chỉ đã được cập nhật", {
              description:
                "Thông tin địa chỉ của bạn đã được cập nhật thành công",
            });
            onSuccess();
          },
          onError: (error) => {
            toast("Không thể cập nhật địa chỉ", {
              description:
                error instanceof Error
                  ? error.message
                  : "Đã xảy ra lỗi khi cập nhật địa chỉ",
            });
          },
        }
      );
    } else {
      // Adding a new address
      addAddressMutation.mutate(values, {
        onSuccess: () => {
          toast("Địa chỉ đã được thêm", {
            description: "Địa chỉ mới đã được thêm thành công",
          });
          onSuccess();
        },
        onError: (error) => {
          toast("Không thể thêm địa chỉ", {
            description:
              error instanceof Error
                ? error.message
                : "Đã xảy ra lỗi khi thêm địa chỉ mới",
          });
        },
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="recipient_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên người nhận</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Nguyễn Văn A"
                    disabled={isSubmitting}
                  />
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
                  <Input
                    {...field}
                    placeholder="0912345678"
                    disabled={isSubmitting}
                  />
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
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Hà Nội"
                    disabled={isSubmitting}
                  />
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
                  <Input
                    {...field}
                    placeholder="Cầu Giấy"
                    disabled={isSubmitting}
                  />
                </FormControl>
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
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Dịch Vọng"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="street_address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Địa chỉ cụ thể</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Số 1, Đường ABC"
                    disabled={isSubmitting}
                  />
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
                <FormLabel>Mã bưu điện (không bắt buộc)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="100000"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="is_default"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
              <div className="space-y-1 leading-none">
                <FormLabel>Đặt làm địa chỉ mặc định</FormLabel>
                <FormDescription>
                  Địa chỉ này sẽ được sử dụng mặc định cho đơn hàng của bạn
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting || (address && address.is_default)}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {address ? "Đang cập nhật..." : "Đang thêm..."}
              </>
            ) : address ? (
              "Cập nhật địa chỉ"
            ) : (
              "Thêm địa chỉ"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
