import ProductCardSimple from "@/features/product/components/shared/ProductCardSimple"

const products = [
  {
    id: 1,
    image: "/placeholder.svg?height=200&width=200",
    name: "Hỗn dịch viên uống men vi sinh Enterogermina gut defense Sanofi tăng cường miễn dịch",
    price: "165.000đ",
    originalPrice: "200.000đ",
    unit: "Hộp",
    packageInfo: "Hộp 2 Vỉ x 10 Ống",
    discount: "-25%",
    units: [
      { label: "Hộp", value: "hop" },
      { label: "Ống", value: "ong" },
      { label: "Vỉ", value: "vi" },
    ],
  },
  {
    id: 2,
    image: "/placeholder.svg?height=200&width=200",
    name: "Hộp Telfor 60 DHG điều trị triệu chứng viêm mũi dị ứng trẻ em dưới 12 tuổi",
    price: "100.000đ",
    originalPrice: "150.000đ",
    unit: "Hộp",
    packageInfo: "Hộp 5 Vỉ x 10 Viên",
    discount: "-25%",
    units: [
      { label: "Hộp", value: "hop" },
      { label: "Ống", value: "ong" },
      { label: "Viên", value: "vien" },
    ],
  },
  // Add more products as needed
]

export default function BestSellingProducts() {
  return (
    <section className="py-4 sm:py-6" aria-labelledby="bestselling-title">
      {/* Section Title */}
      <header className="mb-4 sm:mb-6 flex justify-center">
        <h2
          id="bestselling-title"
          className="inline-block rounded-full bg-primary-5 px-4 sm:px-8 py-1.5 sm:py-2 text-white font-bold text-base sm:text-lg"
        >
          Sản Phẩm Bán Chạy
        </h2>
      </header>

      {/* Products Grid */}
      <ul className="grid grid-cols-2 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <ProductCardSimple key={product.id} product={product} />
        ))}
      </ul>
    </section>
  )
}

