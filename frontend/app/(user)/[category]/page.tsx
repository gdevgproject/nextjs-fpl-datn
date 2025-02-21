export default function CategoryPage({ params }: { params: { category: string } }) {
  return <div>Product Listing for category: {params.category}</div>
}

