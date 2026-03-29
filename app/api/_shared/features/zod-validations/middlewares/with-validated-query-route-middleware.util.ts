import { ValidationError } from "@/app/api/_shared/features/zod-validations/instances/validation-error";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteMiddleware } from "@/lib/http/route-middleware.type";
import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

export const withValidatedQuery = <TSchema extends ZodType>(
  schema: TSchema,
): TRouteMiddleware<IRouteHandlerContext> => async (
  request: NextRequest,
  context,
  next,
) => {
  const record = Object.fromEntries(request.nextUrl.searchParams.entries());
  const parsed = schema.safeParse(record);
  if (!parsed.success) {
    throw new ValidationError({ zodError: parsed.error });
  }

  context.query = parsed.data;
  return next();
};
