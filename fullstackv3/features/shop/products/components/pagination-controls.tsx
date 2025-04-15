"use client"
import { useRouter, usePathname } from "next/navigation"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface PaginationControlsProps {
  currentPage: number
  totalPages: number
  searchParams: { [key: string]: string | string[] | undefined }
}

export function PaginationControls({ currentPage, totalPages, searchParams }: PaginationControlsProps) {
  const router = useRouter()
  const pathname = usePathname()

  // Tạo URL mới với tham số page được cập nhật
  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams()

    // Thêm tất cả các tham số hiện tại vào URL mới
    Object.entries(searchParams).forEach(([key, value]) => {
      if (key !== "page" && value !== undefined) {
        if (Array.isArray(value)) {
          value.forEach((v) => {
            if (v) params.append(key, v)
          })
        } else if (value) {
          params.set(key, value)
        }
      }
    })

    // Thêm tham số page mới
    if (pageNumber !== 1) {
      params.set("page", pageNumber.toString())
    } else {
      params.delete("page") // Xóa tham số page nếu là trang 1
    }

    return `${pathname}?${params.toString()}`
  }

  // Tạo mảng các số trang để hiển thị
  const getPageNumbers = () => {
    const pageNumbers = []
    const maxPagesToShow = 5

    if (totalPages <= maxPagesToShow) {
      // Hiển thị tất cả các trang nếu tổng số trang ít hơn maxPagesToShow
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      // Luôn hiển thị trang đầu tiên
      pageNumbers.push(1)

      // Tính toán trang bắt đầu và kết thúc để hiển thị
      let startPage = Math.max(2, currentPage - 1)
      let endPage = Math.min(totalPages - 1, currentPage + 1)

      // Điều chỉnh nếu đang ở gần đầu hoặc cuối
      if (currentPage <= 2) {
        endPage = 4
      } else if (currentPage >= totalPages - 1) {
        startPage = totalPages - 3
      }

      // Thêm dấu chấm lửng nếu cần
      if (startPage > 2) {
        pageNumbers.push("...")
      }

      // Thêm các trang ở giữa
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i)
      }

      // Thêm dấu chấm lửng nếu cần
      if (endPage < totalPages - 1) {
        pageNumbers.push("...")
      }

      // Luôn hiển thị trang cuối cùng
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={createPageURL(currentPage - 1)}
            aria-disabled={currentPage <= 1}
            tabIndex={currentPage <= 1 ? -1 : undefined}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {getPageNumbers().map((page, i) => (
          <PaginationItem key={i}>
            {page === "..." ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink href={createPageURL(page)} isActive={page === currentPage}>
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href={createPageURL(currentPage + 1)}
            aria-disabled={currentPage >= totalPages}
            tabIndex={currentPage >= totalPages ? -1 : undefined}
            className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}

