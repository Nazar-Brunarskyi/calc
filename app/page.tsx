import { getCurrentUserForPage } from "@/src/utils/server/get-current-user-for-page.util";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getCurrentUserForPage();
  if (user === null) {
    redirect("/login");
  }
  redirect("/profile");
}
