import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteMiddleware } from "@/lib/http/route-middleware.type";
import type { NextRequest } from "next/server";
import { connectMongoDb } from "@/lib/mongodb/connect-mongodb.util";

/**
 * Route middleware: ensures Mongoose is connected before the rest of the chain runs.
 * Connection is cached globally (see `connectMongoDb`).
 */
export const withMongoDbConnection: TRouteMiddleware<
  IRouteHandlerContext
> = async (_request: NextRequest, _context: IRouteHandlerContext, next) => {
  await connectMongoDb();
  return next();
};
