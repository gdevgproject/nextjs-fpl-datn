import {
  Layers,
  Droplets,
  Calendar,
  ShoppingBag,
  Shield,
  Award,
  Heart,
  Truck,
  Leaf,
  RefreshCw,
  Zap,
  Sparkles,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Feature {
  title: string
  description: string
  icon: string
}

interface CategoryFeaturesProps {
  features: Feature[]
}

// Map của các icon tương ứng với tên icon
const iconMap: Record<string, LucideIcon> = {
  layers: Layers,
  droplets: Droplets,
  calendar: Calendar,
  shopping: ShoppingBag,
  shield: Shield,
  award: Award,
  heart: Heart,
  truck: Truck,
  leaf: Leaf,
  refresh: RefreshCw,
  zap: Zap,
  sparkles: Sparkles,
}

export function CategoryFeatures({ features }: CategoryFeaturesProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature, index) => {
        const IconComponent = iconMap[feature.icon] || Sparkles

        return (
          <Card key={index} className="bg-muted/50 border-muted hover:border-primary/50 transition-colors">
            <CardContent className="p-4 flex items-start">
              <div className="mr-4 mt-1">
                <div className="bg-primary/10 text-primary p-2 rounded-full">
                  <IconComponent className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

