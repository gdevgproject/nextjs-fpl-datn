"use client"

import { useState } from "react"
import { UserTable } from "./user-table"
import { UserDialog } from "./user-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useDebounce } from "../hooks/use-debounce"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function UserManagement() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const debouncedSearch = useDebounce(search, 500)

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý người dùng</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm người dùng
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Tìm kiếm theo tên, email, số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full md:w-1/4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Nhân viên</SelectItem>
              <SelectItem value="shipper">Người giao hàng</SelectItem>
              <SelectItem value="authenticated">Khách hàng</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <UserTable search={debouncedSearch} roleFilter={roleFilter === "all" ? undefined : roleFilter} />
      <UserDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}
