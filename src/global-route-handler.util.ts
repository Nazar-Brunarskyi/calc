import {
  createRouteHandler,
  ICreateRouteHandlerProps,
  normalizeRouteMiddleware,
} from "@/lib/http/create-route-handler.util";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteHandler } from "@/lib/http/route-handler.type";
import type { TWrappedRouteHandler } from "@/lib/http/wrapped-route-handler.type";
import { withMongoDbConnection } from "@/lib/mongodb/with-mongodb-connection-route-middleware.util";

/**
 * Preset on top of {@link createRouteHandler}: always includes `withMongoDbConnection` first.
 * Optional `middleware` is merged after that (auth, etc.).
 */
export function createGlobalRouteHandler<
  TContext extends IRouteHandlerContext = IRouteHandlerContext
>(
  handler: TRouteHandler<TContext>,
  props?: ICreateRouteHandlerProps<TContext>
): TWrappedRouteHandler<TContext> {
  return createRouteHandler(handler, {
    middleware: [
      withMongoDbConnection,
      ...normalizeRouteMiddleware({ middleware: props?.middleware }),
    ],
  });
}
