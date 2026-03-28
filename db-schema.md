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

| Field      | Type     | Notes                                      |
| ---------- | -------- | ------------------------------------------ |
| `_id`      | `string` | MongoDB ObjectId; not declared on the schema paths. |
| `username` | `string` | Required, unique, trimmed.                |

Source: `lib/mongodb/schemas/user/user-schema.interface.ts`.

### Mongoose: `UserSchemaDefinition`

- **Model / registration name:** `users` (same as the MongoDB collection name).
- **Collection:** `users` (`collection: 'users'` in schema options).
- **Timestamps:** not enabled; documents only have `_id` and `username`.

Source: `lib/mongodb/schemas/user/user.schema.ts`.

Barrel re-exports: `lib/mongodb/schemas/user/index.ts` and `lib/mongodb/schemas/index.ts`.

## Usage (Next.js server code)

1. Call `connectMongoDb()` from `lib/mongodb/connect-mongodb.util.ts`.
2. Obtain the model with `getUserModel(mongoose)` from `lib/mongodb/schemas/user/get-user-model.util.ts` (or `import { getUserModel } from "DB/schemas/user"`), or use `UserSchemaDefinition` directly if you register the schema another way.

More detail and examples: `lib/mongodb/README.md`.
