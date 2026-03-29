import type { IApiErrorBody } from "@/src/interfaces/api-error-body.interface";

export const jsonErrorBody = ({
  error,
  error_code,
  snackbar,
}: IApiErrorBody): IApiErrorBody => {
  const body: IApiErrorBody = { error };

  if (error_code !== undefined) {
    body.error_code = error_code;
  }

  if (snackbar !== undefined) {
    body.snackbar = snackbar;
  }

  return body;
};
