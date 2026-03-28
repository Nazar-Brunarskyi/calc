import type { IRouteHandlerContext } from "./route-handler-context.interface";
import type { TRouteHandler } from "./route-handler.type";
import type { TRouteMiddleware } from "./route-middleware.type";
import type { TWrappedRouteHandler } from "./wrapped-route-handler.type";

export interface ICreateRouteHandlerProps<
  TContext extends IRouteHandlerContext,
> {
  middleware?:
    | TRouteMiddleware<TContext>
    | readonly TRouteMiddleware<TContext>[];
}

/** Normalizes `middleware` option: one function, an array, or undefined → a flat list. */
export function normalizeRouteMiddleware<
  TContext extends IRouteHandlerContext,
>({
  middleware,
}: ICreateRouteHandlerProps<TContext>): readonly TRouteMiddleware<TContext>[] {
  if (middleware === undefined) {
    return [];
  }

  if (Array.isArray(middleware)) {
    return middleware as readonly TRouteMiddleware<TContext>[];
  }

  return [middleware as TRouteMiddleware<TContext>];
}

export function createRouteHandler<TContext extends IRouteHandlerContext>(
  handler: TRouteHandler<TContext>,
  props: ICreateRouteHandlerProps<TContext>,
): TWrappedRouteHandler<TContext> {
  const middlewareList = normalizeRouteMiddleware({
    middleware: props.middleware,
  });

  return async (request, context) => {
    for (const middleware of middlewareList) {
      const step = await middleware(request, context);
      if (step !== undefined && step !== null) {
        return step;
      }
    }
    return handler(request, context);
  };
}
