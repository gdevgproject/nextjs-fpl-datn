"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { AlertCircle, Check, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useDiscountCode } from "../hooks/use-discount-code"

const discountSchema = z.object({
  code: z.string().min(1, "Vui lòng nhập mã giảm giá"),
})

type DiscountFormValues = z.infer<typeof discountSchema>

interface DiscountCodeInputProps {
  subtotal: number
}

export function DiscountCodeInput({ subtotal }: DiscountCodeInputProps) {
  const { appliedDiscount, validateDiscount, removeDiscount, isValidating } = useDiscountCode()
  const [error, setError] = useState<string | null>(null)

  const form = useForm<DiscountFormValues>({
    resolver: zodResolver(discountSchema),
    defaultValues: {
      code: "",
    },
  })

  const onSubmit = async (data: DiscountFormValues) => {
    setError(null)
    try {
      const result = await validateDiscount({ code: data.code, subtotal })
      if (!result.isValid && result.error) {
        setError(result.error)
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi kiểm tra mã giảm giá")
    }
  }

  const handleRemoveDiscount = () => {
    removeDiscount()
    form.reset()
    setError(null)
  }

  // If a discount is already applied, show it
  if (appliedDiscount) {
    return (
      <div className="mt-4">
        <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
          <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription className="flex justify-between items-center">
            <span>
              Mã <span className="font-semibold">{appliedDiscount.code}</span> đã được áp dụng
            </span>
            <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground" onClick={handleRemoveDiscount}>
              <X className="h-4 w-4 mr-1" />
              Xóa
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mt-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <div className="flex space-x-2">
                  <FormControl>
                    <Input placeholder="Nhập mã giảm giá" {...field} className="uppercase" disabled={isValidating} />
                  </FormControl>
                  <Button type="submit" disabled={isValidating}>
                    {isValidating ? "Đang kiểm tra..." : "Áp dụng"}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
