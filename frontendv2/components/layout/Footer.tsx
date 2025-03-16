import Link from "next/link"
import Image from "next/image"
import { Dot } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* About Us Column */}
          <div>
            <div className="flex">
              <span className="text-primary">
                <Dot className="text-primary -ml-2" stroke="currentColor" strokeWidth={5} />
              </span>
              <h4 className="font-semibold text-lg mb-4">VỀ CHÚNG TÔI</h4>
            </div>

            <ul className="space-y-2">
              {[
                "Giới thiệu",
                "Hệ thống cửa hàng",
                "Giấy phép kinh doanh",
                "Quy chế hoạt động",
                "Chính sách đặt cọc",
                "Chính sách nội dung",
                "Chính sách giao hàng",
                "Chính sách thanh toán",
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <Link className="text-grayscale-40 hover:text-primary -ml-1" href="#">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Learn More Column */}
          <div>
            <div className="flex">
              <span className="text-primary">
                <Dot className="text-primary -ml-2" stroke="currentColor" strokeWidth={5} />
              </span>
              <h4 className="font-semibold text-lg mb-4">TÌM HIỂU THÊM</h4>
            </div>

            <ul className="space-y-2">
              {[
                "Bệnh viện",
                "Góc sức khoẻ",
                "Tra cứu thuốc",
                "Tra cứu dược chất",
                "Tra cứu dược liệu",
                "Bệnh thường gặp",
                "Đội ngũ chuyên môn",
                "Tin tức tuyển dụng",
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <Link className="text-grayscale-40 hover:text-primary -ml-1" href="#">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories Column */}
          <div>
            <div className="flex">
              <span className="text-primary">
                <Dot className="text-primary -ml-2" stroke="currentColor" strokeWidth={5} />
              </span>
              <h4 className="font-semibold text-lg mb-4">DANH MỤC</h4>
            </div>

            <ul className="space-y-2">
              {[
                "Thực phẩm chức năng",
                "Dược mỹ phẩm",
                "Chăm sóc cá nhân",
                "Trang thiết bị y tế",
                "Đặt thuốc online",
                "Trung tâm Tiêm chủng",
              ].map((item, index) => (
                <li key={index} className="flex items-center">
                  <Link className="text-grayscale-40 hover:text-primary -ml-1" href="#">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Certifications Column */}
          <section className="space-y-6">
            {/* Hotline Section */}
            <div>
              <div className="flex">
                <span className="text-primary">
                  <Dot className="text-primary -ml-2" stroke="currentColor" strokeWidth={5} />
                </span>
                <h4 className="font-semibold text-lg mb-4">TỔNG ĐÀI</h4>
              </div>

              <ul className="space-y-2">
                <li>
                  <p className="text-grayscale-40">Tư vấn mua hàng</p>
                  <p className="font-normal text-primary">1900 6789 (Nhánh 1)</p>
                </li>
                <li>
                  <p className="text-grayscale-40">Trung tâm Vắc Xin</p>
                  <p className="font-normal text-primary">1900 6789 (Nhánh 2)</p>
                </li>
                <li>
                  <p className="text-grayscale-40">Góp ý - Khiếu nại</p>
                  <p className="font-normal text-primary">1900 6789 (Nhánh 3)</p>
                </li>
              </ul>
            </div>

            {/* Certifications */}
            <div>
              <div className="flex">
                <span className="text-primary">
                  <Dot className="text-primary -ml-2" stroke="currentColor" strokeWidth={5} />
                </span>
                <h4 className="font-semibold text-lg mb-4">CHỨNG NHẬN</h4>
              </div>

              <div className="flex space-x-4">
                <Image alt="Certification 1" height={40} src="/placeholder.svg?height=40&width=40" width={40} />
                <Image alt="DMCA Protected" height={40} src="/placeholder.svg?height=40&width=100" width={100} />
              </div>
            </div>

            {/* Social Media */}
            <div>
              <div className="flex">
                <span className="text-primary">
                  <Dot className="text-primary -ml-2" stroke="currentColor" strokeWidth={5} />
                </span>
                <h4 className="font-semibold text-lg mb-4">KẾT NỐI VỚI CHÚNG TÔI</h4>
              </div>

              <div className="flex space-x-4">
                <Link className="hover:opacity-80" href="#" aria-label="Facebook">
                  <Image alt="Facebook" height={32} src="/placeholder.svg?height=32&width=32" width={32} />
                </Link>
                <Link className="hover:opacity-80" href="#" aria-label="Zalo">
                  <Image alt="Zalo" height={32} src="/placeholder.svg?height=32&width=32" width={32} />
                </Link>
              </div>
            </div>
          </section>

          {/* Payment & App Download Column */}
          <section className="space-y-6">
            {/* Payment Methods */}
            <div>
              <div className="flex">
                <span className="text-primary">
                  <Dot className="text-primary -ml-2" stroke="currentColor" strokeWidth={5} />
                </span>
                <h4 className="font-semibold text-lg mb-4">HỖ TRỢ THANH TOÁN</h4>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {["JCB", "Mastercard", "Visa", "VNPay", "ZaloPay", "MoMo"].map((method) => (
                  <Image
                    key={method}
                    alt={method}
                    className="object-contain"
                    height={32}
                    src="/placeholder.svg?height=32&width=48"
                    width={48}
                  />
                ))}
              </div>
            </div>

            {/* App Download */}
            <div>
              <div className="flex">
                <span className="text-primary">
                  <Dot className="text-primary -ml-2" stroke="currentColor" strokeWidth={5} />
                </span>
                <h4 className="font-semibold text-lg mb-4">TẢI ỨNG DỤNG</h4>
              </div>

              <Image
                alt="QR Code"
                className="rounded-lg"
                height={120}
                src="/placeholder.svg?height=120&width=120"
                width={120}
              />
            </div>
          </section>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-8 border-t border-grayscale-20 text-sm text-grayscale-50">
          <p>© 2023 - 2024 Công ty Cổ Phần Elena | Số ĐKKD 000000000 cấp ngày 17/09/2023 tại Sở Kế hoạch Đầu tư TPHN</p>
          <address className="mt-2 not-italic">
            • Địa chỉ: 30 Vĩnh Phúc, Ba Đình, Hà Nội • Số điện thoại: (084)00000000 • Email: sale@elena.com.vn • Người
            quản lý nội dung: Elena
          </address>
        </div>
      </div>
    </footer>
  )
}

