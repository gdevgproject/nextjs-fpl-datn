export default function SubCategoryPage({ params }: { params: { category: string; subCategory: string } }) {
  return (
    <div>
      Product Listing for category: {params.category}, subcategory: {params.subCategory}
    </div>
  )
}

