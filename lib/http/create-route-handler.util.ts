import type { NextResponse } from "next/server";
import type { IRouteHandlerContext } from "./route-handler-context.interface";
import type { TRouteHandler } from "./route-handler.type";
import type { TRouteMiddleware, TRouteNext } from "./route-middleware.type";
import type { TWrappedRouteHandler } from "./wrapped-route-handler.type";

export interface ICreateRouteHandlerProps<
  TContext extends IRouteHandlerContext,
> {
  middleware?:
    | TRouteMiddleware<TContext>
    | readonly TRouteMiddleware<TContext>[];
}

/** Normalizes `middleware` option: one function, an array, or undefined → a flat list. */
export const normalizeRouteMiddleware = <
  TContext extends IRouteHandlerContext,
>({
  middleware,
}: ICreateRouteHandlerProps<TContext>): readonly TRouteMiddleware<TContext>[] => {
  if (middleware === undefined) {
    return [];
  }

  if (Array.isArray(middleware)) {
    return middleware as readonly TRouteMiddleware<TContext>[];
  }

  return [middleware as TRouteMiddleware<TContext>];
};

export const createRouteHandler = <
  TContext extends IRouteHandlerContext,
  TJsonBody = unknown,
>(
  handler: TRouteHandler<TContext, TJsonBody>,
  props: ICreateRouteHandlerProps<TContext>,
): TWrappedRouteHandler<TContext> => {
  const middlewareList = normalizeRouteMiddleware({
    middleware: props.middleware,
  });

  return async (request, context) => {
    const dispatch = async (i: number): Promise<Response | NextResponse> => {
      if (i >= middlewareList.length) {
        return await Promise.resolve(handler(request, context));
      }

      const middlewareFn = middlewareList[i];
      let nextInvoked = false;

      const next: TRouteNext = async () => {
        if (nextInvoked) {
          throw new Error("Route middleware invoked next() more than once");
        }
        nextInvoked = true;
        return dispatch(i + 1);
      };

      return await Promise.resolve(middlewareFn(request, context, next));
    };

    return dispatch(0);
  };
};
