"use client"

import { useState } from "react"
import { AlertCircle, Check, PackageCheck } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface OrderInventoryUpdateProps {
  orderId: string
  items: {
    id: string
    productName: string
    variantName: string
    quantity: number
    currentStock: number
  }[]
}

export function OrderInventoryUpdate({ orderId, items }: OrderInventoryUpdateProps) {
  const [open, setOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { toast } = useToast()

  const handleUpdateInventory = async () => {
    setIsUpdating(true)

    // Giả lập cập nhật tồn kho
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsUpdating(false)
    setOpen(false)

    toast({
      title: "Cập nhật tồn kho thành công",
      description: `Đã cập nhật tồn kho cho ${items.length} sản phẩm từ đơn hàng #${orderId}`,
      duration: 3000,
    })
  }

  // Kiểm tra xem có sản phẩm nào có số lượng tồn kho thấp sau khi cập nhật không
  const hasLowStock = items.some((item) => item.currentStock - item.quantity <= 5)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <PackageCheck className="h-4 w-4" />
          <span>Cập nhật tồn kho</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Cập nhật tồn kho</DialogTitle>
          <DialogDescription>Cập nhật tồn kho cho các sản phẩm trong đơn hàng #{orderId}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm">
            Khi chuyển trạng thái đơn hàng sang <strong>Shipped</strong>, hệ thống sẽ tự động cập nhật tồn kho cho các
            sản phẩm trong đơn hàng. Dưới đây là thông tin tồn kho sẽ được cập nhật:
          </p>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sản phẩm</TableHead>
                <TableHead className="text-center">Số lượng</TableHead>
                <TableHead className="text-center">Tồn kho hiện tại</TableHead>
                <TableHead className="text-center">Tồn kho sau cập nhật</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.variantName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-center">{item.currentStock}</TableCell>
                  <TableCell className="text-center">
                    <span className={item.currentStock - item.quantity <= 5 ? "text-destructive font-medium" : ""}>
                      {item.currentStock - item.quantity}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {hasLowStock && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Cảnh báo tồn kho thấp</AlertTitle>
              <AlertDescription>
                Một số sản phẩm sẽ có tồn kho thấp sau khi cập nhật. Vui lòng kiểm tra và nhập thêm hàng nếu cần thiết.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isUpdating}>
            Đóng
          </Button>
          <Button onClick={handleUpdateInventory} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <span className="mr-2">Đang cập nhật...</span>
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Xác nhận cập nhật
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

