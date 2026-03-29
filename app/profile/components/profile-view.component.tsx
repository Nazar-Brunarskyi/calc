"use client";
import { useAuth } from "@/src/features/auth/providers/auth-provider/auth-provider.component";

export const ProfileView = () => {
  const { user } = useAuth();

  if (user === null) {
    return null;
  }

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center gap-4 p-8 font-sans">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Profile
      </h1>
      <p className="text-lg text-zinc-700 dark:text-zinc-300">
        Name: {user.username}
      </p>
    </div>
  );
};
