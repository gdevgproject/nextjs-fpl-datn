-- Script để sửa trigger tự động tạo profile khi người dùng đăng ký
-- Tác giả: v0
-- Ngày: 23/03/2024
-- Mô tả: Script này sẽ xóa trigger cũ và tạo lại trigger mới để đảm bảo
--        thông tin người dùng được lưu đúng cách vào bảng profiles

-- Bước 1: Xóa trigger và function cũ nếu tồn tại
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Bước 2: Tạo lại function handle_new_user với logic cập nhật
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Chèn dữ liệu vào bảng profiles từ thông tin người dùng mới
  INSERT INTO public.profiles (
    id,                                      -- ID người dùng (từ auth.users)
    display_name,                            -- Tên hiển thị (từ metadata)
    phone_number,                            -- Số điện thoại (từ metadata)
    created_at,                              -- Thời gian tạo
    updated_at                               -- Thời gian cập nhật
  )
  VALUES (
    NEW.id,                                  -- Sử dụng ID từ bản ghi auth.users mới
    NEW.raw_user_meta_data->>'display_name', -- Lấy display_name từ metadata
    NEW.raw_user_meta_data->>'phone_number', -- Lấy phone_number từ metadata
    NOW(),                                   -- Thời gian hiện tại
    NOW()                                    -- Thời gian hiện tại
  );
  
  -- Trả về bản ghi NEW để tiếp tục quá trình
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Bước 3: Tạo lại trigger để kích hoạt function sau khi có người dùng mới
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Bước 4: Kiểm tra xem trigger đã được tạo thành công chưa
SELECT 
  tgname AS "Tên Trigger",
  tgrelid::regclass AS "Bảng",
  tgtype AS "Loại",
  tgenabled AS "Trạng thái"
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- Kết quả mong đợi:
-- Tên Trigger: on_auth_user_created
-- Bảng: auth.users
-- Loại: 5 (AFTER INSERT)
-- Trạng thái: O (enabled)

