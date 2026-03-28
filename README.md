This is a [Next.js](https://nextjs.org) project (App Router) using **React**, **TypeScript**, and **Tailwind CSS**.

## Documentation in this repo

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — Where to put pages, shared `src/` code (`components`, `types`, `interfaces`, `constants`, `hooks`), path aliases, and **`lib/http`** route composition.
- **[COMPONENT_MAP.md](./COMPONENT_MAP.md)** — Catalog of UI building blocks; check before adding new components.
- **[lib/http/README.md](./lib/http/README.md)** — `createRouteHandler`, middleware `next()` chain, typing dynamic `params`.
- **[lib/mongodb/README.md](./lib/mongodb/README.md)** — `MONGODB_URI`, `connectMongoDb`, Mongoose models; **`withMongoDbConnection`** for routes lives under **`app/api/_shared/route-handlers/`** (see [lib/http/README.md](./lib/http/README.md)).

## API routes

Example: **`GET /api/users/[id]`** loads a user by id (MongoDB). Route handlers that need the database can use **`createGlobalRouteHandler`** from `@/app/api/_shared/route-handlers/global-route-handler.util` so MongoDB is connected before the handler runs (see `app/api/users/[id]/route.ts`).

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
