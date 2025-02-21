"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/ui/error-message"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { fetchProduct, deleteProduct } from "@/lib/mockData"
import type { Product } from "@/lib/mockData"
import { toast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Image from "next/image"

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const fetchedProduct = await fetchProduct(params.id)
        if (fetchedProduct) {
          setProduct(fetchedProduct)
        } else {
          setError("Product not found")
        }
      } catch (err) {
        setError("Failed to fetch product. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [params.id])

  const handleDelete = async () => {
    if (!product) return
    setIsLoading(true)
    try {
      await deleteProduct(product.id)
      toast({
        title: "Product deleted",
        description: "The product has been successfully deleted.",
      })
      router.push("/admin/products")
    } catch (err) {
      setError("Failed to delete product. Please try again.")
      setIsLoading(false)
    }
  }

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />
  if (!product) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Product Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">General Information</h3>
            <p>
              <strong>Name:</strong> {product.name}
            </p>
            <p>
              <strong>Perfume Code:</strong> {product.perfume_code}
            </p>
            <p>
              <strong>Description:</strong> {product.description}
            </p>
            <p>
              <strong>Category:</strong> {product.category}
            </p>
            <p>
              <strong>Fragrance Category:</strong> {product.fragrance_category_id}
            </p>
            <p>
              <strong>Brand:</strong> {product.fragrance_brand_id}
            </p>
            <p>
              <strong>Gender:</strong> {product.gender}
            </p>
            <p>
              <strong>Origin:</strong> {product.origin}
            </p>
            <p>
              <strong>Status:</strong> {product.status}
            </p>
            <p>
              <strong>Is Hot:</strong> {product.is_hot}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Pricing</h3>
            <p>
              <strong>Price:</strong> ${product.price.toFixed(2)}
            </p>
            <p>
              <strong>Listed Price:</strong> ${product.listed_price.toFixed(2)}
            </p>
            <p>
              <strong>Import Price:</strong> ${product.import_price.toFixed(2)}
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">Inventory</h3>
            <p>
              <strong>Stock:</strong> {product.stock}
            </p>
            <p>
              <strong>Volume:</strong> {product.volume.join(", ")} ml
            </p>

            <h3 className="text-lg font-semibold mt-4 mb-2">Fragrance Details</h3>
            <p>
              <strong>Concentration:</strong> {product.concentration}
            </p>
            <p>
              <strong>Top Notes:</strong> {product.top_notes.join(", ")}
            </p>
            <p>
              <strong>Middle Notes:</strong> {product.middle_notes.join(", ")}
            </p>
            <p>
              <strong>Base Notes:</strong> {product.base_notes.join(", ")}
            </p>
            <p>
              <strong>Ingredients:</strong> {product.ingredients.join(", ")}
            </p>
            <p>
              <strong>Longevity:</strong> {product.longevity}
            </p>
            <p>
              <strong>Sillage:</strong> {product.sillage}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Product Images</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {product.images.map((image, index) => (
              <div key={index} className="relative aspect-square">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${product.name} - Image ${index + 1}`}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-4 mt-6">
          <Button variant="outline" onClick={() => router.push("/admin/products")}>
            Back to List
          </Button>
          <Button onClick={() => router.push(`/admin/products/${product.id}/edit`)}>Edit</Button>
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you sure you want to delete this product?</DialogTitle>
                <DialogDescription>
                  This action cannot be undone. This will permanently delete the product and remove the data from our
                  servers.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}

