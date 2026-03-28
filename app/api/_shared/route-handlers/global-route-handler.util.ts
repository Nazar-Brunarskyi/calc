import {
  createRouteHandler,
  ICreateRouteHandlerProps,
  normalizeRouteMiddleware,
} from "@/lib/http/create-route-handler.util";
import type { IRouteHandlerContext } from "@/lib/http/route-handler-context.interface";
import type { TRouteHandler } from "@/lib/http/route-handler.type";
import type { TWrappedRouteHandler } from "@/lib/http/wrapped-route-handler.type";
import { withRouteErrorHandler } from "@/app/api/_shared/route-handlers/with-route-error-handler-route-middleware.util";
import { withMongoDbConnection } from "@/app/api/_shared/route-handlers/with-mongodb-connection-route-middleware.util";

export const createGlobalRouteHandler = <
  TContext extends IRouteHandlerContext = IRouteHandlerContext,
>(
  handler: TRouteHandler<TContext>,
  props?: ICreateRouteHandlerProps<TContext>,
): TWrappedRouteHandler<TContext> =>
  createRouteHandler(handler, {
    middleware: [
      withRouteErrorHandler,
      withMongoDbConnection,
      ...normalizeRouteMiddleware({ middleware: props?.middleware }),
    ],
  });
