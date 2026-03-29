import type { IApiErrorBody } from "@/src/interfaces/api-error-body.interface";

export const jsonErrorBody = ({
  error,
  error_code,
  snackbar,
  error_context,
}: IApiErrorBody): IApiErrorBody => {
  const body: IApiErrorBody = { error };

  if (error_code !== undefined) {
    body.error_code = error_code;
  }

  if (snackbar !== undefined) {
    body.snackbar = snackbar;
  }

  if (error_context !== undefined) {
    body.error_context = error_context;
  }

  return body;
};
