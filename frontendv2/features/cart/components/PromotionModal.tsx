"use client"

import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock } from "lucide-react"
import { useState } from "react"
import { vouchers } from "../mocks/voucherMockData"

interface PromotionModalProps {
  isOpen: boolean
  onClose: () => void
  onApply: (code: string) => void
}

export function PromotionModal({ isOpen, onClose, onApply }: PromotionModalProps) {
  const [manualCode, setManualCode] = useState("")
  const [selectedCode, setSelectedCode] = useState("")

  const handleApply = () => {
    if (selectedCode) {
      onApply(selectedCode)
    } else if (manualCode) {
      onApply(manualCode)
    }
  }

  const formatTimeLeft = (expiryDate: string) => {
    const hours = Math.floor(
      (new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60)
    )
    if (hours < 24) {
      return `${hours}h`
    }
    const days = Math.floor(hours / 24)
    return `${days} ngày`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center text-lg font-semibold">
            Ưu đãi dành cho bạn
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nhập mã giảm giá"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleApply} variant="secondary">
              Xác nhận
            </Button>
          </div>

          {vouchers.length > 0 ? (
            <div className="mt-4">
              <RadioGroup value={selectedCode} onValueChange={setSelectedCode}>
                <div className="space-y-3">
                  {vouchers.map((voucher) => (
                    <div
                      key={voucher.code}
                      className="flex items-center space-x-2 border rounded-lg p-3 hover:border-blue-500 cursor-pointer"
                      onClick={() => setSelectedCode(voucher.code)}
                    >
                      <RadioGroupItem value={voucher.code} id={voucher.code} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{voucher.code}</span>
                          <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                            {voucher.type}
                          </span>
                        </div>
                        <Label htmlFor={voucher.code} className="font-normal">
                          {voucher.description}
                        </Label>
                        <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{formatTimeLeft(voucher.expiryDate)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </RadioGroup>

              <Button className="w-full mt-4" onClick={handleApply}>
                Áp dụng
              </Button>
            </div>
          ) : (
            <div className="mt-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 6H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1zm-1 10H4V8h16v8z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <p className="text-gray-600">Bạn hiện tại chưa có mã ưu đãi nào</p>
              <p className="text-sm text-gray-500 mt-1">
                Nhập mã giảm giá để được áp dụng những ưu đãi
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
