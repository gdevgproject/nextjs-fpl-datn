"use client";

import { cn } from "@/lib/utils";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null;
  }

  // Tính điểm mạnh của mật khẩu
  let strength = 0;

  // Độ dài
  if (password.length >= 8) strength += 1;

  // Chữ thường
  if (/[a-z]/.test(password)) strength += 1;

  // Chữ hoa
  if (/[A-Z]/.test(password)) strength += 1;

  // Số
  if (/[0-9]/.test(password)) strength += 1;

  // Ký tự đặc biệt
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

  return (
    <div className="mt-1 space-y-1">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full",
              i < strength ? getStrengthColor(strength) : "bg-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {getStrengthText(strength)}
      </p>
    </div>
  );
}

function getStrengthColor(strength: number) {
  if (strength <= 2) return "bg-red-500";
  if (strength <= 3) return "bg-yellow-500";
  return "bg-green-500";
}

function getStrengthText(strength: number) {
  if (strength <= 2) return "Yếu - Thêm chữ hoa, số và ký tự đặc biệt";
  if (strength <= 3) return "Trung bình - Thêm ký tự đặc biệt";
  if (strength === 4) return "Khá mạnh";
  return "Mạnh";
}
