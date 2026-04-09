"use client";

import { APP_LEVEL_ERROR_CODES_ENUM } from "@/src/features/error-handling/enums/error-codes/app-level-error-codes.enum";
import { APP_UNAUTHORIZED_ERROR_TYPES_ENUM } from "@/src/features/error-handling/enums/error-codes/app-unauthorized-error-codes.enum";
import { TOASTER_TYPES_ENUM } from "@/src/features/error-handling/enums/snackbars/snackbars.enum";
import { useShowAppToast } from "@/src/features/error-handling/hooks/use-show-app-toast.hook";
import { useErrorHandler } from "@/src/hooks/api/_shared/use-error-handler.hook";
import { userQueryKeys } from "@/src/hooks/api/user/user.query-keys.const";
import { FetchApiError } from "@/src/utils/fetch-api-json.util";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export const useGlobalErrorHandlers = () => {
  const queryClient = useQueryClient();
  const { replace } = useRouter();
  const { showAppToast } = useShowAppToast();

  const { wrapFunction } = useErrorHandler({
    errorHandlers: [
      {
        error_code: APP_UNAUTHORIZED_ERROR_TYPES_ENUM.APP_LEVEL_UNAUTHORIZED,
        handler: () => {
          queryClient.setQueryData(userQueryKeys.me(), null);
          showAppToast({
            type: TOASTER_TYPES_ENUM.WARNING,
            title: "You are not authorized.",
            message: "Please sign in again.",
            icon: "",
          });
          replace("/login");
        },
      },
      {
        error_code: APP_LEVEL_ERROR_CODES_ENUM.SHOW_TOAST,
        handler: (error) => {
          if (
            error instanceof FetchApiError &&
            error.body?.snackbar !== undefined
          ) {
            showAppToast(error.body.snackbar);
            return;
          }

          showAppToast({
            type: TOASTER_TYPES_ENUM.ERROR,
            title: "Something went wrong",
            message: error.message,
            icon: "",
          });
        },
      },
    ],
  });

  return { wrapFunction };
};
