import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { PlusCircle } from "lucide-react"
import { AddressCard } from "@/components/tai-khoan/address-card"

export default function AddressesPage() {
  // Dữ liệu mẫu
  const addresses = [
    {
      id: 1,
      recipient_name: "Nguyễn Văn A",
      recipient_phone: "0912345678",
      province_city: "Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      street_address: "123 Lê Lợi",
      is_default: true,
    },
    {
      id: 2,
      recipient_name: "Nguyễn Văn A",
      recipient_phone: "0912345678",
      province_city: "Hà Nội",
      district: "Quận Ba Đình",
      ward: "Phường Điện Biên",
      street_address: "45 Điện Biên Phủ",
      is_default: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Sổ địa chỉ</h2>
          <p className="text-muted-foreground">Quản lý địa chỉ giao hàng của bạn</p>
        </div>
        <Button asChild>
          <Link href="/tai-khoan/dia-chi/them">
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm địa chỉ mới
          </Link>
        </Button>
      </div>
      <Separator />
      {addresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <h3 className="mb-2 text-lg font-medium">Chưa có địa chỉ nào</h3>
          <p className="mb-4 text-sm text-muted-foreground">Bạn chưa có địa chỉ nào trong sổ địa chỉ</p>
          <Button asChild>
            <Link href="/tai-khoan/dia-chi/them">
              <PlusCircle className="mr-2 h-4 w-4" />
              Thêm địa chỉ mới
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

