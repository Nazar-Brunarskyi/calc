"use client";

import type { IPostTestBodyValidationResponseDto } from "@/src/DTOs/test/post-test-body-validation.dto";
import { TOASTER_TYPES_ENUM } from "@/src/features/error-handling/enums/snackbars/snackbars.enum";
import { useShowAppToast } from "@/src/features/error-handling/hooks/use-show-app-toast.hook";
import { testQueryKeys } from "@/src/hooks/api/test/test.query-keys.const";
import { FetchApiError, fetchApiJson } from "@/src/utils/fetch-api-json.util";
import { useMutation } from "@tanstack/react-query";

interface IPostTestBodyValidationMutationVariables {
  message: string;
}

export const useTestBodyValidationMutation = () => {
  const { showAppToast } = useShowAppToast();

  return useMutation({
    mutationKey: testQueryKeys.bodyValidation(),
    mutationFn: async ({
      message,
    }: IPostTestBodyValidationMutationVariables): Promise<IPostTestBodyValidationResponseDto> => {
      return await fetchApiJson<IPostTestBodyValidationResponseDto>({
        path: "/api/test/body-validation",
        requestInit: {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        },
      });
    },
    onSuccess: (data) => {
      showAppToast({
        type: TOASTER_TYPES_ENUM.SUCCESS,
        title: "Body validation OK",
        message: `Server echoed: ${data.echoed}`,
        icon: "",
      });
    },
    onError: (error) => {
      if (error instanceof FetchApiError) {
        showAppToast({
          type: TOASTER_TYPES_ENUM.ERROR,
          title: "Body validation failed",
          message: error.body?.error ?? error.message,
          icon: "",
        });
        return;
      }

      showAppToast({
        type: TOASTER_TYPES_ENUM.ERROR,
        title: "Body validation failed",
        message: error instanceof Error ? error.message : "Unknown error",
        icon: "",
      });
    },
  });
};
