import type { NextRequest, NextResponse } from "next/server";
import type { IRouteHandlerContext } from "./route-handler-context.interface";

export type TRouteMiddlewareResult =
  | void
  | undefined
  | Response
  | NextResponse
  | Promise<void | undefined | Response | NextResponse>;

export type TRouteMiddleware<TContext extends IRouteHandlerContext> = (
  request: NextRequest,
  context: TContext,
) => TRouteMiddlewareResult;
