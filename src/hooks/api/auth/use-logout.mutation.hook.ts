"use client";

import type { IPostLogoutResponseDto } from "@/src/DTOs/auth/post-logout-response.dto";
import { useAppMutation } from "@/src/hooks/api/_shared/use-app-mutation.hook";
import { authQueryKeys } from "@/src/hooks/api/auth/auth.query-keys.const";
import { clearSessionAndGoToLogin } from "@/src/utils/clear-session-and-go-to-login.util";
import { fetchApiJson } from "@/src/utils/fetch-api-json.util";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

const postLogoutMutation = async (): Promise<IPostLogoutResponseDto> => {
  return await fetchApiJson<IPostLogoutResponseDto>({
    path: "/api/auth/logout",
    requestInit: { method: "POST" },
  });
};

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const { replace } = useRouter();

  return useAppMutation({
    mutationKey: authQueryKeys.logout(),
    mutationFn: postLogoutMutation,
    onSuccess: (data) => {
      if (data == null) {
        return;
      }

      clearSessionAndGoToLogin({ queryClient, replace });
    },
  });
};
