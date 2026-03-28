# HTTP helpers

## `createRouteHandler`

Use in `app/**/route.ts` to compose **route middleware** around a handler (Express-style **onion**).

- Pass `middleware` as one function or an array. The **first** entry is the **outermost** layer: it runs first on the way in; `await next()` runs the **rest of the chain**, including inner middleware and finally the route handler.
- **`next`:** Each middleware is `(request, context, next) => …` where **`TRouteNext`** is `() => Promise<Response | NextResponse>`. Call **`return await next()`** (or `return next()` when your middleware is `async`) to continue. **`next()` must be invoked at most once** per middleware invocation (a dev-time guard throws if called twice).
- **Short-circuit:** Return a `Response` / `NextResponse` **without** calling `next` — same idea as sending a response in Express and not calling `next()`.

Shared types (import paths use the `@/` alias):

- `IRouteHandlerContext` — `@/lib/http/route-handler-context.interface` (base shape for the App Router handler `context` argument; use this name for default generics and middleware that only need optional `params`)
- `TRouteMiddleware` — `@/lib/http/route-middleware.type`
- `TRouteNext` — `@/lib/http/route-middleware.type`
- `ICreateRouteHandlerProps` — `@/lib/http/create-route-handler.util` (optional `middleware` for `createRouteHandler` and `createGlobalRouteHandler`)
- `TRouteHandler` / `TRouteHandlerReturn` — `@/lib/http/route-handler.type`
- `TWrappedRouteHandler` — `@/lib/http/wrapped-route-handler.type`

For dynamic segments, pass a narrower context (e.g. `interface ICtx { params: Promise<{ id: string }> }`) as the generic on `createRouteHandler` / `createGlobalRouteHandler` instead of `IRouteHandlerContext`.

Example:

```ts
import type { NextRequest } from "next/server";
import { createRouteHandler } from "@/lib/http/create-route-handler.util";
import { withMongoDbConnection } from "@/app/api/_shared/route-handlers/with-mongodb-connection-route-middleware.util";

export const POST = createRouteHandler(
  async (request: NextRequest) => {
    // …
    return Response.json({ ok: true });
  },
  { middleware: withMongoDbConnection },
);
```

Dynamic segment (narrow `params` in the generic or local interface):

```ts
interface ICtx {
  params: Promise<{ id: string }>;
}

export const GET = createRouteHandler<ICtx>(
  async (_req, ctx) => {
    const { id } = await ctx.params;
    return Response.json({ id });
  },
  { middleware: [withMongoDbConnection] },
);
```

## `createGlobalRouteHandler` (MongoDB preset)

When many handlers share the same first step (connect MongoDB), use **`createGlobalRouteHandler`** from `@/app/api/_shared/route-handlers/global-route-handler.util`. It is `createRouteHandler` with **`withRouteErrorHandler`** (outermost) and **`withMongoDbConnection`** always applied first; optional `middleware` from props is merged **after** those. The optional second argument uses the same **`ICreateRouteHandlerProps`** shape as `createRouteHandler` (see shared types above).

```ts
import type { NextRequest } from "next/server";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";

interface ICtx {
  params: Promise<{ id: string }>;
}

export const GET = createGlobalRouteHandler<ICtx>(async (_req, ctx) => {
  const { id } = await ctx.params;
  return Response.json({ id });
});
```

Routes that use **`createRouteHandler` only** do not get the global error wrapper unless you add **`withRouteErrorHandler`** (or similar) to their `middleware` array yourself; see `@/app/api/_shared/route-handlers/with-route-error-handler-route-middleware.util`.
