import ProductCard from "@/features/product/components/ProductCard"

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
    slug: "enterogermina-gut-defense",
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
    slug: "hop-telfor-60-dhg-dieu-tri",
  },
  // Add more products as needed
]

export default function BestSellingProducts() {
  return (
    <section className="py-4 sm:py-6" aria-labelledby="bestselling-title">
      {/* Section Title */}
      <header className="mb-6 flex justify-center">
        <h2
          id="bestselling-title"
          className="inline-block rounded-t-[8px] rounded-b-[40px] bg-gradient-1 px-8 sm:px-14 py-2 text-base sm:text-xl font-semibold text-white"
        >
          Sản Phẩm Bán Chạy
        </h2>
      </header>

      {/* Products Grid */}
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} variant="simple" />
          </li>
        ))}
      </ul>
    </section>
  )
}

