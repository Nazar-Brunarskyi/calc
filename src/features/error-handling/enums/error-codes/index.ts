import { APP_LEVEL_ERROR_CODES_ENUM } from "./app-level-error-codes.enum";
import { APP_UNAUTHORIZED_ERROR_TYPES_ENUM } from "./app-unauthorized-error-codes.enum";
import { APP_UNKNOWN_ERROR_TYPES_ENUM } from "./app-unknown-error-codes.enum";

export type APP_ERROR_CODES_TYPE =
  | APP_UNAUTHORIZED_ERROR_TYPES_ENUM
  | APP_UNKNOWN_ERROR_TYPES_ENUM
  | APP_LEVEL_ERROR_CODES_ENUM;
