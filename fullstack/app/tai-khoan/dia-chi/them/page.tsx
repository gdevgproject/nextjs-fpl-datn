import type { Metadata } from "next"
import { AddressForm } from "@/components/tai-khoan/address-form"

export const metadata: Metadata = {
  title: "Thêm địa chỉ mới - MyBeauty",
  description: "Thêm địa chỉ giao hàng mới",
}

export default function AddAddressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Thêm địa chỉ mới</h3>
        <p className="text-sm text-muted-foreground">Thêm địa chỉ giao hàng mới vào danh sách của bạn</p>
      </div>

      <AddressForm />
    </div>
  )
}

