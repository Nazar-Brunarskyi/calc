import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";

/** JSON body shape for API error responses (`jsonErrorBody` / `FetchApiError.body`). */
export interface IApiErrorBody {
  error: string;
  error_code?: string;
  snackbar?: ISnackbarArgs;
  error_context?: Record<string, unknown>;
}
