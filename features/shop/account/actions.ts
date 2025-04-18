"use server";

import { revalidatePath } from "next/cache";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import {
  createErrorResponse,
  createSuccessResponse,
} from "@/lib/utils/error-utils";

// Các actions đã có trước đó
export async function updateProfileInfo(userId: string, data: any) {
  const supabase = await getSupabaseServerClient();

  try {
    // Kiểm tra session để đảm bảo user chỉ cập nhật profile của chính mình
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(
        "Bạn cần đăng nhập để thực hiện hành động này",
        "unauthorized"
      );
    }

    // Chỉ cho phép cập nhật profile của chính mình
    if (session.user.id !== userId) {
      return createErrorResponse(
        "Bạn không có quyền cập nhật thông tin này",
        "forbidden"
      );
    }

    // Xử lý dữ liệu trước khi gửi xuống database
    const profileData = { ...data };

    // Xử lý trường birth_date
    if (profileData.birth_date === "") {
      profileData.birth_date = null;
    } else if (profileData.birth_date) {
      // Đảm bảo birth_date có định dạng đúng cho database
      try {
        // Nếu là string, chuyển sang đối tượng Date và kiểm tra tính hợp lệ
        const dateObj = new Date(profileData.birth_date);
        if (isNaN(dateObj.getTime())) {
          return createErrorResponse("Ngày sinh không hợp lệ", "invalid_data");
        }
        // Giữ nguyên định dạng chuỗi YYYY-MM-DD vì Supabase sẽ xử lý
      } catch (error) {
        return createErrorResponse("Ngày sinh không hợp lệ", "invalid_data");
      }
    }

    // Xử lý phone_number: đảm bảo rỗng khi là chuỗi trống
    if (profileData.phone_number === "") {
      profileData.phone_number = null;
    } else if (profileData.phone_number) {
      // Validate phone_number theo regex
      const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
      if (!phoneRegex.test(profileData.phone_number)) {
        return createErrorResponse(
          "Số điện thoại không hợp lệ",
          "invalid_phone"
        );
      }
    }

    // Validate display_name
    if (
      !profileData.display_name ||
      profileData.display_name.trim().length < 2
    ) {
      return createErrorResponse(
        "Tên hiển thị phải có ít nhất 2 ký tự",
        "invalid_name"
      );
    }

    // Kiểm tra xem profile có tồn tại không
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (!existingProfile) {
      return createErrorResponse(
        "Không tìm thấy thông tin người dùng",
        "not_found"
      );
    }

    // Cập nhật profile
    const { error } = await supabase
      .from("profiles")
      .update(profileData)
      .eq("id", userId);

    if (error) {
      console.error("Update profile error:", error);
      return createErrorResponse(error.message, error.code);
    }

    // Làm mới dữ liệu cho client
    revalidatePath("/tai-khoan");
    return createSuccessResponse({ message: "Cập nhật thành công" });
  } catch (error) {
    console.error("Update profile exception:", error);
    return createErrorResponse(
      error instanceof Error ? error.message : "Lỗi không xác định",
      "server_error"
    );
  }
}

export async function uploadAvatar(userId: string, file: File) {
  const supabase = await getSupabaseServerClient();

  try {
    // Lấy thông tin profile hiện tại để kiểm tra avatar_url cũ
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    if (profileError && profileError.code !== "PGRST116") {
      return createErrorResponse(profileError.message);
    }

    // Tạo đường dẫn thư mục theo user_id để tổ chức tốt hơn
    const userFolder = `user_${userId}`;

    // Tạo tên file duy nhất với timestamp để tránh trùng lặp
    const timestamp = Date.now();
    const fileExt = file.name.split(".").pop();
    const fileName = `${userFolder}/avatar_${timestamp}.${fileExt}`;

    // Upload file lên Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      return createErrorResponse(uploadError.message);
    }

    // Lấy public URL của file đã upload
    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(fileName);

    // Cập nhật avatar_url trong profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: publicUrlData.publicUrl,
      })
      .eq("id", userId);

    if (updateError) {
      return createErrorResponse(updateError.message);
    }

    // Xóa ảnh cũ nếu có và không phải ảnh mặc định
    if (
      profileData?.avatar_url &&
      !profileData.avatar_url.includes("default-avatar")
    ) {
      try {
        // Trích xuất đường dẫn file từ URL
        const oldAvatarUrl = profileData.avatar_url;
        const urlParts = oldAvatarUrl.split("avatars/");

        if (urlParts.length > 1) {
          const oldFilePath = urlParts[1];
          // Xóa file cũ
          await supabase.storage.from("avatars").remove([oldFilePath]);
        }
      } catch (deleteError) {
        console.error("Error deleting old avatar:", deleteError);
        // Không trả về lỗi vì việc xóa ảnh cũ không quan trọng bằng việc cập nhật ảnh mới
      }
    }

    revalidatePath("/tai-khoan");
    return createSuccessResponse({ avatarUrl: publicUrlData.publicUrl });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Xóa avatar: xóa file khỏi bucket avatars và cập nhật avatar_url về null trong profiles
