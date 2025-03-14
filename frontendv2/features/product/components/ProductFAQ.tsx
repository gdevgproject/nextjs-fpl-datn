"use client"

import { useState } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/utils/helpers"

interface FAQ {
  id: string
  question: string
  answer: string
}

interface ProductFAQProps {
  showTitle?: boolean
}

const faqs: FAQ[] = [
  {
    id: "1",
    question: "Enterogermina Gut Defense có sử dụng được cho người ăn chay không?",
    answer:
      "Enterogermina Gut Defense không chứa thành phần từ động vật và phù hợp cho người ăn chay. Không sử dụng cho người mẫn cảm với bất kỳ thành phần nào của sản phẩm. Nên tham khảo ý kiến chuyên gia y tế trước khi sử dụng nếu đang dùng thuốc khác hoặc trong thời kỳ mang thai và cho con bú. Enterogermina Gut Defense phù hợp cho mọi lứa tuổi, giúp tăng cường tiêu hóa, hỗ trợ bảo vệ đường ruột trước vi khuẩn.",
  },
  {
    id: "2",
    question: "Có cần lưu ý gì đặc biệt khi sử dụng Enterogermina Gut Defense không?",
    answer:
      "Nên bảo quản sản phẩm ở nơi khô ráo, tránh ánh nắng trực tiếp và nhiệt độ cao. Không sử dụng khi sản phẩm đã hết hạn sử dụng. Nên uống đều đặn theo hướng dẫn để đạt hiệu quả tốt nhất.",
  },
  {
    id: "3",
    question: "Những ai nên sử dụng Enterogermina Gut Defense?",
    answer:
      "Người bị rối loạn tiêu hóa, đầy hơi, khó tiêu. Người đang dùng kháng sinh. Người có hệ tiêu hóa nhạy cảm. Người cần tăng cường hệ miễn dịch đường ruột.",
  },
  {
    id: "4",
    question: "Enterogermina Gut Defense có phù hợp cho trẻ em không?",
    answer:
      "Enterogermina Gut Defense phù hợp cho trẻ em từ 6 tuổi trở lên. Trẻ em dưới 6 tuổi nên tham khảo ý kiến bác sĩ trước khi sử dụng.",
  },
  {
    id: "5",
    question: "Thành phần chính trong Enterogermina Gut Defense là gì?",
    answer:
      "Thành phần chính bao gồm các chủng vi khuẩn có lợi Bacillus clausii, cùng với các prebiotic hỗ trợ sự phát triển của vi khuẩn có lợi trong đường ruột.",
  },
]

export default function ProductFAQ({ showTitle = false }: ProductFAQProps) {
  const [openId, setOpenId] = useState<string | null>("1")

  return (
    <div className="rounded-lg">
      {showTitle && (
        <div className="p-6">
          <h2 className="text-xl font-bold text-grayscale-90">Câu hỏi thường gặp</h2>
        </div>
      )}

      <div className="divide-y divide-grayscale-10">
        {faqs.map((faq) => {
          const isOpen = openId === faq.id
          return (
            <div key={faq.id} className={cn("transition-all duration-200", isOpen ? "bg-grayscale-5" : "bg-white")}>
              <button
                onClick={() => setOpenId(openId === faq.id ? null : faq.id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-40 text-white">
                    <span className="text-sm">?</span>
                  </div>
                  <span className="font-medium text-grayscale-80">{faq.question}</span>
                </div>
                {isOpen ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0 text-grayscale-60" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0 text-grayscale-60" />
                )}
              </button>
              {isOpen && (
                <div className="px-4 pb-4 pl-[3.25rem]">
                  <p className="text-grayscale-60">{faq.answer}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

