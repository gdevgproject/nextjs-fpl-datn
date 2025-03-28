"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/lib/hooks/use-auth"
import { getErrorMessage } from "@/lib/auth/auth-utils"
import { Loader2, CheckCircle, Mail, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

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

      // Giả lập gửi magic link (không thực sự gọi API)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Giả lập thành công
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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-4 py-2"
      >
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
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
      </motion.div>
    )
  }

  return (
    <Form {...form}>
      {formError && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Alert variant="destructive" className="mb-4 border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="flex justify-center mb-6">
        <div className="rounded-full bg-primary/10 p-3">
          <Mail className="h-10 w-10 text-primary" />
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="name@example.com" type="email" className="pl-10" {...field} />
                  </div>
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full transition-all duration-200 hover:bg-primary/90"
          disabled={isSubmitting}
        >
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

