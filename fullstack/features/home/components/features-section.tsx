"use client";

import { Truck, CheckCircle, Clock, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
  const features = [
    {
      icon: <Truck className="h-6 w-6" />,
      title: "Giao hàng toàn quốc",
      description: "Miễn phí giao hàng cho đơn từ 500.000đ",
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Sản phẩm chính hãng",
      description: "Cam kết 100% nước hoa authentic",
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Hỗ trợ 24/7",
      description: "Luôn sẵn sàng giải đáp mọi thắc mắc",
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Thanh toán đa dạng",
      description: "Nhiều phương thức thanh toán an toàn",
    },
  ];

  return (
    <section className="py-12 md:py-16 bg-muted">
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
}

interface FeatureCardProps {
  feature: {
    icon: React.ReactNode;
    title: string;
    description: string;
  };
}

function FeatureCard({ feature }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center text-center p-6 rounded-lg",
        "bg-background shadow-sm hover:shadow-md transition-shadow"
      )}
    >
      <div className="p-3 rounded-full bg-primary/10 text-primary mb-4">
        {feature.icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
      <p className="text-muted-foreground">{feature.description}</p>
    </div>
  );
}
