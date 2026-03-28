import type { NextRequest } from "next/server";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteMiddleware } from "@/lib/http/route-middleware.type";
import { connectMongoDb } from "./connect-mongodb.util";

/**
 * Route middleware: ensures Mongoose is connected before the handler runs.
 * Connection is cached globally (see `connectMongoDb`).
 */
export const withMongoDbConnection: TRouteMiddleware<
  IRouteHandlerContext
> = async (_request: NextRequest, _context: IRouteHandlerContext) => {
  await connectMongoDb();
};
