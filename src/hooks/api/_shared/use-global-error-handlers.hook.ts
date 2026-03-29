"use client";

import { APP_UNAUTHORIZED_ERROR_TYPES_ENUM } from "@/src/features/error-handling/enums/error-codes/app-unauthorized-error-codes.enum";
import { TOASTER_TYPES_ENUM } from "@/src/features/error-handling/enums/snackbars/snackbars.enum";
import { useShowAppToast } from "@/src/features/error-handling/hooks/use-show-app-toast.hook";
import { useErrorHandler } from "@/src/hooks/api/_shared/use-error-handler.hook";
import { useRouter } from "next/navigation";

export const useGlobalErrorHandlers = () => {
  const { replace } = useRouter();
  const { showAppToast } = useShowAppToast();

  const { wrapFunction } = useErrorHandler({
    errorHandlers: [
      {
        error_code: APP_UNAUTHORIZED_ERROR_TYPES_ENUM.APP_LEVEL_UNAUTHORIZED,
        handler: () => {
          showAppToast({
            type: TOASTER_TYPES_ENUM.WARNING,
            title: "You are not authorized.",
            message: "Please sign in again.",
            icon: "",
          });
          replace("/login");
        },
      },
    ],
  });

  return { wrapFunction };
};
