import type { NextRequest, NextResponse } from "next/server";
import type { IRouteHandlerContext } from "./route-handler-context.interface";
import type { TNextAppRouteContext } from "./next-app-route-context.type";

/** Use for route-handler generics: `TContext extends IRouteHandlerContext = IRouteHandlerContext`. */
export type TRouteHandlerReturn<TJsonBody = unknown> =
  | Response
  | NextResponse<TJsonBody>
  | Promise<Response | NextResponse<TJsonBody>>;

export type TRouteHandler<
  TContext extends IRouteHandlerContext,
  TJsonBody = unknown,
> = (
  request: NextRequest,
  context: TContext & TNextAppRouteContext,
) => TRouteHandlerReturn<TJsonBody>;
