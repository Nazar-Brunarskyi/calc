import type { $ZodIssue } from "zod/v4/core";

export interface IZodValidationFailure {
  success: false;
  issues: $ZodIssue[];
}
