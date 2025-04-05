"use client"

import { useState } from "react"
import { CreditCard, Banknote, Wallet, Edit, Trash2, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PaymentMethodForm } from "./payment-method-form"

// Giả lập dữ liệu phương thức thanh toán
const paymentMethods = [
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)",
    description: "Thanh toán bằng tiền mặt khi nhận hàng",
    is_active: true,
    icon: <Banknote className="h-5 w-5" />,
    instructions: "Quý khách sẽ thanh toán bằng tiền mặt cho nhân viên giao hàng khi nhận được đơn hàng.",
    fee: "0",
    fee_type: "fixed",
  },
  {
    id: "bank_transfer",
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản qua tài khoản ngân hàng",
    is_active: true,
    icon: <CreditCard className="h-5 w-5" />,
    instructions:
      "Vui lòng chuyển khoản đến tài khoản:\nNgân hàng: Vietcombank\nSố tài khoản: 1234567890\nChủ tài khoản: MyBeauty\nNội dung: [Mã đơn hàng]",
    fee: "0",
    fee_type: "fixed",
  },
  {
    id: "momo",
    name: "Ví MoMo",
    description: "Thanh toán qua ví điện tử MoMo",
    is_active: false,
    icon: <Wallet className="h-5 w-5" />,
    instructions: "Quét mã QR hoặc chuyển khoản đến số điện thoại 0987654321",
    fee: "0",
    fee_type: "fixed",
  },
  {
    id: "zalopay",
    name: "ZaloPay",
    description: "Thanh toán qua ví điện tử ZaloPay",
    is_active: false,
    icon: <Wallet className="h-5 w-5" />,
    instructions: "Quét mã QR hoặc chuyển khoản đến số điện thoại 0987654321",
    fee: "0",
    fee_type: "fixed",
  },
  {
    id: "vnpay",
    name: "VNPAY",
    description: "Thanh toán qua cổng thanh toán VNPAY",
    is_active: true,
    icon: <CreditCard className="h-5 w-5" />,
    instructions: "Quý khách sẽ được chuyển đến cổng thanh toán VNPAY để hoàn tất giao dịch",
    fee: "0",
    fee_type: "fixed",
  },
]

export function PaymentMethodList() {
  const [methods, setMethods] = useState(paymentMethods)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [editingMethod, setEditingMethod] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false)
  const { toast } = useToast()

  const handleStatusChange = (id: string, newStatus: boolean) => {
    setIsLoading(true)

    // Giả lập API call
    setTimeout(() => {
      setMethods(methods.map((method) => (method.id === id ? { ...method, is_active: newStatus } : method)))
      setIsLoading(false)
      toast({
        title: "Cập nhật thành công",
        description: `Phương thức thanh toán đã được ${newStatus ? "kích hoạt" : "vô hiệu hóa"}`,
      })
    }, 500)
  }

  const handleEdit = (method: any) => {
    setEditingMethod(method)
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa phương thức thanh toán này?")) {
      setIsLoading(true)

      // Giả lập API call
      setTimeout(() => {
        setMethods(methods.filter((method) => method.id !== id))
        setIsLoading(false)
        toast({
          title: "Xóa thành công",
          description: "Phương thức thanh toán đã được xóa",
        })
      }, 500)
    }
  }

  const handleSaveMethod = (method: any) => {
    setIsLoading(true)

    // Giả lập API call
    setTimeout(() => {
      if (editingMethod) {
        // Cập nhật phương thức hiện có
        setMethods(methods.map((m) => (m.id === method.id ? method : m)))
        toast({
          title: "Cập nhật thành công",
          description: "Phương thức thanh toán đã được cập nhật",
        })
      } else {
        // Thêm phương thức mới
        setMethods([...methods, { ...method, id: Date.now().toString() }])
        toast({
          title: "Thêm thành công",
          description: "Phương thức thanh toán mới đã được thêm",
        })
      }
      setIsLoading(false)
      setIsDialogOpen(false)
      setEditingMethod(null)
    }, 1000)
  }

  const handleAddNew = () => {
    setEditingMethod(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {methods.map((method) => (
          <Card key={method.id} className={`${!method.is_active ? "opacity-70" : ""}`}>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
              <div className="flex items-center space-x-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  {method.icon}
                </div>
                <div>
                  <CardTitle className="text-base">{method.name}</CardTitle>
                  <CardDescription className="text-xs">{method.description}</CardDescription>
                </div>
              </div>
              <Badge variant={method.is_active ? "default" : "outline"}>
                {method.is_active ? "Đang hoạt động" : "Đã tắt"}
              </Badge>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="mt-2 space-y-2">
                <div className="text-xs text-muted-foreground whitespace-pre-line">{method.instructions}</div>
                {method.fee !== "0" && (
                  <div className="text-xs">
                    <span className="font-medium">Phí:</span> {method.fee}
                    {method.fee_type === "percentage" ? "%" : "đ"}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={method.is_active}
                  onCheckedChange={(checked) => handleStatusChange(method.id, checked)}
                  disabled={isLoading}
                />
                <span className="text-sm">{method.is_active ? "Đang bật" : "Đang tắt"}</span>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(method)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(method.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}

        <Card
          className="border-dashed cursor-pointer hover:border-primary hover:bg-muted/50 transition-colors"
          onClick={handleAddNew}
        >
          <CardContent className="flex flex-col items-center justify-center h-full py-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-4">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="text-center font-medium">Thêm phương thức thanh toán</p>
            <p className="text-center text-sm text-muted-foreground mt-1">
              Thêm phương thức thanh toán mới cho khách hàng
            </p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? "Chỉnh sửa phương thức thanh toán" : "Thêm phương thức thanh toán mới"}
            </DialogTitle>
            <DialogDescription>
              {editingMethod
                ? "Chỉnh sửa thông tin phương thức thanh toán"
                : "Thêm phương thức thanh toán mới cho khách hàng"}
            </DialogDescription>
          </DialogHeader>

          <PaymentMethodForm initialData={editingMethod} onSave={handleSaveMethod} isLoading={isLoading} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

