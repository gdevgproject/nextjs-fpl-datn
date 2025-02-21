export default function BrandPage({ params }: { params: { brand: string } }) {
  return <div>Product Listing for brand: {params.brand}</div>
}

