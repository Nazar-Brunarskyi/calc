import { APP_UNAUTHORIZED_ERROR_TYPES_ENUM } from "./app-unauthorized-error-codes.enum";
import type { TEST_ERROR_TYPES_ENUM } from "./test-error-codes.enum";

export { TEST_ERROR_TYPES_ENUM } from "./test-error-codes.enum";

/** Returned by the global route error handler for unhandled / non-AppError failures. */
export const INTERNAL_SERVER_ERROR_CODE = "INTERNAL_SERVER_ERROR" as const;

/** Union of all API error code enums; extend with `| OtherEnum` as you add modules. */
export type APP_ERROR_CODES_TYPE =
  | TEST_ERROR_TYPES_ENUM
  | APP_UNAUTHORIZED_ERROR_TYPES_ENUM;
