import Link from "next/link";
import { RegisterForm } from "./register-form";

export function RegisterPage() {
  return (
    <>
      <div className="flex flex-col space-y-2 text-center mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Đăng ký tài khoản
        </h1>
        <p className="text-sm text-muted-foreground">
          Nhập thông tin của bạn để tạo tài khoản
        </p>
      </div>
      <RegisterForm />
      <div className="text-center text-sm mt-4">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="text-primary hover:underline">
          Đăng nhập
        </Link>
      </div>
    </>
  );
}
