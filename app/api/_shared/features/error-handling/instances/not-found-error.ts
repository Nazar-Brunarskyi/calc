import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";

import { AppError } from "./app-error";

interface INotFoundErrorProps {
  message?: string;
  snackbar?: ISnackbarArgs;
}

export class NotFoundError extends AppError {
  constructor({ message = "Not found", snackbar }: INotFoundErrorProps = {}) {
    super({
      message,
      name: "not_found",
      statusCode: 404,
      snackbar,
    });
  }
}
