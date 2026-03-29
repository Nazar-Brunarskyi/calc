import { SNACKBARS_ENUM } from "../enums/snackbars/snackbars.enum";

export interface ISnackbarArgs {
  type: SNACKBARS_ENUM;
  message: string;
  title: string;
  icon: string;
}
