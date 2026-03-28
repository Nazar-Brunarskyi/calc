import { AppError } from "@/app/api/_shared/features/error-handling/instances/app-error";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteMiddleware } from "@/lib/http/route-middleware.type";
import { NextResponse } from "next/server";

export const withRouteErrorHandler: TRouteMiddleware<
  IRouteHandlerContext
> = async (_request, _context, next) => {
  try {
    return await next();
  } catch (error) {
    if (error instanceof AppError) {
      console.error("AppError:", error.message, error.stack);
    } else if (error instanceof Error) {
      console.error("Route handler error:", error.message, error.stack);
    } else {
      console.error("Route handler error:", error);
    }

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
