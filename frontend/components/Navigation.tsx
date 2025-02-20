import Link from "next/link";

const Navigation = () => {
  return (
    <nav className="bg-gray-100 py-3">
      <div className="container mx-auto px-4">
        <ul className="flex space-x-6">
          <li>
            <Link href="/" className="hover:text-primary">
              Trang chủ
            </Link>
          </li>
          <li>
            <Link href="/products" className="hover:text-primary">
              Sản phẩm
            </Link>
          </li>
          <li>
            <Link href="/brands" className="hover:text-primary">
              Thương hiệu
            </Link>
          </li>
          <li>
            <Link href="/about" className="hover:text-primary">
              Giới thiệu
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-primary">
              Liên hệ
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};
export default Navigation;
