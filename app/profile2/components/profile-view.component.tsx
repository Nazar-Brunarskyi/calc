"use client";

import Link from "next/link";
import { useAuth } from "@/src/features/auth/providers/auth-provider.component";

export const ProfileView = () => {
  const { user } = useAuth();

  if (user === null) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 p-8 font-sans">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Profile 2
      </h1>
      <p className="text-lg text-zinc-700 dark:text-zinc-300">
        Name: {user.username}
      </p>
      <Link
        className="text-base font-medium text-zinc-700 underline-offset-4 transition-colors hover:text-zinc-900 hover:underline dark:text-zinc-300 dark:hover:text-zinc-50"
        href="/profile"
      >
        Go to Profile
      </Link>
    </div>
  );
};
