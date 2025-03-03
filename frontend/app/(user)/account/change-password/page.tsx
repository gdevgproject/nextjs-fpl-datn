"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Thêm icons
import { motion } from "framer-motion"; // Thêm animation

interface ChangePasswordFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<ChangePasswordFormData>();

  const newPassword = watch("newPassword");

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      setIsLoading(true);
      // Giả lập API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Thực tế sẽ gọi API đổi mật khẩu ở đây
      console.log("Password changed:", data);

      toast.success("Đổi mật khẩu thành công!");
      reset(); // Reset form
    } catch (error) {
      toast.error("Đổi mật khẩu thất bại. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-8"
    >
      {/* Breadcrumb */}
      <div className="text-sm breadcrumbs mb-6">
        <ul>
          <li>
            <Link href="/">Trang chủ</Link>
          </li>
          <li>
            <Link href="/account/dashboard">Tài khoản</Link>
          </li>
          <li>Đổi mật khẩu</li>
        </ul>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar - Copy từ dashboard page */}
        {/* ... */}

        <div className="lg:col-span-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-8 rounded-lg shadow-lg"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800">Đổi mật khẩu</h1>
              <p className="text-gray-600 mt-2">
                Để bảo mật tài khoản, vui lòng không chia sẻ mật khẩu cho người
                khác
              </p>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-md space-y-8"
            >
              {/* Current Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Mật khẩu hiện tại
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? "text" : "password"}
                    {...register("currentPassword", {
                      required: "Vui lòng nhập mật khẩu hiện tại",
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all ${
                      errors.currentPassword
                        ? "border-red-500 ring-red-100"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("current")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
                {errors.currentPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.currentPassword.message}
                  </motion.p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Yêu cầu mật khẩu mới:
                </h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        watch("newPassword")?.length >= 8
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    Tối thiểu 8 ký tự
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        /[A-Z]/.test(watch("newPassword") || "")
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    Ít nhất 1 chữ hoa
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        /[a-z]/.test(watch("newPassword") || "")
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    Ít nhất 1 chữ thường
                  </li>
                  <li className="flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-2 ${
                        /\d/.test(watch("newPassword") || "")
                          ? "bg-green-500"
                          : "bg-gray-300"
                      }`}
                    />
                    Ít nhất 1 số
                  </li>
                </ul>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? "text" : "password"}
                    {...register("newPassword", {
                      required: "Vui lòng nhập mật khẩu mới",
                      minLength: {
                        value: 8,
                        message: "Mật khẩu phải có ít nhất 8 ký tự",
                      },
                      pattern: {
                        value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/,
                        message:
                          "Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số",
                      },
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all ${
                      errors.newPassword
                        ? "border-red-500 ring-red-100"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("new")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
                {errors.newPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.newPassword.message}
                  </motion.p>
                )}
              </div>

              {/* Confirm New Password */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? "text" : "password"}
                    {...register("confirmPassword", {
                      required: "Vui lòng xác nhận mật khẩu mới",
                      validate: (value) =>
                        value === newPassword || "Mật khẩu xác nhận không khớp",
                    })}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none transition-all ${
                      errors.confirmPassword
                        ? "border-red-500 ring-red-100"
                        : "border-gray-200"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility("confirm")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm"
                  >
                    {errors.confirmPassword.message}
                  </motion.p>
                )}
              </div>

              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 transition-all disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Đang xử lý...
                  </div>
                ) : (
                  "Đổi mật khẩu"
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
