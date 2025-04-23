import { ChatInterface } from "@/features/shop/ai/components/chat-interface"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "MyBeauty AI - Trợ lý ảo tư vấn nước hoa",
  description: "Trò chuyện với trợ lý ảo thông minh của MyBeauty để tìm kiếm nước hoa phù hợp với sở thích của bạn.",
}

export default function AIPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Trợ lý ảo MyBeauty</h1>
          <p className="mt-2 text-muted-foreground">
            Trò chuyện với trợ lý ảo thông minh của chúng tôi để tìm kiếm nước hoa phù hợp với sở thích của bạn.
          </p>
        </div>

        <ChatInterface />
      </div>
    </div>
  )
}
