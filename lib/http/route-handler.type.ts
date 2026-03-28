import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import type { IRouteHandlerContext } from "./route-handler-context.interface";

/** Use for route-handler generics: `TContext extends IRouteHandlerContext = IRouteHandlerContext`. */
export type TRouteHandlerReturn =
  | Response
  | NextResponse
  | Promise<Response | NextResponse>;

export type TRouteHandler<TContext extends IRouteHandlerContext> = (
  request: NextRequest,
  context: TContext
) => TRouteHandlerReturn;
