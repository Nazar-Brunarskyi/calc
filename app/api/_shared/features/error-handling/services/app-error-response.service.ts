import type { APP_ERROR_CODES_TYPE } from "@/src/features/error-handling/enums/error-codes";
import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";

import { AppError } from "../instances/app-error";

export interface IAppErrorResponseFields {
  message: string;
  statusCode: number;
  error_code?: APP_ERROR_CODES_TYPE;
  snackbar?: ISnackbarArgs;
}

/**
 * PRIVATE
 */
const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null;
};

/**
 * PRIVATE
 */
const isSnackbarArgsLike = (value: unknown): value is ISnackbarArgs => {
  if (!isRecord(value)) {
    return false;
  }
  return (
    typeof value.message === "string" &&
    typeof value.title === "string" &&
    typeof value.icon === "string" &&
    typeof value.type === "string"
  );
};

const getResponseFields = (error: unknown): IAppErrorResponseFields | null => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      error_code: error.error_code,
      snackbar: error.snackbar,
    };
  }

  if (!isRecord(error) || error.isAppError !== true) {
    return null;
  }

  if (
    typeof error.message !== "string" ||
    typeof error.statusCode !== "number"
  ) {
    return null;
  }

  const snackbarRaw = error.snackbar;
  const snackbar =
    snackbarRaw === undefined
      ? undefined
      : isSnackbarArgsLike(snackbarRaw)
        ? snackbarRaw
        : undefined;

  return {
    message: error.message,
    statusCode: error.statusCode,
    error_code: error.error_code as APP_ERROR_CODES_TYPE | undefined,
    snackbar,
  };
};

export const appErrorResponseService = {
  getResponseFields,
};
