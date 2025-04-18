"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PlusCircle, Search } from "lucide-react"
import { DiscountDialog } from "./discount-dialog"
import { DiscountTable } from "./discount-table"
import { useDebounce } from "../hooks/use-debounce"

export function DiscountManagement() {
  const [search, setSearch] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingDiscount, setEditingDiscount] = useState<any>(null)
  const debouncedSearch = useDebounce(search, 300)

  const handleOpenCreateDialog = () => {
    setEditingDiscount(null)
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (discount: any) => {
    setEditingDiscount(discount)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Tìm kiếm mã giảm giá..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={handleOpenCreateDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Thêm mã giảm giá
        </Button>
      </div>

      <DiscountTable search={debouncedSearch} onEdit={handleOpenEditDialog} />

      <DiscountDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={editingDiscount ? "edit" : "create"}
        discount={editingDiscount}
      />
    </div>
  )
}
