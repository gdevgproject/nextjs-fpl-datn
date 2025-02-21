"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { toast } from "@/components/ui/use-toast"
import { type Product, fetchProduct, updateProduct, fetchCategories, fetchBrands } from "@/lib/mockData"

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be non-negative"),
  import_price: z.number().min(0, "Import price must be non-negative"),
  listed_price: z.number().min(0, "Listed price must be non-negative"),
  category: z.string().min(1, "Category is required"),
  fragrance_category_id: z.string().min(1, "Fragrance category is required"),
  fragrance_brand_id: z.string().min(1, "Brand is required"),
  gender: z.enum(["male", "female", "unisex"]),
  ingredients: z.array(z.string()),
  origin: z.string().optional(),
  volume: z.array(z.number()).min(1, "At least one volume is required"),
  stock: z.number().int().min(0, "Stock must be non-negative"),
  status: z.enum(["active", "hidden"]),
  concentration: z.enum(["Parfum", "Eau de Parfum", "Eau de Toilette", "Eau de Cologne", "Eau Fraiche"]),
  top_notes: z.array(z.string()),
  middle_notes: z.array(z.string()),
  base_notes: z.array(z.string()),
  longevity: z.enum(["Very Weak", "Weak", "Moderate", "Long Lasting", "Eternal"]),
  sillage: z.enum(["Intimate", "Moderate", "Strong", "Enormous"]),
  is_hot: z.enum(["yes", "no"]),
})

