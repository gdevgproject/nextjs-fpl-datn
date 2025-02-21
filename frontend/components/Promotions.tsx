import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Discount } from "@/lib/mockData"

interface PromotionsProps {
  discounts: Discount[]
}

export default function Promotions({ discounts }: PromotionsProps) {
  const handleUseCode = (code: string) => {
    // Implement logic to use the discount code
    console.log(`Using discount code: ${code}`)
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Special Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {discounts.map((discount) => (
            <Card key={discount.id} className="bg-gradient-to-r from-purple-400 to-pink-500 text-white">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold mb-2">{discount.discount_code}</h3>
                <p className="mb-4">{discount.percent}% OFF</p>
                {discount.minimum_spend && <p className="text-sm mb-2">Minimum spend: ${discount.minimum_spend}</p>}
                {discount.maximum_spend && <p className="text-sm mb-2">Maximum spend: ${discount.maximum_spend}</p>}
                <Button variant="secondary" onClick={() => handleUseCode(discount.discount_code)}>
                  Use Code
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

