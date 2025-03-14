import { Truck, ShieldCheck, PhoneCall, CreditCard } from "lucide-react"

const commitments = [
  {
    id: 1,
    icon: ShieldCheck,
    title: "Sản phẩm chính hãng",
    description: "100% sản phẩm chính hãng từ các nhà sản xuất uy tín",
  },
  {
    id: 2,
    icon: Truck,
    title: "Giao hàng nhanh chóng",
    description: "Giao hàng trong 2 giờ tại nội thành Hà Nội",
  },
  {
    id: 3,
    icon: PhoneCall,
    title: "Tư vấn 24/7",
    description: "Đội ngũ dược sĩ tư vấn chuyên nghiệp 24/7",
  },
  {
    id: 4,
    icon: CreditCard,
    title: "Thanh toán đa dạng",
    description: "Nhiều phương thức thanh toán tiện lợi",
  },
]

export default function CommitmentsSection() {
  return (
    <section className="rounded-lg bg-primary-5/5 py-8" aria-labelledby="commitments-heading">
      <div className="container mx-auto px-4">
        <h2 id="commitments-heading" className="mb-8 text-center text-2xl font-bold text-primary-5">
          Cam kết của chúng tôi
        </h2>
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {commitments.map((commitment) => (
            <li key={commitment.id} className="flex flex-col items-center text-center">
              <commitment.icon className="mb-4 h-12 w-12 text-primary-40" aria-hidden="true" />
              <h3 className="mb-2 font-semibold text-grayscale-90">{commitment.title}</h3>
              <p className="text-sm text-grayscale-60">{commitment.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

