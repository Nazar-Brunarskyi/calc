# MongoDB (Mongoose)

- Set `MONGODB_URI` in `.env` or `.env.local` (see `.env.example`).
- Call `connectMongoDb()` from **server-only** code before using models (Route Handlers, Server Actions, etc.).
- For App Router `route.ts` handlers, use middleware **`withMongoDbConnection`** from `@/app/api/_shared/route-handlers/with-mongodb-connection-route-middleware.util` together with **`createRouteHandler`** from `@/lib/http/create-route-handler.util` (see [lib/http/README.md](../http/README.md)). That middleware **`await`s `connectMongoDb()`** then **`return next()`** so the rest of the chain (including your handler) runs after the connection is ready. The `DB/*` alias maps only to `lib/mongodb/*` (schemas, models, `connectMongoDb`); it does not include this middleware — import it from `app/api/_shared/route-handlers/` as above.
- For handlers that always need MongoDB (and the shared preset), use **`createGlobalRouteHandler`** from `@/app/api/_shared/route-handlers/global-route-handler.util` instead of wiring `withMongoDbConnection` by hand. That preset also applies **`withRouteErrorHandler`** (outermost) for consistent JSON error responses; see [lib/http/README.md](../http/README.md).
- Shared DB typings: `ISchemaDefinition` in `DB/interfaces`. Per-entity document interfaces live next to their schema (e.g. `IUserSchema` in `DB/schemas/user`). The path alias `DB/*` → `lib/mongodb/*` is set in `tsconfig.json`.
- Mongoose `Schema` instances and `UserSchemaDefinition` live under `DB/schemas`.

```ts
import { connectMongoDb } from "DB/connect-mongodb.util";
import { getUserModel } from "DB/schemas/user";

const mongoose = await connectMongoDb();
const User = getUserModel(mongoose);
const users = await User.find().lean();
```

To use the definition directly (e.g. another framework), import `UserSchemaDefinition` from `DB/schemas`.
