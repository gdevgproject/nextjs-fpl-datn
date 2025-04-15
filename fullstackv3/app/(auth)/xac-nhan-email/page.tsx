import { redirect } from "next/navigation";

export default function Page({
  searchParams,
}: {
  searchParams: ReadonlyURLSearchParams;
}) {
  const code = searchParams.get("code");
  if (code) {
    redirect(`/api/auth/comfirm?code=${code}`);
  }
  redirect("/kiem-tra-email");
}
