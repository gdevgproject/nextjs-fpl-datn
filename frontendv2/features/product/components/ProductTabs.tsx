"use client"

import { useEffect, useRef, useState } from "react"
import { Check, AlertTriangle } from "lucide-react"
import { cn } from "@/utils/helpers"
import type { Product } from "@/features/product/types/productTypes"

interface ProductTabsProps {
  product: Product
}

const sections = [
  { id: "description", label: "Mô tả sản phẩm" },
  { id: "features", label: "Đặc điểm nổi bật" },
  { id: "ingredients", label: "Thành phần" },
  { id: "usage", label: "Cách dùng" },
  { id: "sideEffects", label: "Tác dụng phụ" },
  { id: "warnings", label: "Lưu ý" },
  { id: "storage", label: "Bảo quản" },
]

const textSizes = [
  { id: "default", label: "Mặc định" },
  { id: "large", label: "Lớn hơn" },
]

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeSection, setActiveSection] = useState("description")
  const [textSize, setTextSize] = useState<"default" | "large">("default")
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      {
        root: null,
        rootMargin: "-20% 0px -80% 0px",
      },
    )

    const contentElement = contentRef.current
    if (contentElement) {
      contentElement.querySelectorAll("section[id]").forEach((section) => {
        observer.observe(section)
      })
    }

    return () => observer.disconnect()
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <div className="rounded-lg border border-grayscale-20">
      <div className="flex">
        {/* Left Column - Navigation */}
        <div className="w-fit border-r border-grayscale-20">
          <nav className="sticky top-4 flex flex-col" aria-label="Product sections">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={cn(
                  "border-b border-[#E5E7EB] px-6 py-3 text-left text-sm text-[#111827] transition-colors last:border-b-0",
                  activeSection === section.id ? "bg-[#F8F9FA] font-medium" : "hover:bg-gray-50",
                )}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Right Column - Content */}
        <div className="flex-1 p-6">
          {/* Header with Text Size Controls */}
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Hỗn dịch uống Enterogermina Gut Defense</h1>
            <div className="flex items-center gap-2 rounded-full bg-gray-100 p-1">
              {textSizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setTextSize(size.id as "default" | "large")}
                  className={cn(
                    "rounded-full px-4 py-1 text-sm font-medium transition-colors",
                    textSize === size.id ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900",
                  )}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div
            ref={contentRef}
            className={cn(
              "transition-all duration-300 delay-100",
              textSize === "large" ? "text-lg leading-relaxed" : "text-base leading-normal",
            )}
          >
            {/* Description Section */}
            <section id="description">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Hỗn dịch uống Enterogermina Gut Defense là gì?</h2>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">
                Sự hợp tác chiến lược giữa VNH và thiết bị y tế OMRON
              </h3>
              <p className="mb-4 text-gray-700">
                Tại Việt Nam, ngày càng nhiều trẻ nhỏ gặp vấn đề về tiêu hóa, với tỷ lệ mắc bệnh lên tới 40%. Trong giai
                đoạn đầu đời, hệ tiêu hóa của trẻ rất nhạy cảm và dễ bị tác động bởi nhiều yếu tố...
              </p>
            </section>

            {/* Ingredients Section */}
            <section id="ingredients" className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Thành phần của Hỗn dịch uống Enterogermina Gut Defense
              </h2>
              <p className="mb-2 text-sm text-gray-600">Thành phần cho 1 ống</p>

              <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Thông tin thành phần</th>
                      <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Hàm lượng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-900">Bacillus clausii</td>
                      <td className="px-6 py-4 text-sm text-gray-900">2×10^9cfu</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Usage Section */}
            <section id="usage" className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">
                Cách dùng Hỗn dịch uống Enterogermina Gut Defense
              </h2>
              <p className="mb-2 text-gray-700">Uống trực tiếp.</p>
              <ul className="ml-5 list-disc space-y-1 text-gray-700">
                <li>Cho trẻ 0 - 12 tuổi: 1 - 2 ống mỗi ngày.</li>
                <li>Trẻ trên 12 tuổi và người lớn: 2 - 3 ống mỗi ngày.</li>
              </ul>
            </section>

            {/* Warnings Section */}
            <section id="warnings" className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Lưu ý</h2>
              <div className="mt-4 rounded-lg bg-orange-50 p-4">
                <div className="flex items-start">
                  <AlertTriangle className="mr-3 h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-orange-800">Lưu ý</p>
                    <ul className="mt-2 list-disc space-y-2 pl-5 text-orange-700">
                      <li>Không sử dụng cho người mẫn cảm/kiêng kỵ với bất kỳ thành phần nào của sản phẩm.</li>
                      <li>
                        Người đang sử dụng thuốc, phụ nữ có thai hoặc đang cho con bú cần tham khảo ý kiến chuyên gia y
                        tế trước khi sử dụng.
                      </li>
                      <li>Chỉ được uống, không được tiêm.</li>
                      <li>Không dùng quá liều khuyến cáo.</li>
                      <li>Sản phẩm này không phải là thuốc và không có tác dụng thay thế thuốc chữa bệnh.</li>
                      <li>Đọc kỹ hướng dẫn sử dụng trước khi dùng.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Storage Section */}
            <section id="storage" className="mt-8">
              <h2 className="mb-4 text-xl font-bold text-gray-900">Bảo quản</h2>
              <ul className="ml-5 list-disc space-y-1 text-gray-700">
                <li>Bảo quản nơi khô ráo, thoáng mát, nhiệt độ không quá 30 độ C, tránh ánh sáng.</li>
                <li>Để xa tầm tay trẻ em.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="border-t border-grayscale-20 bg-blue-50 p-4">
        <p className="text-sm text-blue-900">
          Thực phẩm bảo vệ sức khoẻ, không phải là thuốc, không có tác dụng thay thế thuốc chữa bệnh.
        </p>
      </div>

      {/* Author Info */}
      <div className="border-t border-grayscale-20 p-4">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 overflow-hidden rounded-full">
            <img
              src="/placeholder.svg?height=48&width=48"
              alt="Dược sĩ Nguyễn Thanh Hải"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-4">
              <h3 className="font-medium text-gray-900">Dược sĩ Đại học Nguyễn Thanh Hải</h3>
              <div className="flex items-center gap-1 rounded-full bg-green-50 px-3 py-1">
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Đã kiểm duyệt nội dung</span>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Tốt nghiệp Đại học Dược Hà Nội, với hơn 10 năm kinh nghiệm trong lĩnh vực Dược phẩm
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

