"use client";

import type { IPostLogoutResponseDto } from "@/src/DTOs/auth/post-logout-response.dto";
import { TOASTER_TYPES_ENUM } from "@/src/features/error-handling/enums/snackbars/snackbars.enum";
import { useShowAppToast } from "@/src/features/error-handling/hooks/use-show-app-toast.hook";
import { authQueryKeys } from "@/src/hooks/api/auth/auth.query-keys.const";
import { clearSessionAndGoToLogin } from "@/src/utils/clear-session-and-go-to-login.util";
import { FetchApiError, fetchApiJson } from "@/src/utils/fetch-api-json.util";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const { replace } = useRouter();
  const { showAppToast } = useShowAppToast();

  return useMutation({
    mutationKey: authQueryKeys.logout(),
    mutationFn: async (): Promise<IPostLogoutResponseDto> => {
      return await fetchApiJson<IPostLogoutResponseDto>({
        path: "/api/auth/logout",
        requestInit: { method: "POST" },
      });
    },
    onSuccess: () => {
      clearSessionAndGoToLogin({ queryClient, replace });
    },
    onError: (error) => {
      if (error instanceof FetchApiError && error.statusCode === 401) {
        clearSessionAndGoToLogin({ queryClient, replace });
        return;
      }

      if (error instanceof FetchApiError) {
        showAppToast({
          type: TOASTER_TYPES_ENUM.ERROR,
          title: "Sign out failed",
          message: error.body?.error ?? error.message,
          icon: "",
        });
        return;
      }

      showAppToast({
        type: TOASTER_TYPES_ENUM.ERROR,
        title: "Sign out failed",
        message: error instanceof Error ? error.message : "Unknown error",
        icon: "",
      });
    },
  });
};
