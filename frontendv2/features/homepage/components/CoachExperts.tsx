import { Button } from "@/components/ui/Button"
import { ChevronRight } from "lucide-react"
import Image from "next/image"

const coaches = [
  {
    id: 1,
    name: "Nguyễn Anh Tuấn",
    title: "Bác sĩ chuyên khoa 1",
    experience: "10 năm kinh nghiệm",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 2,
    name: "Nguyễn Anh Tuấn",
    title: "Bác sĩ chuyên khoa 1",
    experience: "10 năm kinh nghiệm",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 3,
    name: "Nguyễn Anh Tuấn",
    title: "Bác sĩ chuyên khoa 1",
    experience: "10 năm kinh nghiệm",
    image: "/placeholder.svg?height=120&width=120",
  },
]

export default function CoachExperts() {
  return (
    <section
      className="rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary-40 to-primary-60 p-4 sm:p-6 md:p-8"
      aria-labelledby="coaches-heading"
    >
      <header className="mb-4 sm:mb-6 md:mb-8">
        <h2 id="coaches-heading" className="mb-1 sm:mb-2 text-xl sm:text-2xl font-bold text-white">
          Coach tư vấn chăm sóc sức khỏe
        </h2>
        <p className="mb-3 sm:mb-4 text-sm sm:text-base text-white/90">
          Danh sách các Coach tư vấn chăm sóc sức khỏe của Elela
        </p>
        <Button
          variant="secondary"
          className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-1 sm:py-2 h-auto"
        >
          Tìm hiểu thêm
          <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
        </Button>
      </header>

      <ul className="grid grid-cols-1 gap-2 sm:gap-3 md:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {coaches.map((coach) => (
          <li key={coach.id} className="rounded-lg sm:rounded-xl bg-white p-2 sm:p-3 md:p-4">
            <article className="flex items-center gap-2 sm:gap-3 md:gap-4">
              <Image
                src={coach.image || "/placeholder.svg"}
                alt={coach.name}
                width={60}
                height={60}
                className="rounded-full w-[40px] h-[40px] sm:w-[60px] sm:h-[60px] md:w-[80px] md:h-[80px]"
              />
              <div>
                <p className="text-[10px] sm:text-xs md:text-sm text-grayscale-60">{coach.title}</p>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold text-grayscale-90">
                  {coach.name}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-grayscale-50">
                  {coach.experience}
                </p>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
