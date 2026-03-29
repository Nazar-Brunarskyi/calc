import type { IRedirectResponseCookie } from "@/app/api/_shared/utils/redirect-response.util";
import type { APP_ERROR_CODES_TYPE } from "@/src/features/error-handling/enums/error-codes";
import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";

import { AppError } from "../instances/app-error";

export interface IAppErrorResponseFields {
  message: string;
  statusCode: number;
  error_code?: APP_ERROR_CODES_TYPE;
  snackbar?: ISnackbarArgs;
  cookies?: IRedirectResponseCookie[];
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

/**
 * PRIVATE
 */
const isRedirectResponseCookieLike = (
  value: unknown,
): value is IRedirectResponseCookie => {
  if (!isRecord(value)) {
    return false;
  }
  return typeof value.name === "string" && typeof value.value === "string";
};

/**
 * PRIVATE
 */
const normalizeCookiesFromPlainThrownAppError = (
  cookiesFromThrownObject: unknown,
): IRedirectResponseCookie[] | undefined => {
  if (!Array.isArray(cookiesFromThrownObject)) {
    return undefined;
  }
  const cookiesMatchingRedirectShape = cookiesFromThrownObject.filter(
    isRedirectResponseCookieLike,
  );
  return cookiesMatchingRedirectShape.length > 0
    ? cookiesMatchingRedirectShape
    : undefined;
};

const getResponseFields = (error: unknown): IAppErrorResponseFields | null => {
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      error_code: error.error_code,
      snackbar: error.snackbar,
      cookies: error.cookies,
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

  const snackbarFromThrownObject = error.snackbar;
  const snackbar =
    snackbarFromThrownObject === undefined
      ? undefined
      : isSnackbarArgsLike(snackbarFromThrownObject)
        ? snackbarFromThrownObject
        : undefined;

  const cookies = normalizeCookiesFromPlainThrownAppError(error.cookies);

  return {
    message: error.message,
    statusCode: error.statusCode,
    error_code: error.error_code as APP_ERROR_CODES_TYPE | undefined,
    snackbar,
    cookies,
  };
};

export const appErrorResponseService = {
  getResponseFields,
};
