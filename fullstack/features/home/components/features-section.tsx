import { Truck, Shield, RotateCcw, Clock } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: Truck,
      title: "Giao hàng toàn quốc",
      description: "Giao hàng nhanh chóng đến tận nhà trên toàn quốc",
    },
    {
      icon: Shield,
      title: "Sản phẩm chính hãng",
      description: "Cam kết 100% sản phẩm chính hãng, nguồn gốc rõ ràng",
    },
    {
      icon: RotateCcw,
      title: "Đổi trả dễ dàng",
      description: "Chính sách đổi trả linh hoạt trong vòng 30 ngày",
    },
    {
      icon: Clock,
      title: "Hỗ trợ 24/7",
      description: "Đội ngũ tư vấn viên luôn sẵn sàng hỗ trợ bạn mọi lúc",
    },
  ]

  return (
    <section className="bg-background py-12">
      <div className="container">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-medium">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

