# MongoDB (Mongoose)

- Set `MONGODB_URI` in `.env` or `.env.local` (see `.env.example`).
- Call `connectMongoDb()` from **server-only** code before using models (Route Handlers, Server Actions, etc.).
- For App Router `route.ts` handlers, use middleware **`withMongoDbConnection`** from `@/lib/mongodb/with-mongodb-connection-route-middleware.util` (or `DB/with-mongodb-connection-route-middleware.util` via the `DB/*` alias) together with **`createRouteHandler`** from `@/lib/http/create-route-handler.util` (see [lib/http/README.md](../http/README.md)).
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
