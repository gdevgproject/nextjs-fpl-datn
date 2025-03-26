"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage } from "@/lib/auth/auth-utils"
import { Loader2, CheckCircle, Mail } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

const magicLinkFormSchema = z.object({
  email: z.string().email({
    message: "Email không hợp lệ",
  }),
})

type MagicLinkFormValues = z.infer<typeof magicLinkFormSchema>

export function MagicLinkForm() {
  const { signInWithMagicLink } = useAuth()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const form = useForm<MagicLinkFormValues>({
    resolver: zodResolver(magicLinkFormSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: MagicLinkFormValues) {
    try {
      setIsSubmitting(true)
      setFormError(null)

      const { success, error } = await signInWithMagicLink(values.email)

      if (!success) {
        setFormError(getErrorMessage(new Error(error || "")))
        toast({
          title: "Gửi liên kết thất bại",
          description: getErrorMessage(new Error(error || "")),
          variant: "destructive",
        })
        return
      }

      setEmailSent(true)
      toast({
        title: "Liên kết đăng nhập đã được gửi",
        description: "Vui lòng kiểm tra hộp thư của bạn để đăng nhập",
      })

      // Reset form sau khi gửi thành công
      form.reset()
    } catch (error) {
      console.error("Magic link error:", error)
      setFormError(getErrorMessage(error))
      toast({
        title: "Gửi liên kết thất bại",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (emailSent) {
    return (
      <div className="space-y-4 py-4">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-primary" />
        </div>

        <div className="bg-muted p-4 rounded-lg text-center">
          <h3 className="font-medium mb-2">Liên kết đăng nhập đã được gửi!</h3>
          <p className="text-sm text-muted-foreground">
            Chúng tôi đã gửi liên kết đăng nhập đến địa chỉ email của bạn. Vui lòng kiểm tra hộp thư (và thư mục spam)
            để đăng nhập.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setEmailSent(false)
            form.reset()
          }}
        >
          Gửi lại liên kết
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      {formError && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-center mb-4">
        <Mail className="h-16 w-16 text-primary" />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Input placeholder="name@example.com" type="email" {...field} />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang xử lý
            </>
          ) : (
            "Gửi liên kết đăng nhập"
          )}
        </Button>
      </form>
    </Form>
  )
}

