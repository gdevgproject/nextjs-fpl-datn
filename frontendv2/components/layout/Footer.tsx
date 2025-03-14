import Link from "next/link"
import Image from "next/image"

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* About Us Column */}
          <section aria-labelledby="about-heading">
            <h2 id="about-heading" className="font-semibold text-lg mb-4">
              VỀ CHÚNG TÔI
            </h2>
            <nav aria-label="About Us Links">
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Giới thiệu
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Hệ thống cửa hàng
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Giấy phép kinh doanh
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Quy chế hoạt động
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Chính sách đặt cọc
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Chính sách nội dung
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Chính sách giao hàng
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Chính sách thanh toán
                  </Link>
                </li>
              </ul>
            </nav>
          </section>

          {/* Learn More Column */}
          <section aria-labelledby="learn-more-heading">
            <h2 id="learn-more-heading" className="font-semibold text-lg mb-4">
              TÌM HIỂU THÊM
            </h2>
            <nav aria-label="Learn More Links">
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Bệnh viện
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Góc sức khoẻ
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Tra cứu thuốc
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Tra cứu dược chất
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Tra cứu dược liệu
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Bệnh thường gặp
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Đội ngũ chuyên môn
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Tin tức tuyển dụng
                  </Link>
                </li>
              </ul>
            </nav>
          </section>

          {/* Categories Column */}
          <section aria-labelledby="categories-heading">
            <h2 id="categories-heading" className="font-semibold text-lg mb-4">
              DANH MỤC
            </h2>
            <nav aria-label="Categories Links">
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Thực phẩm chức năng
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Dược mỹ phẩm
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Chăm sóc cá nhân
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Trang thiết bị y tế
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Đặt thuốc online
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-primary-5">
                    Trung tâm Tiêm chủng
                  </Link>
                </li>
              </ul>
            </nav>
          </section>

          {/* Contact & Certifications Column */}
          <section className="space-y-6">
            {/* Hotline Section */}
            <div aria-labelledby="hotline-heading">
              <h2 id="hotline-heading" className="font-semibold text-lg mb-4">
                TỔNG ĐÀI
              </h2>
              <ul className="space-y-2">
                <li>
                  <p>Tư vấn mua hàng</p>
                  <p className="font-semibold text-primary">1900 6789 (Nhánh 1)</p>
                </li>
                <li>
                  <p>Trung tâm Vắc Xin</p>
                  <p className="font-semibold text-primary">1900 6789 (Nhánh 2)</p>
                </li>
                <li>
                  <p>Góp ý - Khiếu nại</p>
                  <p className="font-semibold text-primary">1900 6789 (Nhánh 3)</p>
                </li>
              </ul>
            </div>

            {/* Certifications */}
            <div aria-labelledby="certifications-heading">
              <h2 id="certifications-heading" className="font-semibold text-lg mb-4">
                CHỨNG NHẬN
              </h2>
              <div className="flex space-x-4">
                <Image src="/placeholder.svg?height=40&width=40" alt="Certification 1" width={40} height={40} />
                <Image src="/placeholder.svg?height=40&width=100" alt="DMCA Protected" width={100} height={40} />
              </div>
            </div>

            {/* Social Media */}
            <div aria-labelledby="social-heading">
              <h2 id="social-heading" className="font-semibold text-lg mb-4">
                KẾT NỐI VỚI CHÚNG TÔI
              </h2>
              <div className="flex space-x-4">
                <Link href="#" className="hover:opacity-80" aria-label="Facebook">
                  <Image src="/placeholder.svg?height=32&width=32" alt="Facebook" width={32} height={32} />
                </Link>
                <Link href="#" className="hover:opacity-80" aria-label="Zalo">
                  <Image src="/placeholder.svg?height=32&width=32" alt="Zalo" width={32} height={32} />
                </Link>
              </div>
            </div>
          </section>

          {/* Payment & App Download Column */}
          <section className="space-y-6">
            {/* Payment Methods */}
            <div aria-labelledby="payment-heading">
              <h2 id="payment-heading" className="font-semibold text-lg mb-4">
                HỖ TRỢ THANH TOÁN
              </h2>
              <div className="grid grid-cols-3 gap-2">
                {["JCB", "Mastercard", "Visa", "VNPay", "ZaloPay", "MoMo"].map((method) => (
                  <Image
                    key={method}
                    src="/placeholder.svg?height=32&width=48"
                    alt={method}
                    width={48}
                    height={32}
                    className="object-contain"
                  />
                ))}
              </div>
            </div>

            {/* App Download */}
            <div aria-labelledby="app-download-heading">
              <h2 id="app-download-heading" className="font-semibold text-lg mb-4">
                TẢI ỨNG DỤNG
              </h2>
              <Image
                src="/placeholder.svg?height=120&width=120"
                alt="QR Code"
                width={120}
                height={120}
                className="rounded-lg"
              />
            </div>
          </section>
        </div>

        {/* Copyright Section */}
        <div className="mt-8 pt-8 border-t text-sm text-grayscale-50">
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

