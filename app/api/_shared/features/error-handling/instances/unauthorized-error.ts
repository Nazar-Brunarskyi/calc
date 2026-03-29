import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";

import { APP_UNAUTHORIZED_ERROR_TYPES_ENUM } from "@/src/features/error-handling/enums/error-codes/app-unauthorized-error-codes.enum";
import { AppError } from "./app-error";

interface IUnauthorizedErrorProps {
  message?: string;
  snackbar?: ISnackbarArgs;
}

export class AppLevelUnauthorizedError extends AppError {
  constructor({
    message = "You are not authorized",
    snackbar,
  }: IUnauthorizedErrorProps = {}) {
    super({
      message,
      name: "app_unauthorized",
      error_code: APP_UNAUTHORIZED_ERROR_TYPES_ENUM.APP_LEVEL_UNAUTHORIZED,
      statusCode: 401,
      snackbar,
    });
  }
}
