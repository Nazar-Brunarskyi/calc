import type { TOASTER_TYPES_ENUM } from "../enums/snackbars/snackbars.enum";

export interface ISnackbarArgs {
  type: TOASTER_TYPES_ENUM;
  message: string;
  title: string;
  icon: string;
}
