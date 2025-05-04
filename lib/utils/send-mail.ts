import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/lib/types/database.types";

// Lấy email gửi đi từ shop settings (giả lập, bạn có thể thay bằng truy vấn thực tế)
async function getOrderSenderEmail() {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  const { data } = await supabase
    .from("shop_settings")
    .select("order_confirmation_sender_email")
    .single();
  return (
    data?.order_confirmation_sender_email ||
    process.env.DEFAULT_ORDER_SENDER_EMAIL
  );
}

export async function sendOrderEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const senderEmail = await getOrderSenderEmail();
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  await transporter.sendMail({
    from: senderEmail,
    to,
    subject,
    html,
  });
}
