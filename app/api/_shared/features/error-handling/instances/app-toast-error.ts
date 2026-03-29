import { APP_LEVEL_ERROR_CODES_ENUM } from "@/src/features/error-handling/enums/error-codes/app-level-error-codes.enum";
import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";

import { AppError } from "./app-error";

interface IAppToastErrorProps {
  message?: string;
  snackbar: ISnackbarArgs;
}

export class AppToastError extends AppError {
  constructor({
    message = "Application message",
    snackbar,
  }: IAppToastErrorProps) {
    super({
      message,
      name: "app_toast",
      statusCode: 400,
      error_code: APP_LEVEL_ERROR_CODES_ENUM.SHOW_TOAST,
      snackbar,
    });
  }
}
