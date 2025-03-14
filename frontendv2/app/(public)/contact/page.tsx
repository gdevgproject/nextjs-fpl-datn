import type { Metadata } from "next"
import { Breadcrumb } from "@/components/ui/Breadcrumb"
import { ContactForm } from "@/features/contact/components/ContactForm"
import { generateMetadata as generateSeoMetadata } from "@/utils/seo"

export const metadata: Metadata = generateSeoMetadata({
  title: "Liên Hệ - Elena Pharmacy",
  description: "Liên hệ với chúng tôi để được hỗ trợ và tư vấn",
})

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FE] pb-12 pt-6">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <Breadcrumb items={[{ label: "Trang Chủ", href: "/" }, { label: "Liên Hệ" }]} />

        {/* Main Content */}
        <div className="mx-auto max-w-2xl">
          <h1 className="mb-2 text-2xl font-bold text-grayscale-90">Liên Hệ Với Chúng Tôi</h1>
          <p className="mb-6 text-grayscale-60">
            Hãy điền thông tin bên dưới, chúng tôi sẽ liên hệ lại với bạn sớm nhất có thể.
          </p>

          <div className="rounded-lg bg-white p-6 shadow-sm">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  )
}

