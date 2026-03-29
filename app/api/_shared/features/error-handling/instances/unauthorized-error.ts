import { authService } from "@/app/api/_shared/services/auth/auth.service";
import type { IRedirectResponseCookie } from "@/app/api/_shared/utils/redirect-response.util";
import { SESSION_ID_COOKIE_NAME } from "@/src/constants/session-id-cookie.const";
import { APP_UNAUTHORIZED_ERROR_TYPES_ENUM } from "@/src/features/error-handling/enums/error-codes/app-unauthorized-error-codes.enum";
import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";
import { AppError } from "./app-error";

interface IUnauthorizedErrorProps {
  message?: string;
  snackbar?: ISnackbarArgs;
  cookies?: IRedirectResponseCookie[];
}

export class AppLevelUnauthorizedError extends AppError {
  constructor({
    message = "You are not authorized",
    snackbar,
    cookies,
  }: IUnauthorizedErrorProps = {}) {
    const sessionIdCookieClear = authService.buildSessionIdCookieClear();
    const extraCookiesWithoutSessionId =
      cookies?.filter(({ name }) => name !== SESSION_ID_COOKIE_NAME) ?? [];

    super({
      message,
      name: "app_unauthorized",
      error_code: APP_UNAUTHORIZED_ERROR_TYPES_ENUM.APP_LEVEL_UNAUTHORIZED,
      statusCode: 401,
      snackbar,
      cookies: [...extraCookiesWithoutSessionId, sessionIdCookieClear],
    });
  }
}
