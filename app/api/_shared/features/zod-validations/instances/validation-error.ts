import { AppError } from "@/app/api/_shared/features/error-handling/instances/app-error";
import { APP_LEVEL_ERROR_CODES_ENUM } from "@/src/features/error-handling/enums/error-codes/app-level-error-codes.enum";
import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";
import type { IZodValidationFailure } from "@/src/features/error-handling/interfaces/zod-validation-failure.interface";
import type { ZodError } from "zod";

interface IValidationErrorProps {
  message?: string;
  snackbar?: ISnackbarArgs;
  zodError: ZodError;
}

export class ValidationError extends AppError {
  constructor({
    message = "Invalid request",
    snackbar,
    zodError,
  }: IValidationErrorProps) {
    super({
      message,
      name: "validation_error",
      statusCode: 400,
      snackbar,
      error_code: APP_LEVEL_ERROR_CODES_ENUM.DATA_VALIDATION_ERROR,
      error_context: {
        validation: {
          success: false,
          issues: zodError.issues,
        } satisfies IZodValidationFailure,
      },
    });
  }
}
