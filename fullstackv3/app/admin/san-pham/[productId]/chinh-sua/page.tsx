import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import { getProductById } from "@/features/admin/product-management/actions"
import { ProductForm } from "@/features/admin/product-management/components/product-form"

export const metadata: Metadata = {
  title: "Chỉnh sửa sản phẩm | Admin",
  description: "Chỉnh sửa thông tin sản phẩm",
}

interface PageProps {
  params: {
    productId: string
  }
}

export default async function EditProductPage({ params }: PageProps) {
  const productId = Number.parseInt(params.productId)
  if (isNaN(productId)) notFound()

  const { data: product, error } = await getProductById(productId)
  if (error || !product) notFound()

  // Redirect to product list if the product is deleted
  if (product.deleted_at) {
    redirect("/admin/san-pham")
  }

  return (
    <div className="container max-w-7xl mx-auto pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/admin/san-pham/${productId}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Chỉnh sửa sản phẩm</h1>
        </div>
      </div>

      <Separator className="my-6" />

      <ProductForm initialData={product} isEditing />
    </div>
  )
}

