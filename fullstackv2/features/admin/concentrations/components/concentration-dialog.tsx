"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateConcentration } from "../hooks/use-create-concentration"
import { useUpdateConcentration } from "../hooks/use-update-concentration"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"

// Define the form schema with Zod
const concentrationFormSchema = z.object({
  name: z.string().min(1, "Tên nồng độ không được để trống").max(100, "Tên nồng độ không được vượt quá 100 ký tự"),
  description: z.string().max(500, "Mô tả không được vượt quá 500 ký tự").optional().nullable(),
})

type ConcentrationFormValues = z.infer<typeof concentrationFormSchema>

interface ConcentrationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  concentration?: any
}

export function ConcentrationDialog({ open, onOpenChange, mode, concentration }: ConcentrationDialogProps) {
  const toast = useSonnerToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize the form with default values
  const form = useForm<ConcentrationFormValues>({
    resolver: zodResolver(concentrationFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Set form values when editing an existing concentration
  useEffect(() => {
    if (mode === "edit" && concentration) {
      form.reset({
        name: concentration.name,
        description: concentration.description,
      })
    } else {
      form.reset({
        name: "",
        description: "",
      })
    }
  }, [mode, concentration, form, open])

  // Mutations for creating and updating concentrations
  const createConcentrationMutation = useCreateConcentration()
  const updateConcentrationMutation = useUpdateConcentration()

  // Handle form submission
  const onSubmit = async (values: ConcentrationFormValues) => {
    try {
      setIsProcessing(true)

      if (mode === "create") {
        // Create new concentration
        await createConcentrationMutation.mutateAsync({
          name: values.name,
          description: values.description,
        })

        // Show success message
        toast.success("Nồng độ đã được tạo thành công")

        // Close the dialog
        onOpenChange(false)

        // Reset the form
        form.reset()
      } else if (mode === "edit" && concentration) {
        // Update existing concentration
        await updateConcentrationMutation.mutateAsync({
          id: concentration.id,
          name: values.name,
          description: values.description,
        })

        // Show success message
        toast.success("Nồng độ đã được cập nhật thành công")

        // Close the dialog
        onOpenChange(false)
      }
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} nồng độ: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      )
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Thêm nồng độ mới" : "Chỉnh sửa nồng độ"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Thêm một nồng độ mới vào hệ thống." : "Chỉnh sửa thông tin nồng độ."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên nồng độ</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên nồng độ" {...field} />
                  </FormControl>
                  <FormDescription>Tên nồng độ phải là duy nhất trong hệ thống.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả về nồng độ (tùy chọn)"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Mô tả ngắn gọn về nồng độ.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Đang xử lý..." : mode === "create" ? "Tạo nồng độ" : "Cập nhật nồng độ"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
