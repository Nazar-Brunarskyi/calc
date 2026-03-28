# DB schema

This project uses **MongoDB** with **Mongoose**. Shared wiring types (e.g. `ISchemaDefinition`) live under `lib/mongodb/interfaces`; each entity’s document interface sits next to its Mongoose schema under `lib/mongodb/schemas/<entity>/`. Types and schemas are **written by hand** and kept in sync (no code generation).

**Import alias:** `DB/*` resolves to `lib/mongodb/*` (see `tsconfig.json`). Example: `import type { IUserSchema } from "DB/schemas/user"`, `import { UserSchemaDefinition } from "DB/schemas"`.

## Shared types

### `ISchemaDefinition<T>`

Defined in `lib/mongodb/interfaces/schema-definition.interface.ts`. Every entity exports a definition object:

- **`name`** — string used as the Mongoose model name (and as `ref` when you add `ObjectId` references later).
- **`schema`** — the `mongoose.Schema<T>` instance.

## Users

### Document type: `IUserSchema`

| Field       | Type      | Notes                                                |
| ----------- | --------- | ---------------------------------------------------- |
| `_id`       | `string`  | MongoDB ObjectId; not declared on the schema paths.  |
| `username`  | `string`  | Required, unique, trimmed.                           |
| `googleSub` | `string?` | Optional; Google OIDC `sub`, unique sparse when set. |
| `email`     | `string`  | Required, unique, trimmed, lowercased.               |

Source: `lib/mongodb/schemas/user/user-schema.interface.ts`.

### Mongoose: `UserSchemaDefinition`

- **Model / registration name:** `users` (same as the MongoDB collection name).
- **Collection:** `users` (`collection: 'users'` in schema options).
- **Timestamps:** not enabled.

Source: `lib/mongodb/schemas/user/user.schema.ts`.

Barrel re-exports: `lib/mongodb/schemas/user/index.ts` and `lib/mongodb/schemas/index.ts`.

## Usage (Next.js server code)

### Manual connection

1. Call `connectMongoDb()` from `lib/mongodb/connect-mongodb.util.ts`.
2. Obtain the model with `getUserModel(mongoose)` from `lib/mongodb/schemas/user/get-user-model.util.ts` (or `import { getUserModel } from "DB/schemas/user"`), or use `UserSchemaDefinition` directly if you register the schema another way.

More detail and examples: `lib/mongodb/README.md`.

### App Router API routes: `createGlobalRouteHandler`

For `app/**/route.ts` handlers that always need MongoDB, use **`createGlobalRouteHandler`** from `app/api/_shared/route-handlers/global-route-handler.util.ts`.

It wraps **`createRouteHandler`** (see `lib/http/create-route-handler.util.ts`) with an Express-style **`next`** chain: outermost **`withRouteErrorHandler`** (see `app/api/_shared/route-handlers/with-route-error-handler-route-middleware.util.ts`), then **`withMongoDbConnection`** from `app/api/_shared/route-handlers/with-mongodb-connection-route-middleware.util.ts`. That Mongo middleware **`await`s `connectMongoDb()`** and **`return next()`** so your handler runs after the connection is ready; `connectMongoDb` caches the connection globally, so repeated requests reuse the same Mongoose connection. Any extra middleware you pass in `props.middleware` runs **after** the DB middleware.

You do **not** need to call `connectMongoDb()` again inside the handler unless you have a code path that bypasses this wrapper. Use the default **`mongoose`** import with **`getUserModel(mongoose)`** (or other model getters) as usual.

**Example** (pattern used in `app/api/users/[id]/route.ts`):

```ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import mongoose from "mongoose";

import { getUserModel } from "DB/schemas";
import { createGlobalRouteHandler } from "@/app/api/_shared/route-handlers/global-route-handler.util";

interface IRouteContext {
  params: Promise<{ id: string }>;
}

export const GET = createGlobalRouteHandler<IRouteContext>(
  async (_request: NextRequest, context: IRouteContext) => {
    const { id } = await context.params;
    const User = getUserModel(mongoose);
    const doc = await User.findById(id).lean();
    if (!doc) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({
      user: { _id: String(doc._id), username: doc.username },
    });
  },
);
```

Routes that only sometimes touch the database can use **`createRouteHandler`** and attach **`withMongoDbConnection`** only when needed; see `lib/http/README.md`.
