"use client"

import { useState } from "react"
import { Printer } from "lucide-react"

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

interface OrderPrintProps {
  orderId: string
}

export default function OrderPrint({ orderId }: OrderPrintProps) {
  const [open, setOpen] = useState(false)

  const handlePrint = () => {
    // Xử lý in đơn hàng ở đây
    console.log(`Printing order ${orderId}...`)
    window.print()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Printer className="h-4 w-4" />
          <span className="sr-only">In đơn hàng</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>In đơn hàng</DialogTitle>
          <DialogDescription>Chọn các tùy chọn in cho đơn hàng #{orderId}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="printInvoice"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="printInvoice" className="text-sm font-medium">
              In hóa đơn
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="printShipping"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="printShipping" className="text-sm font-medium">
              In phiếu giao hàng
            </label>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="printReceipt"
              defaultChecked
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="printReceipt" className="text-sm font-medium">
              In biên lai
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Hủy
          </Button>
          <Button onClick={handlePrint}>In</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

