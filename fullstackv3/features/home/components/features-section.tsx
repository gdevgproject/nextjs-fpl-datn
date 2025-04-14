import { Truck, ShieldCheck, RotateCcw, Clock } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Giao hàng miễn phí",
      description: "Miễn phí giao hàng cho đơn hàng từ 1.000.000đ",
    },
    {
      icon: <ShieldCheck className="h-10 w-10 text-primary" />,
      title: "Sản phẩm chính hãng",
      description: "Cam kết 100% sản phẩm chính hãng",
    },
    {
      icon: <RotateCcw className="h-10 w-10 text-primary" />,
      title: "Đổi trả dễ dàng",
      description: "Đổi trả sản phẩm trong vòng 30 ngày",
    },
    {
      icon: <Clock className="h-10 w-10 text-primary" />,
      title: "Hỗ trợ 24/7",
      description: "Luôn sẵn sàng hỗ trợ bạn mọi lúc",
    },
  ]

  return (
    <section className="border-t py-12">
      <div className="container">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center rounded-lg p-6 transition-all hover:shadow-md"
            >
              <div className="mb-4 rounded-full bg-primary/10 p-3">{feature.icon}</div>
              <h3 className="mb-2 text-lg font-medium">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

