import { RequireAuthGate } from "@/src/features/auth/components/require-auth-gate.component";
import { getCurrentUserForPage } from "@/src/utils/server/get-current-user-for-page.util";
import { redirect } from "next/navigation";

export default async function WithAuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUserForPage();

  if (user === null) {
    redirect("/login");
  }

  return <RequireAuthGate>{children}</RequireAuthGate>;
}
