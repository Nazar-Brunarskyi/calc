This is a [Next.js](https://nextjs.org) project (App Router) using **React**, **TypeScript**, and **Tailwind CSS**.

## Documentation in this repo

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Where to put pages, shared `src/` code (`components`, `features`, `types`, `interfaces`, `constants`, `hooks`), path aliases, and **`lib/http`** route composition.
- **[COMPONENT_MAP.md](./COMPONENT_MAP.md)** — Catalog of UI building blocks; check before adding new components.
- **[lib/http/README.md](./lib/http/README.md)** — `createRouteHandler`, middleware `next()` chain, typing dynamic `params`.
- **[lib/mongodb/README.md](./lib/mongodb/README.md)** — `MONGODB_URI`, `connectMongoDb`, Mongoose models; **`withMongoDbConnection`** for routes lives under **`app/api/_shared/route-handlers/`** (see [lib/http/README.md](./lib/http/README.md)).
- **Cursor Agent** — [`.cursor/rules/`](./.cursor/rules/) (project rules), [`.cursor/agents/`](./.cursor/agents/) (subagents; e.g. **`/doc-sync`** — see [`.cursor/agents/README.md`](./.cursor/agents/README.md)), and [`.cursor/skills/`](./.cursor/skills/) (e.g. **api-app-service**, **`/sync-repository-docs`** for doc sync without a subagent). Details in [ARCHITECTURE.md](./ARCHITECTURE.md) (Cursor Agent bullet in the App Router API section).

## API routes

Example: **`GET /api/me`** returns the signed-in user (from the **`session_id`** cookie) or **401** when unauthenticated. Route handlers that need the database can use **`createGlobalRouteHandler`** from `@/app/api/_shared/route-handlers/global-route-handler.util` so **`withRouteErrorHandler`** (structured JSON errors: **`error`**, optional **`error_code`**, optional **`snackbar`**) and **`withMongoDbConnection`** run before your handler (see `app/api/me/route.ts` and [lib/http/README.md](./lib/http/README.md)).

**Google OAuth** (`/api/auth/google`, callback under `/api/auth/google/callback`): on success the app persists or updates the user, creates a row in the **`sessions`** collection, and sets an httpOnly **`session_id`** cookie (see `.env.example` for **`OAUTH_SUCCESS_REDIRECT_PATH`**). Shared cookie name: `src/constants/session-id-cookie.const.ts`.

## Getting Started

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to optimize and load [Geist](https://vercel.com/font).

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Next.js GitHub repository](https://github.com/vercel/next.js)

## Deploy on Vercel

The [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) is a common host for Next.js apps. See the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.
