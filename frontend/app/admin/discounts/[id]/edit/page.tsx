"use client"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  type Discount,
  type Product,
  deleteDiscount,
  fetchDiscounts,
  fetchProducts,
  updateDiscount,
} from "@/lib/mockData"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "react-hot-toast"
import Select from "react-select"

type FormData = {
  discount_code: string
  permanent: boolean
  percent: number
  minimum_spend: number | null
  maximum_spend: number | null
  limit: number | null
  product_ids: string[]
  apply_to_all: boolean
}

export default function EditDiscountPage({
  params,
}: {
  params: { id: string }
}) {
  const [discount, setDiscount] = useState<Discount | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const router = useRouter()
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormData>()

  const applyToAll = watch("apply_to_all")

  useEffect(() => {
    fetchDiscounts().then((all: Discount[]) => {
      const data: Discount | undefined = all.find((d) => d.id === params.id)
      if (data) {
        setDiscount(data)
        reset({
          discount_code: data.discount_code,
          permanent: data.permanent ?? false,
          percent: data.percent,
          minimum_spend: data.minimum_spend,
          maximum_spend: data.maximum_spend,
          limit: data.limit,
          product_ids: data.product_ids ? data.product_ids.split(",") : [],
          apply_to_all: data.product_ids === "all",
        })
      }
    })
    fetchProducts().then(setProducts)
  }, [params.id, reset])

  const onSubmit = async (data: FormData) => {
    try {
      await updateDiscount(params.id, {
        ...data,
        limit: data.limit === null ? undefined : data.limit,
        product_ids: data.apply_to_all ? "all" : data.product_ids.join(","),
      })
      toast.success("Discount updated successfully")
      router.push("/admin/discounts")
    } catch (error) {
      toast.error("Failed to update discount")
    }
  }

  const handleDelete = async () => {
    try {
      await deleteDiscount(params.id)
      toast.success("Discount deleted successfully")
      router.push("/admin/discounts")
    } catch (error) {
      toast.error("Failed to delete discount")
    }
  }

  if (!discount) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Discount</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="discount_code">Discount Code</Label>
            <Input
              id="discount_code"
              {...register("discount_code", {
                required: "This field is required",
              })}
              className="w-full"
            />
            {errors.discount_code && <p className="text-red-500 text-sm">{errors.discount_code.message}</p>}
          </div>

          <div className="space-y-2 flex items-center">
            <Label htmlFor="permanent" className="mr-2">
              Permanent
            </Label>
            <Controller
              name="permanent"
              control={control}
              render={({ field }) => (
                <Checkbox id="permanent" checked={field.value} onCheckedChange={field.onChange} className="w-6 h-6" />
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="percent">Percent</Label>
            <Input
              id="percent"
              type="number"
              {...register("percent", {
                required: "This field is required",
                min: { value: 0, message: "Minimum value is 0" },
                max: { value: 100, message: "Maximum value is 100" },
              })}
              className="w-full"
            />
            {errors.percent && <p className="text-red-500 text-sm">{errors.percent.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="minimum_spend">Minimum Spend</Label>
            <Input
              id="minimum_spend"
              type="number"
              {...register("minimum_spend", {
                min: { value: 0, message: "Minimum value is 0" },
              })}
              className="w-full"
            />
            {errors.minimum_spend && <p className="text-red-500 text-sm">{errors.minimum_spend.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="maximum_spend">Maximum Spend</Label>
            <Input
              id="maximum_spend"
              type="number"
              {...register("maximum_spend", {
                min: { value: 0, message: "Minimum value is 0" },
              })}
              className="w-full"
            />
            {errors.maximum_spend && <p className="text-red-500 text-sm">{errors.maximum_spend.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="limit">Usage Limit</Label>
            <Input
              id="limit"
              type="number"
              {...register("limit", {
                min: { value: 1, message: "Minimum value is 1" },
              })}
              className="w-full"
            />
            {errors.limit && <p className="text-red-500 text-sm">{errors.limit.message}</p>}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Controller
              name="apply_to_all"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="apply_to_all"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="w-6 h-6"
                />
              )}
            />
            <Label htmlFor="apply_to_all">Apply to all products</Label>
          </div>

          {!applyToAll && (
            <div className="space-y-2">
              <Label htmlFor="product_ids">Apply to Specific Products</Label>
              <Controller
                name="product_ids"
                control={control}
                render={({ field }) => (
                  <Select
                    isMulti
                    options={products.map((p) => ({
                      label: p.name,
                      value: p.id,
                    }))}
                    value={field.value.map((id) => ({
                      label: products.find((p) => p.id === id)?.name || "",
                      value: id,
                    }))}
                    onChange={(selectedOptions) => field.onChange(selectedOptions.map((option) => option.value))}
                    className="w-full"
                    placeholder="Select products"
                  />
                )}
              />
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button type="submit">Update Discount</Button>
          <ConfirmationDialog
            title="Delete Discount"
            message="Are you sure you want to delete this discount?"
            onConfirm={handleDelete}
          >
            <Button variant="destructive">Delete Discount</Button>
          </ConfirmationDialog>
        </div>
      </form>
    </div>
  )
}

