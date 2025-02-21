"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { createBrand } from "@/lib/mockData"
import type { Brand } from "@/lib/mockData"
import { toast } from "@/components/ui/use-toast"

type FormData = Omit<Brand, "id" | "created_at" | "updated_at">

export default function NewBrandPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const { control, handleSubmit, watch } = useForm<FormData>({
    defaultValues: {
      name: "",
      description: "",
      logo: "",
    },
  })

  const logoPreview = watch("logo")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    setError(null)
    try {
      await createBrand(data)
      toast({
        title: "Brand created",
        description: "The brand has been successfully created.",
      })
      router.push("/admin/brands")
    } catch (err) {
      setError("Failed to create brand. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold">Create New Brand</h2>

      <Card>
        <CardHeader>
          <CardTitle>Brand Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <Controller
                name="name"
                control={control}
                rules={{ required: "Brand name is required" }}
                render={({ field, fieldState: { error } }) => (
                  <>
                    <Input {...field} id="name" placeholder="Enter brand name" />
                    {error && <p className="mt-1 text-sm text-red-600">{error.message}</p>}
                  </>
                )}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <Textarea {...field} id="description" placeholder="Enter brand description" />}
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700">
                Logo URL
              </label>
              <Controller
                name="logo"
                control={control}
                render={({ field }) => <Input {...field} id="logo" placeholder="Enter logo URL" />}
              />
              {logoPreview && (
                <div className="mt-2">
                  <img
                    src={logoPreview || "/placeholder.svg"}
                    alt="Logo preview"
                    className="w-20 h-20 object-contain"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => router.push("/admin/brands")}>
                Cancel
              </Button>
              <Button type="submit">Create Brand</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

