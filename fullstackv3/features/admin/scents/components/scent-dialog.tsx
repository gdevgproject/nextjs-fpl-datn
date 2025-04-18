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
import { useCreateScent } from "../hooks/use-create-scent"
import { useUpdateScent } from "../hooks/use-update-scent"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"

// Define the form schema with Zod
const scentFormSchema = z.object({
  name: z
    .string()
    .min(1, "Tên nhóm hương không được để trống")
    .max(100, "Tên nhóm hương không được vượt quá 100 ký tự"),
  description: z.string().max(500, "Mô tả không được vượt quá 500 ký tự").optional().nullable(),
})

type ScentFormValues = z.infer<typeof scentFormSchema>

interface ScentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  scent?: any
}

export function ScentDialog({ open, onOpenChange, mode, scent }: ScentDialogProps) {
  const toast = useSonnerToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize the form with default values
  const form = useForm<ScentFormValues>({
    resolver: zodResolver(scentFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Set form values when editing an existing scent
  useEffect(() => {
    if (mode === "edit" && scent) {
      form.reset({
        name: scent.name,
        description: scent.description,
      })
    } else {
      form.reset({
        name: "",
        description: "",
      })
    }
  }, [mode, scent, form, open])

  // Mutations for creating and updating scents
  const createScentMutation = useCreateScent()
  const updateScentMutation = useUpdateScent()

  // Handle form submission
  const onSubmit = async (values: ScentFormValues) => {
    try {
      setIsProcessing(true)

      if (mode === "create") {
        // Create new scent
        await createScentMutation.mutateAsync({
          name: values.name,
          description: values.description,
        })

        // Show success message
        toast.success("Nhóm hương đã được tạo thành công")

        // Close the dialog
        onOpenChange(false)

        // Reset the form
        form.reset()
      } else if (mode === "edit" && scent) {
        // Update existing scent
        await updateScentMutation.mutateAsync({
          id: scent.id,
          name: values.name,
          description: values.description,
        })

        // Show success message
        toast.success("Nhóm hương đã được cập nhật thành công")

        // Close the dialog
        onOpenChange(false)
      }
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} nhóm hương: ${
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
          <DialogTitle>{mode === "create" ? "Thêm nhóm hương mới" : "Chỉnh sửa nhóm hương"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Thêm một nhóm hương mới vào hệ thống." : "Chỉnh sửa thông tin nhóm hương."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên nhóm hương</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên nhóm hương" {...field} />
                  </FormControl>
                  <FormDescription>Tên nhóm hương phải là duy nhất trong hệ thống.</FormDescription>
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
                      placeholder="Nhập mô tả về nhóm hương (tùy chọn)"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormDescription>Mô tả ngắn gọn về nhóm hương.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Đang xử lý..." : mode === "create" ? "Tạo nhóm hương" : "Cập nhật nhóm hương"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
