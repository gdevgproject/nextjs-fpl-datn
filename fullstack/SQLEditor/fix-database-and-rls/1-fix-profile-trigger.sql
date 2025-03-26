-- Kiểm tra và sửa trigger handle_new_user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Tạo lại function handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    display_name, 
    phone_number, 
    created_at, 
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'display_name', 
    NEW.raw_user_meta_data->>'phone_number', 
    NOW(), 
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tạo lại trigger
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Kiểm tra xem trigger đã được tạo chưa
SELECT tgname, tgrelid::regclass, tgtype, tgenabled
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

