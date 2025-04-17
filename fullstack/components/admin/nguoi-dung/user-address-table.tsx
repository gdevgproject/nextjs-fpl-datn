"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pencil, Trash2, CheckCircle, MoreHorizontal, Copy } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface UserAddressTableProps {
  addresses: Array<{
    id: string
    recipient_name: string
    recipient_phone: string
    province_city: string
    district: string
    ward: string
    street_address: string
    is_default: boolean
    created_at: string
    updated_at: string
  }>
  onEdit: (address: any) => void
  onDelete: (address: any) => void
  onSetDefault: (address: any) => void
}

export function UserAddressTable({ addresses, onEdit, onDelete, onSetDefault }: UserAddressTableProps) {
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAddresses(addresses.map((address) => address.id))
    } else {
      setSelectedAddresses([])
    }
  }

  const handleSelectOne = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedAddresses((prev) => [...prev, id])
    } else {
      setSelectedAddresses((prev) => prev.filter((addressId) => addressId !== id))
    }
  }

  const handleCopyAddress = (address: any) => {
    const fullAddress = `${address.street_address}, ${address.ward}, ${address.district}, ${address.province_city}`
    navigator.clipboard.writeText(fullAddress)
    toast({
      title: "Đã sao chép địa chỉ",
      description: "Địa chỉ đã được sao chép vào clipboard",
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedAddresses.length === addresses.length && addresses.length > 0}
                onCheckedChange={handleSelectAll}
                aria-label="Chọn tất cả"
              />
            </TableHead>
            <TableHead>Người nhận</TableHead>
            <TableHead className="hidden md:table-cell">Số điện thoại</TableHead>
            <TableHead>Địa chỉ</TableHead>
            <TableHead className="hidden md:table-cell">Cập nhật</TableHead>
            <TableHead className="w-[100px]">Trạng thái</TableHead>
            <TableHead className="w-[100px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {addresses.map((address) => (
            <TableRow key={address.id}>
              <TableCell>
                <Checkbox
                  checked={selectedAddresses.includes(address.id)}
                  onCheckedChange={(checked) => handleSelectOne(checked as boolean, address.id)}
                  aria-label={`Chọn địa chỉ của ${address.recipient_name}`}
                />
              </TableCell>
              <TableCell className="font-medium">{address.recipient_name}</TableCell>
              <TableCell className="hidden md:table-cell">{address.recipient_phone}</TableCell>
              <TableCell className="max-w-[200px] truncate">
                {address.street_address}, {address.ward}, {address.district}, {address.province_city}
              </TableCell>
              <TableCell className="hidden md:table-cell">{formatDate(address.updated_at)}</TableCell>
              <TableCell>
                {address.is_default ? (
                  <Badge variant="outline" className="border-primary text-primary">
                    Mặc định
                  </Badge>
                ) : (
                  <Badge variant="outline">Thường</Badge>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Mở menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(address)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyAddress(address)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Sao chép địa chỉ
                    </DropdownMenuItem>
                    {!address.is_default && (
                      <DropdownMenuItem onClick={() => onSetDefault(address)}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Đặt làm mặc định
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(address)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

