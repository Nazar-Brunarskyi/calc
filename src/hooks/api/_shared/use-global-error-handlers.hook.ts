"use client";

import { APP_UNAUTHORIZED_ERROR_TYPES_ENUM } from "@/src/features/error-handling/enums/error-codes/app-unauthorized-error-codes.enum";
import { useErrorHandler } from "@/src/hooks/api/_shared/use-error-handler.hook";
import { useRouter } from "next/navigation";

export const useGlobalErrorHandlers = () => {
  const { replace } = useRouter();

  const { wrapFunction } = useErrorHandler({
    errorHandlers: [
      {
        error_code: APP_UNAUTHORIZED_ERROR_TYPES_ENUM.APP_LEVEL_UNAUTHORIZED,
        handler: () => {
          replace("/login");
        },
      },
    ],
  });

  return { wrapFunction };
};
