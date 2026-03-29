import { BadRequestError } from "@/app/api/_shared/features/error-handling/instances/bad-request-error";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteMiddleware } from "@/lib/http/route-middleware.type";
import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

export const withValidatedBody = <TSchema extends ZodType>(
  schema: TSchema,
): TRouteMiddleware<IRouteHandlerContext> => async (
  request: NextRequest,
  context,
  next,
) => {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    throw new BadRequestError({ message: "Invalid request" });
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new BadRequestError({ message: "Invalid request" });
  }

  context.body = parsed.data;
  return next();
};