type ProductFormData = z.infer<typeof productSchema>

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [brands, setBrands] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      ingredients: [],
      volume: [],
      top_notes: [],
      middle_notes: [],
      base_notes: [],
    },
  })

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        const [fetchedProduct, fetchedCategories, fetchedBrands] = await Promise.all([
          fetchProduct(params.id),
          fetchCategories(),
          fetchBrands(),
        ])
        if (fetchedProduct) {
          setProduct(fetchedProduct)
          reset(fetchedProduct)
        } else {
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive",
          })
          router.push("/admin/products")
        }
        setCategories(fetchedCategories)
        setBrands(fetchedBrands)
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to fetch product data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id, reset, router])

  const onSubmit = async (data: ProductFormData) => {
    setIsSaving(true)
    try {
      await updateProduct(params.id, data)
      toast({
        title: "Success",
        description: "Product updated successfully",
      })
      router.push("/admin/products")
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (!product) return <ErrorMessage message="Product not found" />

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="name">Name</Label>
            <Controller name="name" control={control} render={({ field }) => <Input {...field} />} />
            {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Controller name="description" control={control} render={({ field }) => <Textarea {...field} />} />
          </div>

          <div>
            <Label htmlFor="price">Price</Label>
            <Controller name="price" control={control} render={({ field }) => <Input type="number" {...field} />} />
            {errors.price && <p className="text-red-500">{errors.price.message}</p>}
          </div>

          <div>
            <Label htmlFor="import_price">Import Price</Label>
            <Controller
              name="import_price"
              control={control}
              render={({ field }) => <Input type="number" {...field} />}
            />
            {errors.import_price && <p className="text-red-500">{errors.import_price.message}</p>}
          </div>

          <div>
            <Label htmlFor="listed_price">Listed Price</Label>
            <Controller
              name="listed_price"
              control={control}
              render={({ field }) => <Input type="number" {...field} />}
            />
            {errors.listed_price && <p className="text-red-500">{errors.listed_price.message}</p>}
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Controller
              name="category"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.category && <p className="text-red-500">{errors.category.message}</p>}
          </div>

          <div>
            <Label htmlFor="fragrance_brand_id">Brand</Label>
            <Controller
              name="fragrance_brand_id"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select brand" />
                  </SelectTrigger>
                  <SelectContent>
                    {brands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id}>
                        {brand.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.fragrance_brand_id && <p className="text-red-500">{errors.fragrance_brand_id.message}</p>}
          </div>

          <div>
            <Label htmlFor="gender">Gender</Label>
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="unisex">Unisex</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.gender && <p className="text-red-500">{errors.gender.message}</p>}
          </div>

          <div>
            <Label htmlFor="origin">Origin</Label>
            <Controller name="origin" control={control} render={({ field }) => <Input {...field} />} />
          </div>

          <div>
            <Label htmlFor="stock">Stock</Label>
            <Controller name="stock" control={control} render={({ field }) => <Input type="number" {...field} />} />
            {errors.stock && <p className="text-red-500">{errors.stock.message}</p>}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="hidden">Hidden</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.status && <p className="text-red-500">{errors.status.message}</p>}
          </div>

          <div>
            <Label htmlFor="concentration">Concentration</Label>
            <Controller
              name="concentration"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select concentration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parfum">Parfum</SelectItem>
                    <SelectItem value="Eau de Parfum">Eau de Parfum</SelectItem>
                    <SelectItem value="Eau de Toilette">Eau de Toilette</SelectItem>
                    <SelectItem value="Eau de Cologne">Eau de Cologne</SelectItem>
                    <SelectItem value="Eau Fraiche">Eau Fraiche</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.concentration && <p className="text-red-500">{errors.concentration.message}</p>}
          </div>

          <div>
            <Label htmlFor="longevity">Longevity</Label>
            <Controller
              name="longevity"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select longevity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Very Weak">Very Weak</SelectItem>
                    <SelectItem value="Weak">Weak</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Long Lasting">Long Lasting</SelectItem>
                    <SelectItem value="Eternal">Eternal</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.longevity && <p className="text-red-500">{errors.longevity.message}</p>}
          </div>

          <div>
            <Label htmlFor="sillage">Sillage</Label>
            <Controller
              name="sillage"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sillage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Intimate">Intimate</SelectItem>
                    <SelectItem value="Moderate">Moderate</SelectItem>
                    <SelectItem value="Strong">Strong</SelectItem>
                    <SelectItem value="Enormous">Enormous</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.sillage && <p className="text-red-500">{errors.sillage.message}</p>}
          </div>

          <div>
            <Label htmlFor="is_hot">Is Hot</Label>
            <Controller
              name="is_hot"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select is hot" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.is_hot && <p className="text-red-500">{errors.is_hot.message}</p>}
          </div>
        </div>

        <div>
          <Label>Volume (ml)</Label>
          <div className="flex flex-wrap gap-4">
            {[30, 50, 75, 100, 125].map((vol) => (
              <div key={vol} className="flex items-center space-x-2">
                <Controller
                  name="volume"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value.includes(vol)}
                      onCheckedChange={(checked) => {
                        const updatedVolume = checked
                          ? [...field.value, vol]
                          : field.value.filter((v: number) => v !== vol)
                        field.onChange(updatedVolume)
                      }}
                    />
                  )}
                />
                <Label htmlFor={`volume-${vol}`}>{vol} ml</Label>
              </div>
            ))}
          </div>
          {errors.volume && <p className="text-red-500">{errors.volume.message}</p>}
        </div>

        <div>
          <Label htmlFor="ingredients">Ingredients</Label>
          <Controller
            name="ingredients"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                value={field.value.join(", ")}
                onChange={(e) => field.onChange(e.target.value.split(", "))}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="top_notes">Top Notes</Label>
          <Controller
            name="top_notes"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                value={field.value.join(", ")}
                onChange={(e) => field.onChange(e.target.value.split(", "))}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="middle_notes">Middle Notes</Label>
          <Controller
            name="middle_notes"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                value={field.value.join(", ")}
                onChange={(e) => field.onChange(e.target.value.split(", "))}
              />
            )}
          />
        </div>

        <div>
          <Label htmlFor="base_notes">Base Notes</Label>
          <Controller
            name="base_notes"
            control={control}
            render={({ field }) => (
              <Textarea
                {...field}
                value={field.value.join(", ")}
                onChange={(e) => field.onChange(e.target.value.split(", "))}
              />
            )}
          />
        </div>

        <div>
          <Label>Images</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-2">
            {product.images.map((image, index) => (
              <div key={index} className="relative">
                <img src={image || "/placeholder.svg"} alt={`Product ${index + 1}`} className="w-full h-auto rounded" />
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => {
                    const updatedImages = product.images.filter((_, i) => i !== index)
                    setProduct({ ...product, images: updatedImages })
                  }}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              const newImages = files.map((file) => URL.createObjectURL(file))
              setProduct({ ...product, images: [...product.images, ...newImages] })
            }}
            className="mt-4"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  )
}

