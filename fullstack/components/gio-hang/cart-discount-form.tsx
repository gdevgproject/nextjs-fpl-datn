"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tag, X, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useCart } from "@/lib/hooks/use-cart"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function CartDiscountForm() {
  const [code, setCode] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState("")
  const { toast } = useToast()
  const { applyDiscount, discountCode } = useCart()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code.trim()) return

    setIsApplying(true)
    setError("")

    try {
      const success = await applyDiscount(code)

      if (success) {
        toast({
          title: "Áp dụng mã giảm giá thành công",
          description: `Mã giảm giá "${code}" đã được áp dụng.`,
        })
      } else {
        setError("Mã giảm giá không hợp lệ hoặc đã hết hạn")
        toast({
          title: "Mã giảm giá không hợp lệ",
          description: "Vui lòng kiểm tra lại mã giảm giá",
          variant: "destructive",
        })
      }
    } catch (error) {
      setError("Đã xảy ra lỗi khi áp dụng mã giảm giá")
      toast({
        title: "Lỗi",
        description: "Không thể áp dụng mã giảm giá. Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemoveDiscount = () => {
    applyDiscount("")
    setCode("")
    toast({
      title: "Đã hủy mã giảm giá",
      description: "Mã giảm giá đã được hủy bỏ.",
    })
  }

  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-medium">Mã giảm giá</h2>
      <AnimatePresence mode="wait">
        {discountCode ? (
          <motion.div
            key="applied"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between rounded-md bg-primary/10 p-3">
              <div className="flex items-center">
                <Tag className="mr-2 h-4 w-4 text-primary" />
                <span className="font-medium text-primary">{discountCode}</span>
                <Check className="ml-2 h-4 w-4 text-green-600" />
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" onClick={handleRemoveDiscount} className="h-8 w-8 p-0">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Hủy mã giảm giá</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Hủy mã giảm giá</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            className="space-y-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                </div>
                <Input
                  type="text"
                  placeholder="Nhập mã giảm giá"
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase())
                    setError("")
                  }}
                  className={`pl-9 uppercase ${error ? "border-red-500" : ""}`}
                />
              </div>
              <Button type="submit" disabled={isApplying || !code.trim()}>
                {isApplying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang áp dụng
                  </>
                ) : (
                  "Áp dụng"
                )}
              </Button>
            </div>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-red-500"
              >
                {error}
              </motion.p>
            )}
            <div className="mt-2 text-sm text-muted-foreground">
              <p>
                Gợi ý: Thử mã <span className="font-medium">SALE10</span> hoặc{" "}
                <span className="font-medium">SALE20</span>
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  )
}

