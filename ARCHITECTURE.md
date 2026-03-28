# Application architecture

This document describes how the **calc** frontend is organized. The stack is **Next.js** (App Router), **React**, **TypeScript**, and **Tailwind CSS**.

## Component map

The repo keeps a **catalog of UI building blocks** in [COMPONENT_MAP.md](./COMPONENT_MAP.md) at the project root: component names and file paths for App Router entries, colocated route components, `components/ui/` (shadcn), and `src/components/`.

- **Before adding UI:** Check that file to see whether a suitable component already exists and can be **reused or extended** instead of duplicating.
- **When you add, rename, move, or remove** a registered component, **update `COMPONENT_MAP.md` in the same change** so it stays the source of truth.

## Project structure rules

### 1. Page-specific components

If a component is used **only on a single route**, colocate it with that page.

- Inside the route folder, add a `components` directory.
- Put all page-only components there.

**Example:**

```text
app/
  dashboard/
    page.tsx
    components/
      StatsCard.tsx
      ActivityChart.tsx
```

**Usage:**

```tsx
// app/dashboard/page.tsx
import { StatsCard } from "./components/StatsCard";

export default function DashboardPage() {
  return <StatsCard />;
}
```

### 2. Shared (global) components

If a component is **reused across routes or app-wide**, place it in a global components directory.

- Use: `src/components`
- **shadcn/ui** primitives live under `components/ui/` (see `components.json`); register them in [COMPONENT_MAP.md](./COMPONENT_MAP.md) when added.
- Typical contents: UI primitives (buttons, inputs, modals), layout shells, and other shared building blocks.

**Example:**

```text
src/
  components/
    Button/
      Button.tsx
```

**Usage:**

```tsx
import { Button } from "@/src/components/Button/Button";

export default function SomePage() {
  return <Button>Click me</Button>;
}
```

### 3. Shared `src` tree — types, interfaces, constants, and hooks

Code that is **reused across the app** but is not a React component belongs under `src/` in the folders below. Keep **route-specific** types, interfaces, constants, and hooks next to the page (e.g. `app/<route>/`) when they are not shared.

**Types vs interfaces:** These are **two separate folders**. Do not mix the concerns in one folder.

| Folder           | Purpose                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types`      | Shared definitions made with the **`type`** keyword: aliases, unions, intersections, mapped/conditional utility types, and other type-level-only constructs.  |
| `src/interfaces` | Shared declarations using the **`interface`** keyword: object shapes, contracts, and extendable API/domain shapes.                                            |
| `src/constants`  | Shared **constants** (config keys, limits, labels used in multiple places, enum-like values). Avoid dumping unrelated literals in one file as the tree grows. |
| `src/hooks`      | Shared **React hooks** (`use*` modules) used from more than one route or feature.                                                                             |

If a single concern needs both a `type` and an `interface`, use two files (one under `src/types`, one under `src/interfaces`) or split by the primary export so each file’s main exports match that folder’s rule.

**File naming (types, interfaces, and hooks):** Use **kebab-case** for the filename: words separated by hyphens, e.g. `name-name.ts` or `multi-word-name.ts`. This applies to every **type module**, **interface module**, and **hook module** (shared under `src/` and colocated next to a route). Exported symbols inside the file stay in normal TypeScript/React style (e.g. `IUserProfile`, `useMediaQuery`).

**Example layout:**

```text
src/
  components/     # shared UI (see §2)
  types/
    result.ts       # e.g. type Result<T> = ...
  interfaces/
    user-profile.ts # e.g. interface IUserProfile { ... }
  constants/
    limits.ts
  hooks/
    use-media-query.ts
