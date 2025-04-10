"use client"

import { useState } from "react"
import { AlertCircle, ArrowLeft, Check, RefreshCw, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"

interface OrderInventoryManagementProps {
  orderId: string
  items: {
    id: string
    productName: string
    variantName: string
    quantity: number
    currentStock: number
  }[]
  onBack: () => void
}

export function OrderInventoryManagement({ orderId, items, onBack }: OrderInventoryManagementProps) {
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [adjustedItems, setAdjustedItems] = useState(
    items.map((item) => ({
      ...item,
      adjustedQuantity: item.quantity,
    })),
  )

  // Kiểm tra xem có sản phẩm nào có số lượng tồn kho thấp sau khi cập nhật không
  const hasLowStock = adjustedItems.some(
    (item) => item.currentStock - item.adjustedQuantity <= 5 && item.currentStock - item.adjustedQuantity >= 0,
  )

  // Kiểm tra xem có sản phẩm nào không đủ tồn kho không
  const hasInsufficientStock = adjustedItems.some((item) => item.currentStock - item.adjustedQuantity < 0)

  // Xử lý khi thay đổi số lượng điều chỉnh
  const handleQuantityChange = (id: string, value: string) => {
    const quantity = Number.parseInt(value) || 0
    setAdjustedItems((prev) => prev.map((item) => (item.id === id ? { ...item, adjustedQuantity: quantity } : item)))
  }

  // Xử lý khi cập nhật tồn kho
  const handleUpdateInventory = () => {
    setIsUpdating(true)

    // Giả lập cập nhật tồn kho
    setTimeout(() => {
      setIsUpdating(false)

      toast({
        title: "Cập nhật tồn kho thành công",
        description: `Đã cập nhật tồn kho cho ${items.length} sản phẩm từ đơn hàng #${orderId}`,
      })

      onBack()
    }, 1500)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Button>
          <div>
            <CardTitle>Cập nhật tồn kho</CardTitle>
            <CardDescription>Cập nhật tồn kho cho các sản phẩm trong đơn hàng #{orderId}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm">
          Khi chuyển trạng thái đơn hàng sang <strong>Shipped</strong>, hệ thống sẽ tự động cập nhật tồn kho cho các sản
          phẩm trong đơn hàng. Bạn có thể điều chỉnh số lượng trước khi cập nhật.
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
            {adjustedItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">{item.variantName}</p>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Input
                    type="number"
                    min="0"
                    value={item.adjustedQuantity}
                    onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                    className="w-20 mx-auto text-center"
                  />
                </TableCell>
                <TableCell className="text-center">{item.currentStock}</TableCell>
                <TableCell className="text-center">
                  <span
                    className={
                      item.currentStock - item.adjustedQuantity < 0
                        ? "text-destructive font-medium"
                        : item.currentStock - item.adjustedQuantity <= 5
                          ? "text-amber-500 font-medium"
                          : ""
                    }
                  >
                    {item.currentStock - item.adjustedQuantity}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {hasInsufficientStock && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Tồn kho không đủ</AlertTitle>
            <AlertDescription>
              Một số sản phẩm không có đủ tồn kho. Vui lòng điều chỉnh số lượng hoặc cập nhật tồn kho trước khi tiếp
              tục.
            </AlertDescription>
          </Alert>
        )}

        {!hasInsufficientStock && hasLowStock && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Cảnh báo tồn kho thấp</AlertTitle>
            <AlertDescription>
              Một số sản phẩm sẽ có tồn kho thấp sau khi cập nhật. Vui lòng kiểm tra và nhập thêm hàng nếu cần thiết.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" className="gap-1">
          <RefreshCw className="h-4 w-4" />
          <span>Đồng bộ tồn kho</span>
        </Button>

        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack} disabled={isUpdating}>
            <X className="mr-2 h-4 w-4" />
            Hủy
          </Button>
          <Button onClick={handleUpdateInventory} disabled={isUpdating || hasInsufficientStock} className="gap-2">
            {isUpdating ? (
              <span>Đang cập nhật...</span>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Xác nhận cập nhật</span>
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

