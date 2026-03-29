"use client";

import { useAuthContext } from "@/src/features/auth/providers/auth-provider/auth-provider.component";
import { userQueryKeys } from "@/src/hooks/api/user/user.query-keys.const";
import { useIsFetching } from "@tanstack/react-query";

export const ProfileView = () => {
  const { user, refetchUser } = useAuthContext();
  const isFetchingMe = useIsFetching({ queryKey: userQueryKeys.me() }) > 0;

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
      <button
        type="button"
        className="rounded-lg border border-zinc-300 bg-zinc-100 px-4 py-2 text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        disabled={isFetchingMe}
        onClick={() => {
          void refetchUser();
        }}
      >
        {isFetchingMe ? "Updating…" : "Update user"}
      </button>
    </div>
  );
};
