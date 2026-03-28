import { NextResponse } from "next/server";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteMiddleware } from "@/lib/http/route-middleware.type";

export const withRouteErrorHandler: TRouteMiddleware<IRouteHandlerContext> = async (
  _request,
  _context,
  next,
) => {
  try {
    return await next();
  } catch (error) {
    console.error("Route handler error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};
