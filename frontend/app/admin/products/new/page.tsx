"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { createProduct, fetchCategories, fetchBrands } from "@/lib/mockData"
import { toast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { useEffect } from "react"
import type { Category, Brand, Product } from "@/lib/mockData"

// Sample data (in a real app, these would be fetched from an API)
const sampleFragranceCategories = ["Fresh", "Floral", "Woody", "Oriental", "Fruity", "Citrus", "Gourmand", "Chypre"]

const sampleTopNotes = [
  "Bergamot",
  "Lemon",
  "Orange",
  "Grapefruit",
  "Lime",
  "Mandarin",
  "Neroli",
  "Petitgrain",
  "Pink Pepper",
  "Black Pepper",
]

const sampleMiddleNotes = [
  "Jasmine",
  "Rose",
  "Ylang-Ylang",
  "Lily of the Valley",
  "Tuberose",
  "Lavender",
  "Geranium",
  "Violet",
  "Orris Root",
  "Clary Sage",
]

const sampleBaseNotes = [
  "Sandalwood",
  "Cedarwood",
  "Patchouli",
  "Vetiver",
  "Oakmoss",
  "Vanilla",
  "Tonka Bean",
  "Musk",
  "Amber",
  "Benzoin",
]

const volumes = [30, 50, 75, 100, 125]

export default function NewProductPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<Product>()

  useEffect(() => {
    const loadData = async () => {
      const [fetchedCategories, fetchedBrands] = await Promise.all([fetchCategories(), fetchBrands()])
      setCategories(fetchedCategories)
      setBrands(fetchedBrands)
    }
    loadData()
  }, [])

  const onSubmit = async (data: Product) => {
    setIsLoading(true)
    try {
      await createProduct(data)
      toast({
        title: "Product created",
        description: "The product has been successfully created.",
      })
      router.push("/admin/products")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create the product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Product</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">General Information</h3>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register("name", { required: "Name is required" })} />
              {errors.name && <ErrorMessage message={errors.name.message || "Error"} />}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...register("description")} />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
              {errors.category && <ErrorMessage message={errors.category.message || "Error"} />}
            </div>
            <div>
              <Label htmlFor="fragrance_category_id">Fragrance Category</Label>
              <Controller
                name="fragrance_category_id"
                control={control}
                rules={{ required: "Fragrance category is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fragrance category" />
                    </SelectTrigger>
                    <SelectContent>
                      {sampleFragranceCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.fragrance_category_id && (
                <ErrorMessage message={errors.fragrance_category_id.message || "Error"} />
              )}
            </div>
            <div>
              <Label htmlFor="fragrance_brand_id">Brand</Label>
              <Controller
                name="fragrance_brand_id"
                control={control}
                rules={{ required: "Brand is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
              {errors.fragrance_brand_id && <ErrorMessage message={errors.fragrance_brand_id.message || "Error"} />}
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Controller
                name="gender"
                control={control}
                rules={{ required: "Gender is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
              {errors.gender && <ErrorMessage message={errors.gender.message || "Error"} />}
            </div>
            <div>
              <Label htmlFor="origin">Origin</Label>
              <Input id="origin" {...register("origin")} />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Controller
                name="status"
                control={control}
                defaultValue="active"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
            </div>
            <div>
              <Label htmlFor="is_hot">Is Hot</Label>
              <Controller
                name="is_hot"
                control={control}
                defaultValue="no"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select hot status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Pricing</h3>
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0, message: "Price must be positive" },
                })}
              />
              {errors.price && <ErrorMessage message={errors.price.message || "Error"} />}
            </div>
            <div>
              <Label htmlFor="listed_price">Listed Price</Label>
              <Input
                id="listed_price"
                type="number"
                step="0.01"
                {...register("listed_price", { min: { value: 0, message: "Listed price must be positive" } })}
              />
              {errors.listed_price && <ErrorMessage message={errors.listed_price.message || "Error"} />}
            </div>
            <div>
              <Label htmlFor="import_price">Import Price</Label>
              <Input
                id="import_price"
                type="number"
                step="0.01"
                {...register("import_price", {
                  required: "Import price is required",
                  min: { value: 0, message: "Import price must be positive" },
                })}
              />
              {errors.import_price && <ErrorMessage message={errors.import_price.message || "Error"} />}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Inventory</h3>
            <div>
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                {...register("stock", {
                  required: "Stock is required",
                  min: { value: 0, message: "Stock must be positive" },
                })}
              />
              {errors.stock && <ErrorMessage message={errors.stock.message || "Error"} />}
            </div>
            <div>
              <Label>Volume</Label>
              <div className="flex flex-wrap gap-4">
                {volumes.map((vol) => (
                  <div key={vol} className="flex items-center space-x-2">
                    <Checkbox id={`volume-${vol}`} {...register("volume")} value={vol.toString()} />
                    <Label htmlFor={`volume-${vol}`}>{vol} ml</Label>
                  </div>
                ))}
              </div>
              {errors.volume && <ErrorMessage message="At least one volume must be selected" />}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Fragrance Details</h3>
            <div>
              <Label htmlFor="concentration">Concentration</Label>
              <Controller
                name="concentration"
                control={control}
                rules={{ required: "Concentration is required" }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
              {errors.concentration && <ErrorMessage message={errors.concentration.message || "Error"} />}
            </div>
            <div>
              <Label htmlFor="top_notes">Top Notes</Label>
              <Input id="top_notes" {...register("top_notes")} />
            </div>
            <div>
              <Label htmlFor="middle_notes">Middle Notes</Label>
              <Input id="middle_notes" {...register("middle_notes")} />
            </div>
            <div>
              <Label htmlFor="base_notes">Base Notes</Label>
              <Input id="base_notes" {...register("base_notes")} />
            </div>
            <div>
              <Label htmlFor="ingredients">Ingredients</Label>
              <Textarea id="ingredients" {...register("ingredients")} />
            </div>
            <div>
              <Label htmlFor="longevity">Longevity</Label>
              <Controller
                name="longevity"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
            </div>
            <div>
              <Label htmlFor="sillage">Sillage</Label>
              <Controller
                name="sillage"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
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
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Images</h3>
            <div>
              <Label htmlFor="images">Product Images</Label>
              <Input id="images" type="file" multiple {...register("images")} />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => router.push("/admin/products")}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