```

**Usage:**

```tsx
import type { Result } from "@/src/types/result";
import type { IUserProfile } from "@/src/interfaces/user-profile";
import { MAX_ITEMS } from "@/src/constants/limits";
import { useMediaQuery } from "@/src/hooks/use-media-query";
```

### Path aliases

This project keeps the App Router at the project root (`app/`) and uses **`@/*` → `./*`** in `tsconfig.json`. Shared code under `src/` is imported with the `src/` segment in the path, for example `@/src/components/...`, `@/src/types/...`, `@/src/interfaces/...`, `@/src/constants/...`, and `@/src/hooks/...`. If you later move `app/` under `src/` (full `src/` layout), update `paths` so `@/*` still resolves correctly.

### Library docs

When a reusable library under `lib/` has non-obvious usage, keep a local `README.md` next to it and link to it from higher-level docs when relevant.

### 4. HTTP route helpers (`lib/http`)

App Router **Route Handlers** (`app/**/route.ts`) can share a small composition layer under **`lib/http/`**:

- **`createRouteHandler`** (`create-route-handler.util.ts`) wraps a handler with optional **middleware** (one function or an array). If a middleware returns a `Response` / `NextResponse`, that response is sent and the inner handler does not run; returning nothing continues the chain.
- Shared types: `IRouteHandlerContext` in `route-handler-context.interface.ts`; `TRouteMiddleware` in `route-middleware.type.ts`; `TRouteHandler` and `TRouteHandlerReturn` in `route-handler.type.ts`; `TWrappedRouteHandler` in `wrapped-route-handler.type.ts`. The base App Router `context` shape is **`IRouteHandlerContext`**. Use a **generic** on `createRouteHandler` (or a local `interface` for `context`) when the route has **dynamic segments** so `params` is typed correctly.
- **`withMongoDbConnection`** in `lib/mongodb/with-mongodb-connection-route-middleware.util.ts` is route middleware that calls `connectMongoDb()` before the handler. Pair it with `createRouteHandler`, or use the app preset below.

When **most API routes** should open MongoDB the same way, this repo also exposes **`createGlobalRouteHandler`** in `src/global-route-handler.util.ts`: it is `createRouteHandler` with `withMongoDbConnection` always first, plus optional extra middleware (e.g. auth) merged after.

Full usage and examples: [lib/http/README.md](./lib/http/README.md). MongoDB env and models: [lib/mongodb/README.md](./lib/mongodb/README.md).

### 5. App Router API — shared repositories and services (`app/api`)

Route handlers under `app/api/**/route.ts` should stay **thin**: compose HTTP (e.g. `createRouteHandler` / `createGlobalRouteHandler`) and delegate to **services** and **repositories**.

| Location                               | Role                                                                                                                                                                                                                                                                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/api/_shared/repository/<entity>/` | All **database access** for that entity used by API routes (e.g. `user.repository.ts`). Export a single **`userRepository`** (see below).                                                                                                                                                                   |
| `app/api/_shared/service/<domain>/`    | **Cross-provider** or shared API logic. Examples: OAuth redirect helpers — **`authService`** in `service/auth/auth.service.ts`; **try/catch → `null`** helpers — **`tryCatchService`** in `service/try-catch/try-catch.service.ts` (`runSync` / `runAsync`) for flows that branch on failure without `let`. |
| `app/api/auth/<provider>/service/`     | **Provider-specific** orchestration (e.g. Google callback in `google-oauth.service.ts`). Export **`googleOAuthService`**.                                                                                                                                                                                   |

**Export pattern — service/repository objects:** Do not export loose functions as the primary API. Export one **`camelCase` object** per module so call sites use a stable namespace:

```typescript
// auth.service.ts
export const authService = {
  clearOAuthStateCookie,
  buildOauthRedirect,
};

// Consumer
import { authService } from "@/app/api/_shared/service/auth/auth.service";

authService.buildOauthRedirect({ ... });
```

Use the same idea for repositories: `export const userRepository = { findUserByIdForApi, ... }` and import `{ userRepository }`.

**`tryCatchService`:** Use when a service needs **const-friendly** error handling: `tryCatchService.runSync(() => …)` returns `T | null`; `await tryCatchService.runAsync(() => …)` returns `Promise<T | null>`. Swallows any thrown value (same as an empty `catch`). For logging, side effects on failure, or discriminated errors, use an explicit `try` / `catch` instead.

**`/** PRIVATE _/`:** In `app/api/**` service and repository modules, **private** means a module-level `const` that is **not** a property on the single exported object (`userRepository`, `authService`, etc.). Put **`/\*\* PRIVATE _/`** only above those. **Do not** add descriptive `/** … \*/` blocks on helpers that **are\*\* exported via that object. Details: [.cursor/rules/general.mdc](./.cursor/rules/general.mdc) (App Router API — service and repository exports).

Implementation details (arrow functions, `I*Props`, no `any`) follow [.cursor/rules/general.mdc](./.cursor/rules/general.mdc).

**Agent Skills (Cursor):** Optional workflows live under [`.cursor/skills/`](./.cursor/skills/) — each skill is a folder with a **`SKILL.md`** (YAML frontmatter + instructions). Cursor loads them when the task matches the skill **description**. To add or refine API services/repositories in this repo, follow [api-app-service — App Router API service/repository](.cursor/skills/api-app-service/SKILL.md). For authoring _any_ new Cursor skill (structure, description rules, storage paths), open the user skill **create-skill** at `~/.cursor/skills-cursor/create-skill/SKILL.md` in your environment (bundled with Cursor; do not commit that copy into this repo).

## Rule of thumb

- **Used once?** Keep it next to the page: `app/<route>/components/` (and colocate local types, interfaces, constants, or hooks there if they are not shared).
- **Used more than once?** Move UI to `src/components`; shared **`type`**-based definitions to `src/types`; shared **`interface`** declarations to `src/interfaces`; shared constants to `src/constants`; shared hooks to `src/hooks`.

## Possible extensions

Later guidelines can cover other naming topics, data fetching, API clients, and (if added) a **NestJS** backend and how it maps to this frontend. This file focuses on placement, colocation, the shared `src/` tree, and kebab-case filenames for type, interface, and hook modules.
