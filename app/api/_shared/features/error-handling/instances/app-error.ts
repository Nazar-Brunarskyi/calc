import type { IRedirectResponseCookie } from "@/app/api/_shared/utils/redirect-response.util";
import type { APP_ERROR_CODES_TYPE } from "@/src/features/error-handling/enums/error-codes";
import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";

interface IAppErrorProps {
  message: string;
  name?: string;
  statusCode?: number;
  error_code?: APP_ERROR_CODES_TYPE;
  snackbar?: ISnackbarArgs;
  cookies?: IRedirectResponseCookie[];
}

export class AppError extends Error {
  readonly isAppError = true;
  readonly statusCode: number;
  readonly error_code?: APP_ERROR_CODES_TYPE;
  readonly snackbar?: ISnackbarArgs;
  readonly cookies?: IRedirectResponseCookie[];

  constructor({
    message,
    name,
    statusCode = 500,
    error_code,
    snackbar,
    cookies,
  }: IAppErrorProps) {
    super(message);
    this.name = name ?? "app_error";
    this.statusCode = statusCode;
    this.error_code = error_code;
    this.snackbar = snackbar;
    this.cookies = cookies;

    Object.setPrototypeOf(this, new.target.prototype);
  }
}
