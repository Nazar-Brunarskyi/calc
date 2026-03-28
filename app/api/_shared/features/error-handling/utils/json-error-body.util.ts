import type { ISnackbarArgs } from "@/src/features/error-handling/interfaces/snackbar-args.interface";

export interface IJsonErrorBodyProps {
  error: string;
  error_code?: string;
  snackbar?: ISnackbarArgs;
}

export const jsonErrorBody = ({
  error,
  error_code,
  snackbar,
}: IJsonErrorBodyProps) => {
  const body: {
    error: string;
    error_code?: string;
    snackbar?: ISnackbarArgs;
  } = { error };

  if (error_code !== undefined) {
    body.error_code = error_code;
  }

  if (snackbar !== undefined) {
    body.snackbar = snackbar;
  }

  return body;
};
