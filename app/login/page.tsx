import { getCurrentUserForPage } from "@/src/utils/server/get-current-user-for-page.util";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const user = await getCurrentUserForPage();
  if (user !== null) {
    redirect("/profile");
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-6 p-8 font-sans">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Login
      </h1>
      <a
        className="rounded-full border border-zinc-300 px-6 py-3 text-base font-medium text-zinc-900 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-50 dark:hover:bg-zinc-900"
        href="/api/auth/google"
      >
        Sign in with Google
      </a>
    </div>
  );
}
