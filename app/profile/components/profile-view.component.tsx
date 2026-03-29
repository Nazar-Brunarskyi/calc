"use client";

import { useAuthContext } from "@/src/features/auth/providers/auth-provider/auth-provider.component";
import { TOASTER_TYPES_ENUM } from "@/src/features/error-handling/enums/snackbars/snackbars.enum";
import { useShowAppToast } from "@/src/features/error-handling/hooks/use-show-app-toast.hook";
import { useTestBodyValidationMutation } from "@/src/hooks/api/test/use-test-body-validation.mutation.hook";
import { userQueryKeys } from "@/src/hooks/api/user/user.query-keys.const";
import { useIsFetching } from "@tanstack/react-query";

export const ProfileView = () => {
  const { user, refetchUser } = useAuthContext();
  const { showAppToast } = useShowAppToast();
  const { mutate: postBodyValidation, isPending: isBodyValidationPending } =
    useTestBodyValidationMutation();
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
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          POST /api/test/body-validation (Zod + auth)
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            className="rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-50 dark:hover:bg-violet-950/60"
            disabled={isBodyValidationPending}
            onClick={() => {
              postBodyValidation({ message: "Hello from profile" });
            }}
          >
            {isBodyValidationPending ? "Posting…" : "Body validation (valid)"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-violet-300/80 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-950 transition hover:bg-violet-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-50 dark:hover:bg-violet-950/60"
            disabled={isBodyValidationPending}
            onClick={() => {
              postBodyValidation({ message: "" });
            }}
          >
            {isBodyValidationPending ? "Posting…" : "Body validation (invalid)"}
          </button>
        </div>
      </div>
      <div className="flex max-w-md flex-wrap justify-center gap-2">
        <button
          type="button"
          className="rounded-lg border border-emerald-300/80 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950 transition hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-50 dark:hover:bg-emerald-950/60"
          onClick={() => {
            showAppToast({
              type: TOASTER_TYPES_ENUM.SUCCESS,
              title: "Success",
              message: "This is a success-style app toast.",
              icon: "",
            });
          }}
        >
          Toast: success
        </button>
        <button
          type="button"
          className="rounded-lg border border-red-300/80 bg-red-50 px-3 py-2 text-sm font-medium text-red-950 transition hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-50 dark:hover:bg-red-950/60"
          onClick={() => {
            showAppToast({
              type: TOASTER_TYPES_ENUM.ERROR,
              title: "Error",
              message: "This is an error-style app toast.",
              icon: "",
            });
          }}
        >
          Toast: error
        </button>
        <button
          type="button"
          className="rounded-lg border border-amber-300/80 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-950 transition hover:bg-amber-100 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-50 dark:hover:bg-amber-950/60"
          onClick={() => {
            showAppToast({
              type: TOASTER_TYPES_ENUM.WARNING,
              title: "Warning",
              message: "This is a warning-style app toast.",
              icon: "",
            });
          }}
        >
          Toast: warning
        </button>
        <button
          type="button"
          className="rounded-lg border border-sky-300/80 bg-sky-50 px-3 py-2 text-sm font-medium text-sky-950 transition hover:bg-sky-100 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-50 dark:hover:bg-sky-950/60"
          onClick={() => {
            showAppToast({
              type: TOASTER_TYPES_ENUM.INFO,
              title: "Info",
              message: "This is an info-style app toast.",
              icon: "",
            });
          }}
        >
          Toast: info
        </button>
      </div>
    </div>
  );
};
