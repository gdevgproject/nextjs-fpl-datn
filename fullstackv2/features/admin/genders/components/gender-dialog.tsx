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
import { useCreateGender } from "../hooks/use-create-gender"
import { useUpdateGender } from "../hooks/use-update-gender"
import { useSonnerToast } from "@/shared/hooks/use-sonner-toast"

// Define the form schema with Zod
const genderFormSchema = z.object({
  name: z.string().min(1, "Tên giới tính không được để trống").max(50, "Tên giới tính không được vượt quá 50 ký tự"),
})

type GenderFormValues = z.infer<typeof genderFormSchema>

interface GenderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  gender?: any
}

export function GenderDialog({ open, onOpenChange, mode, gender }: GenderDialogProps) {
  const toast = useSonnerToast()
  const [isProcessing, setIsProcessing] = useState(false)

  // Initialize the form with default values
  const form = useForm<GenderFormValues>({
    resolver: zodResolver(genderFormSchema),
    defaultValues: {
      name: "",
    },
  })

  // Set form values when editing an existing gender
  useEffect(() => {
    if (mode === "edit" && gender) {
      form.reset({
        name: gender.name,
      })
    } else {
      form.reset({
        name: "",
      })
    }
  }, [mode, gender, form, open])

  // Mutations for creating and updating genders
  const createGenderMutation = useCreateGender()
  const updateGenderMutation = useUpdateGender()

  // Handle form submission
  const onSubmit = async (values: GenderFormValues) => {
    try {
      setIsProcessing(true)

      if (mode === "create") {
        // Create new gender
        await createGenderMutation.mutateAsync({
          name: values.name,
        })

        // Show success message
        toast.success("Giới tính đã được tạo thành công")

        // Close the dialog
        onOpenChange(false)

        // Reset the form
        form.reset()
      } else if (mode === "edit" && gender) {
        // Update existing gender
        await updateGenderMutation.mutateAsync({
          id: gender.id,
          name: values.name,
        })

        // Show success message
        toast.success("Giới tính đã được cập nhật thành công")

        // Close the dialog
        onOpenChange(false)
      }
    } catch (error) {
      // Show error message
      toast.error(
        `Lỗi khi ${mode === "create" ? "tạo" : "cập nhật"} giới tính: ${
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
          <DialogTitle>{mode === "create" ? "Thêm giới tính mới" : "Chỉnh sửa giới tính"}</DialogTitle>
          <DialogDescription>
            {mode === "create" ? "Thêm một giới tính mới vào hệ thống." : "Chỉnh sửa thông tin giới tính."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên giới tính</FormLabel>
                  <FormControl>
                    <Input placeholder="Nhập tên giới tính" {...field} />
                  </FormControl>
                  <FormDescription>Tên giới tính phải là duy nhất trong hệ thống.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Hủy
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? "Đang xử lý..." : mode === "create" ? "Tạo giới tính" : "Cập nhật giới tính"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
