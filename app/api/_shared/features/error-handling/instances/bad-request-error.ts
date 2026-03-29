import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";

import { AppError } from "./app-error";

interface IBadRequestErrorProps {
  message?: string;
  snackbar?: ISnackbarArgs;
}

export class BadRequestError extends AppError {
  constructor({ message = "Bad request", snackbar }: IBadRequestErrorProps = {}) {
    super({
      message,
      name: "bad_request",
      statusCode: 400,
      snackbar,
    });
  }
}
