import type { NextRequest, NextResponse } from "next/server";
import type { IRouteHandlerContext } from "./route-handler-context.interface";
import type { TRouteHandlerReturn } from "./route-handler.type";

export type TRouteNext = () => Promise<Response | NextResponse>;

export type TRouteMiddleware<TContext extends IRouteHandlerContext> = (
  request: NextRequest,
  context: TContext,
  next: TRouteNext,
) => TRouteHandlerReturn;
