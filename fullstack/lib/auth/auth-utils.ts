import { createClientSupabaseClient } from "@/lib/supabase/supabase-client";
import { AuthError } from "@supabase/supabase-js";

// Cập nhật hàm getErrorMessage để hiển thị thông báo lỗi tiếng Việt chi tiết hơn
export function getErrorMessage(error: AuthError | Error | unknown): string {
  if (!error) return "Đã xảy ra lỗi không xác định";

  if (error instanceof AuthError) {
    // Supabase Auth Error
    switch (error.message) {
      case "Invalid login credentials":
        return "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại thông tin đăng nhập của bạn.";
      case "Email not confirmed":
        return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư của bạn và nhấp vào liên kết xác nhận.";
      case "User already registered":
        return "Email này đã được đăng ký. Vui lòng sử dụng email khác hoặc đăng nhập.";
      case "Password should be at least 6 characters":
        return "Mật khẩu phải có ít nhất 6 ký tự.";
      case "For security purposes, you can only request this once every 60 seconds":
        return "Vì lý do bảo mật, bạn chỉ có thể yêu cầu một lần mỗi 60 giây.";
      case "Invalid reset password token":
        return "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.";
      case "Email link is invalid or has expired":
        return "Liên kết email không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu liên kết mới.";
      default:
        return `Lỗi: ${error.message}`;
    }
  }

  if (error instanceof Error) {
    return `Lỗi: ${error.message}`;
  }

  return "Đã xảy ra lỗi không xác định";
}

export async function sendVerificationEmail(
  email: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClientSupabaseClient();
    const { error } = await supabase.auth.resendEmailConfirmation({ email });

    if (error) {
      return { success: false, error: getErrorMessage(error) };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}

export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const supabase = createClientSupabaseClient();
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false,
      },
    });

    // If there's no error, the email exists
    // If there's an error with message "Email not found", the email doesn't exist
    return !error || error.message !== "Email not found";
  } catch (error) {
    console.error("Error checking if email exists:", error);
    return false;
  }
}

// Kiểm tra URL có chứa thông tin lỗi không
export function getErrorFromURL(url: URL): {
  hasError: boolean;
  errorCode?: string;
  errorMessage?: string;
} {
  const errorCode =
    url.searchParams.get("error_code") ||
    url.hash.match(/error_code=([^&]*)/)?.[1];
  const errorMessage =
    url.searchParams.get("error_description") ||
    url.hash.match(/error_description=([^&]*)/)?.[1];

  if (errorCode || errorMessage) {
    return {
      hasError: true,
      errorCode: errorCode || undefined,
      errorMessage: errorMessage
        ? decodeURIComponent(errorMessage.replace(/\+/g, " "))
        : undefined,
    };
  }

  return { hasError: false };
}

// Lưu email đang chờ xác nhận vào localStorage
export function savePendingConfirmationEmail(email: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("pendingConfirmationEmail", email);
  }
}

// Lấy email đang chờ xác nhận từ localStorage
export function getPendingConfirmationEmail(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("pendingConfirmationEmail");
  }
  return null;
}

// Xóa email đang chờ xác nhận khỏi localStorage
export function clearPendingConfirmationEmail(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("pendingConfirmationEmail");
  }
}

// Cập nhật hàm validatePassword để phản ánh cấu hình mật khẩu của Supabase
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  }

  // Không cần kiểm tra các yêu cầu khác vì Supabase không yêu cầu
  // Nhưng vẫn giữ lại các kiểm tra bổ sung để tăng cường bảo mật
  // Chỉ hiển thị như gợi ý, không bắt buộc
  if (!/[A-Z]/.test(password)) {
    errors.push("Gợi ý: Nên có ít nhất 1 chữ hoa");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Gợi ý: Nên có ít nhất 1 chữ thường");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Gợi ý: Nên có ít nhất 1 số");
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Gợi ý: Nên có ít nhất 1 ký tự đặc biệt");
  }

  return {
    isValid: password.length >= 6, // Chỉ kiểm tra độ dài tối thiểu
    errors,
  };
}