export async function deleteAvatar(userId: string, avatarUrl: string) {
  const supabase = await getSupabaseServerClient();
  try {
    // Trích xuất đường dẫn file từ URL
    let filePath = "";
    try {
      const urlObj = new URL(avatarUrl);
      const pathParts = urlObj.pathname.split("/");
      const bucketIndex = pathParts.findIndex((part) => part === "avatars");
      if (bucketIndex !== -1) {
        filePath = pathParts.slice(bucketIndex + 1).join("/");
      }
    } catch (e) {
      // fallback: try to split by 'avatars/'
      const urlParts = avatarUrl.split("avatars/");
      if (urlParts.length > 1) filePath = urlParts[1];
    }
    if (!filePath)
      return createErrorResponse("Không xác định được file avatar để xóa");
    // Xóa file khỏi bucket
    const { error: deleteError } = await supabase.storage
      .from("avatars")
      .remove([filePath]);
    if (deleteError) return createErrorResponse(deleteError.message);
    // Cập nhật avatar_url về null trong profiles
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", userId);
    if (updateError) return createErrorResponse(updateError.message);
    revalidatePath("/tai-khoan");
    return createSuccessResponse({ success: true });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Cải thiện action đặt địa chỉ mặc định
export async function setDefaultAddress(addressId: number) {
  const supabase = await getSupabaseServerClient();

  try {
    // Lấy thông tin session để kiểm tra user_id
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return createErrorResponse(
        "Bạn cần đăng nhập để thực hiện hành động này",
        "unauthorized"
      );
    }

    const userId = session.user.id;

    // Kiểm tra xem địa chỉ có thuộc về người dùng không
    const { data: addressData, error: addressError } = await supabase
      .from("addresses")
      .select("id, is_default, recipient_name")
      .eq("id", addressId)
      .eq("user_id", userId)
      .single();

    if (addressError || !addressData) {
      return createErrorResponse(
        "Địa chỉ không tồn tại hoặc không thuộc về bạn",
        "not_found"
      );
    }

    // Nếu địa chỉ đã là mặc định, không cần làm gì
    if (addressData.is_default) {
      return createSuccessResponse({
        message: "Địa chỉ này đã là mặc định",
        addressId: addressId,
        recipientName: addressData.recipient_name,
      });
    }

    // Thực hiện transaction để đảm bảo tính nhất quán
    // 1. Đặt tất cả địa chỉ của người dùng thành không mặc định
    // 2. Đặt địa chỉ được chọn thành mặc định
    // 3. Cập nhật default_address_id trong profiles
    const { error: updateError } = await supabase.rpc("set_default_address", {
      p_address_id: addressId,
      p_user_id: userId,
    });

    // Nếu không có RPC function, sử dụng cách thủ công
    if (updateError) {
      // Bắt đầu transaction thủ công
      // 1. Đặt tất cả địa chỉ của người dùng thành không mặc định
      const { error: resetError } = await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", userId);

      if (resetError) {
        return createErrorResponse(resetError.message);
      }

      // 2. Đặt địa chỉ được chọn thành mặc định
      const { error: setDefaultError } = await supabase
        .from("addresses")
        .update({ is_default: true })
        .eq("id", addressId)
        .eq("user_id", userId);

      if (setDefaultError) {
        return createErrorResponse(setDefaultError.message);
      }

      // 3. Cập nhật default_address_id trong profiles
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({ default_address_id: addressId })
        .eq("id", userId);

      if (updateProfileError) {
        return createErrorResponse(updateProfileError.message);
      }
    }

    revalidatePath("/tai-khoan/dia-chi");
    return createSuccessResponse({
      message: "Đã đặt địa chỉ làm mặc định",
      addressId: addressId,
      recipientName: addressData.recipient_name,
    });
  } catch (error) {
    return createErrorResponse(error);
  }
}

// Cập nhật avatar_url trong profile (server action, không nhận file, chỉ nhận url)
export async function updateAvatarUrl(userId: string, avatarUrl: string) {
  const supabase = await getSupabaseServerClient();
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatarUrl })
      .eq("id", userId);
    if (error) return createErrorResponse(error.message);
    revalidatePath("/tai-khoan");
    return createSuccessResponse({ avatarUrl });
  } catch (error) {
    return createErrorResponse(error);
  }
}
