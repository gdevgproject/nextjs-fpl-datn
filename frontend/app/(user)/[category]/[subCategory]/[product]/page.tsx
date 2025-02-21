export default function ProductDetailPage({
  params,
}: {
  params: { category: string; subCategory: string; product: string }
}) {
  return (
    <div>
      Product Detail for category: {params.category}, subcategory: {params.subCategory}, product: {params.product}
    </div>
  )
}

