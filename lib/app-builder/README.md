# App Builder

`lib/app-builder/` provides a small chainable builder for route handlers. It lets you:

- register root methods with `addMethod()`
- group logic into nested modules with `addModule()`
- share a mutable `context` object across the whole request flow
- convert root handler errors into JSON responses with `AppBuilderError`

## Public API

Import from `@/lib/app-builder/app-builder.util`:

```ts
import { AppBuilderError, app } from "@/lib/app-builder/app-builder.util";
```

Public exports:

- `app()` creates a new builder
- `AppBuilderError` is the error class used for structured API responses

## Basic route usage

Use `app<TRequest, TContext>()` to type the incoming request and the shared context object.

```ts
import { app } from "@/lib/app-builder/app-builder.util";

interface IExampleContext {
  testing?: boolean;
  requestId?: string;
}

const exampleApp = app<Request, IExampleContext>().addMethod({
  name: "run",
  handler: ({ context, request }) => {
    context.testing = true;
    context.requestId = request.headers.get("x-request-id") ?? "missing";
  },
});

export async function GET(request: Request): Promise<Response> {
  const context: IExampleContext = {};
  const root = exampleApp({ request, context });

  return await root.run().resp();
}
```

What happens here:

- `exampleApp({ request, context })` creates a request-scoped chain root
- `root.run()` executes the registered handler
- `.resp()` returns `Response.json(context)`

## Modules

Modules are useful when you want to split a bigger flow into named areas.

```ts
import { app } from "@/lib/app-builder/app-builder.util";

interface IProfileContext {
  userId?: string;
  profileLoaded?: boolean;
}

const profileModule = app<Request, IProfileContext>().addMethod({
  name: "load",
  handler: ({ context }) => {
    context.profileLoaded = true;
  },
});

const api = app<Request, IProfileContext>()
  .addMethod({
    name: "authorize",
    handler: ({ context }) => {
      context.userId = "u1";
    },
  })
  .addModule({
    name: "profile",
    module: profileModule,
  });

export async function GET(request: Request): Promise<Response> {
  const context: IProfileContext = {};
  const root = api({ request, context });

  await root.authorize().resp();
  await root.useModule("profile").load();

  return Response.json(context);
}
```

Notes:

- root methods are available directly on `root`
- modules are entered with `root.useModule("moduleName")`
- module methods return `Promise<void>` and mutate the same shared `context`
- the name `useModule` is reserved and cannot be used as a method or module name

## Error handling

Throw `AppBuilderError` from a root handler when you want a structured JSON error response.

```ts
import { AppBuilderError, app } from "@/lib/app-builder/app-builder.util";

const api = app().addMethod({
  name: "run",
  handler: () => {
    throw new AppBuilderError({
      message: "Unauthorized",
      code: "UNAUTHORIZED",
      status: 401,
    });
  },
});
```

Calling `await api().run().resp()` returns a JSON response shaped like this:

```json
{
  "message": "Unauthorized",
  "code": "UNAUTHORIZED",
  "status": 401
}
```

If a root handler throws a regular `Error`, the builder wraps it as:

- `code: "APP_BUILDER_INTERNAL_ERROR"`
- `status: 500`

## Practical guidance

- Keep the context shape explicit with an `interface`
- Use root methods for steps that should finish with `.resp()`
- Use modules to organize feature-specific logic
- Return your own `Response` after module calls when you need a custom payload
