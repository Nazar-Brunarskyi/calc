# HTTP helpers

## `createRouteHandler`

Use in `app/**/route.ts` to compose **route middleware** around a handler.

- Pass `middleware` as one function or an array; each runs in order.
- If middleware returns a `Response` / `NextResponse`, that response is sent and the handler is skipped.
- Returning nothing (`void`) continues to the next middleware, then the handler.

Shared types (import paths use the `@/` alias):

- `IRouteHandlerContext` — `@/lib/http/route-handler-context.interface` (base shape for the App Router handler `context` argument; use this name for default generics and middleware that only need optional `params`)
- `TRouteMiddleware` — `@/lib/http/route-middleware.type`
- `ICreateRouteHandlerProps` — `@/lib/http/create-route-handler.util` (optional `middleware` for `createRouteHandler` and `createGlobalRouteHandler`)
- `TRouteHandler` / `TRouteHandlerReturn` — `@/lib/http/route-handler.type`
- `TWrappedRouteHandler` — `@/lib/http/wrapped-route-handler.type`

For dynamic segments, pass a narrower context (e.g. `interface ICtx { params: Promise<{ id: string }> }`) as the generic on `createRouteHandler` / `createGlobalRouteHandler` instead of `IRouteHandlerContext`.

Example:

```ts
import type { NextRequest } from "next/server";
import { createRouteHandler } from "@/lib/http/create-route-handler.util";
import { withMongoDbConnection } from "@/lib/mongodb/with-mongodb-connection-route-middleware.util";

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

When many handlers share the same first step (connect MongoDB), use **`createGlobalRouteHandler`** from `@/src/global-route-handler.util`. It is `createRouteHandler` with `withMongoDbConnection` always first; optional `middleware` runs after that. The optional second argument uses the same **`ICreateRouteHandlerProps`** shape as `createRouteHandler` (see shared types above).

```ts
import type { NextRequest } from "next/server";
import { createGlobalRouteHandler } from "@/src/global-route-handler.util";

interface ICtx {
  params: Promise<{ id: string }>;
}

export const GET = createGlobalRouteHandler<ICtx>(async (_req, ctx) => {
  const { id } = await ctx.params;
  return Response.json({ id });
});
```
