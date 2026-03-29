import type { NextRequest, NextResponse } from "next/server";
import { IRouteHandlerContext } from "./route-handler-context.interface";

/** App Router export shape after `createRouteHandler` (async; always returns a Response promise). */
export type TWrappedRouteHandler<TContext extends IRouteHandlerContext> = (
  request: NextRequest,
  context: TContext,
) => Promise<Response | NextResponse>;
