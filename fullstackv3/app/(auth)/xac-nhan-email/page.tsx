import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const params = await searchParams;
  if (params.code) {
    redirect(`/api/auth/comfirm?code=${params.code}`);
  }
  redirect("/kiem-tra-email");
}
