# Application architecture

This document describes how the **calc** frontend is organized. The stack is **Next.js** (App Router), **React**, **TypeScript**, and **Tailwind CSS**.

## Component map

The repo keeps a **catalog of UI building blocks** in [COMPONENT_MAP.md](./COMPONENT_MAP.md) at the project root: component names and file paths for App Router entries, colocated route components, `components/ui/` (shadcn), `src/components/`, and feature UI such as `src/features/auth/components/` and `src/features/auth/providers/`.

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
      stats-card.component.tsx
      activity-chart.component.tsx
```

**Usage:**

```tsx
// app/dashboard/page.tsx
import { StatsCard } from "./components/stats-card.component";

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
    primary-button.component.tsx
```

**Usage:**

```tsx
import { PrimaryButton } from "@/src/components/primary-button.component";

export default function SomePage() {
  return <PrimaryButton>Click me</PrimaryButton>;
}
```

### 3. Shared `src` tree — types, interfaces, constants, hooks, and utils

Code that is **reused across the app** but is not a React component belongs under `src/` in the folders below. Keep **route-specific** types, interfaces, constants, and hooks next to the page (e.g. `app/<route>/`) when they are not shared.

**Types vs interfaces:** These are **two separate folders**. Do not mix the concerns in one folder.

| Folder           | Purpose                                                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/types`      | Shared definitions made with the **`type`** keyword: aliases, unions, intersections, mapped/conditional utility types, and other type-level-only constructs.  |
| `src/interfaces` | Shared declarations using the **`interface`** keyword: object shapes, contracts, and extendable API/domain shapes.                                            |
| `src/DTOs`       | Shared **`interface`** shapes for **HTTP JSON** success bodies (and request payloads when shared) used by **`app/api/**`** and client code (e.g. TanStack Query). Colocate by domain: **`src/DTOs/<domain>/`**, files **`*.dto.ts`** (e.g. **`get-me-response.dto.ts`**). Compose fields from **`src/interfaces`** and mapper output; keep **mappers** in **`app/api/_shared/mappers/`** (they map DB → **`src/interfaces`**, not route-only envelopes). |
| `src/constants`  | Shared **constants** (config keys, limits, labels used in multiple places, enum-like values). Avoid dumping unrelated literals in one file as the tree grows. |
| `src/hooks`      | Shared **React hooks** (`use*` modules) used from more than one route or feature. **TanStack Query** hooks and API-domain **query key** factories live under **`src/hooks/api/<domain>/`** when you add them. Cross-cutting API query helpers live under **`src/hooks/api/_shared/`**: **`useAppQuery`** (wraps **`useQuery`** + global error wrapping), **`useGlobalErrorHandlers`** / **`useErrorHandler`** (**`FetchApiError`** + **`error_code`** → handlers such as redirect on unauthorized). See **TanStack Query** below. |
| `src/utils`      | Shared **non-hook** helpers (pure utilities, env readers, small parsers) used from more than one place. Prefer **kebab-case** and a **`.util.ts`** suffix (see [.cursor/rules/general.mdc](./.cursor/rules/general.mdc)). **Client** HTTP helpers for TanStack **`queryFn`** / **`mutationFn`** (e.g. **`fetch-api-json.util.ts`** — **`fetchApiJson`**, **`FetchApiError`**) live here. **Server-only** utilities belong under **`src/utils/server/`** (e.g. **`get-current-user-for-page.util.ts`**). |

**`src/features/<feature>/`:** Optional **vertical slices** for app-wide code that belongs to a named product concern (not generic `src/components` / `src/utils`). Keep each feature self-contained under its folder. Use a **`providers/`** subfolder for **React context providers** (and their hooks when exported from the same module); use **`components/`** for other feature UI (gates, panels, etc.). Under **`components/`** and **`providers/`**, give **each** component or provider its **own** folder; the implementation file lives inside (e.g. **`auth-provider/auth-provider.component.tsx`**).

| Path                         | Purpose |
| ---------------------------- | ------- |
| `src/features/error-handling/` | Shared API error **enums**, **`APP_ERROR_CODES_TYPE`**, snackbar payload **`ISnackbarArgs`** (**`interfaces/snackbar-args.interface.ts`**), Zod failure shape **`IZodValidationFailure`** (**`interfaces/zod-validation-failure.interface.ts`**), and toaster variant enum **`TOASTER_TYPES_ENUM`** (**`enums/snackbars/snackbars.enum.ts`**) used with **`AppError`** / route error middleware (see §4). **Client toasts:** **`useShowAppToast`** in **`hooks/use-show-app-toast.hook.ts`** (see **Toasts (Sonner)** below). The HTTP error JSON shape **`IApiErrorBody`** is shared with the client via **`src/interfaces/api-error-body.interface.ts`** (**`jsonErrorBody`**, **`FetchApiError.body`** — **`error`**, optional **`error_code`**, **`snackbar`**, **`error_context`**). |
| `src/features/auth/`         | **`AuthProvider`** and **`useAuthContext`** in **`providers/auth-provider/auth-provider.component.tsx`** — loads **`/api/me`** with **`useMeQuery`** (**`src/hooks/api/user/use-me.query.hook.ts`**, built on **`useAppQuery`** so **`FetchApiError`** with **`APP_LEVEL_UNAUTHORIZED`** triggers client **`replace("/login")`** via **`useGlobalErrorHandlers`**), seeds the TanStack cache from server **`initialUser`** on mount and when **`initialUser`** changes (**`useEffect`** + **`queryClient.setQueryData(userQueryKeys.me(), …)`**), and exposes **`user`**, **`userLoaderState`** (**`isUserLoading`**, **`isUserFetching`**, **`isUserPending`** from **`useMeQuery`**), **`setUser`** (writes **`IUserMe | null`** to **`userQueryKeys.me()`** via **`setQueryData`**), and **`refetchUser`**; **`RequireAuthGate`** in **`components/require-auth-gate/require-auth-gate.component.tsx`**; **`withAuth`** in **`components/HOCS/with-auth/with-auth.hoc.tsx`**; **`withoutAuth`** in **`components/HOCS/without-auth/without-auth.hoc.tsx`**. The root **`app/layout.tsx`** wraps the tree with **`AuthProvider`** (passing server-resolved `initialUser`), nested inside **`QueryClientProviderComponent`** (see **`src/features/query/`**). Protected pages use **`export default withAuth(Page)`**; **`withAuth`** awaits **`getCurrentUserForPage`** from **`src/utils/server/get-current-user-for-page.util.ts`**, **`redirect("/login")`** when unauthenticated, and wraps the **page** in **`RequireAuthGate`**. Guest-only pages (e.g. login) use **`export default withoutAuth(Page)`**; **`withoutAuth`** awaits the same helper and **`redirect("/profile")`** when authenticated. Import providers from **`@/src/features/auth/providers/<name>/...`**; gates from **`@/src/features/auth/components/<name>/...`**; HOCs from **`@/src/features/auth/components/HOCS/<name>/...`**. |
| `src/features/user/`         | **`useUser`** in **`hooks/use-user.hook.ts`**: returns **`IUserMe | null`** from **`useAuthContext`**. Import from **`@/src/features/user/hooks/use-user.hook`**. |
| `src/features/query/`        | **`QueryClientProviderComponent`** in **`providers/query-client-provider.component.tsx`**: wraps the app with **`QueryClientProvider`** from **`@tanstack/react-query`**. **`ReactQueryDevtoolsLazy`** in **`components/react-query-devtools-lazy.component.tsx`** loads **React Query Devtools** via **`next/dynamic`** (no SSR) in development only. Hooks that call **`useQuery`** / **`useMutation`** live under **`src/hooks/api/<domain>/`**, not in this folder. |

If a single concern needs both a `type` and an `interface`, use two files (one under `src/types`, one under `src/interfaces`) or split by the primary export so each file’s main exports match that folder’s rule.

**File naming (types, interfaces, hooks, and utilities):** Use **kebab-case** plus a **dot-suffix** before the extension that states the module’s role — e.g. `name-name.type.ts`, `name-name.interface.ts`, `name-name.hook.ts`, `name-name.util.ts`, and **`name-name.component.tsx`** for shared React components (see [.cursor/rules/general.mdc](./.cursor/rules/general.mdc)). Colocated route-only modules follow the same idea. Exported symbols stay in normal TypeScript/React style (e.g. `IUserProfile`, `useMediaQuery`).

**Example layout:**

```text
src/
  components/     # shared UI (see §2)
  DTOs/           # shared HTTP JSON body interfaces (*.dto.ts), by domain
    me/
      get-me-response.dto.ts
  features/       # optional vertical slices: error-handling/, auth/, …
  types/
    result.type.ts       # e.g. type Result<T> = ...
  interfaces/
    user-profile.interface.ts # e.g. interface IUserProfile { ... }
  constants/
    limits.const.ts
  hooks/
    api/                    # TanStack Query: one folder per API domain (+ optional _shared/)
      _shared/
        use-app-query.hook.ts
        use-error-handler.hook.ts
        use-global-error-handlers.hook.ts
      user/
        use-me.query.hook.ts
        user.query-keys.const.ts
    use-media-query.hook.ts
  utils/
    fetch-api-json.util.ts  # browser fetch + JSON for TanStack queryFn / mutationFn
    read-required-env.util.ts
    server/                 # server-only (RSC, route handlers)
      get-current-user-for-page.util.ts
```

**Usage:**

```tsx
import type { Result } from "@/src/types/result.type";
import type { IUserProfile } from "@/src/interfaces/user-profile.interface";
import type { IGetMeResponseDto } from "@/src/DTOs/me/get-me-response.dto";
import { MAX_ITEMS } from "@/src/constants/limits.const";
import { useMediaQuery } from "@/src/hooks/use-media-query.hook";
import { readRequiredEnv } from "@/src/utils/read-required-env.util";
```

### TanStack Query

The app uses [**TanStack Query**](https://tanstack.com/query) (**`@tanstack/react-query`**) for client-side server-state against **`app/api/**`** route handlers.

- **Provider:** **`QueryClientProviderComponent`** — **`src/features/query/providers/query-client-provider.component.tsx`**. **`app/layout.tsx`** wraps **`AuthProvider`** inside it. The **`QueryClient`** is created with **`useState(() => new QueryClient(…))`** so it is not shared across requests.
- **Devtools:** **`ReactQueryDevtoolsLazy`** — **`src/features/query/components/react-query-devtools-lazy.component.tsx`** (dynamic import, development only).
- **Hooks and keys:** Put **`useQuery`** / **`useMutation`** wrappers in **`src/hooks/api/<domain>/`** using **`*.hook.ts`** (e.g. **`use-user.query.hook.ts`**, **`use-update-profile.mutation.hook.ts`**). Colocate **query key factories** in the same domain folder as **`*.query-keys.const.ts`** (exception: keys are domain-scoped, not generic **`src/constants`**).
- **Consumers:** Hooks run in **client** components (`"use client"`). Server Components stay async/RSC unless you add prefetch + hydration later.
- **Fetching:** Prefer **`fetchApiJson`** and **`FetchApiError`** from **`src/utils/fetch-api-json.util.ts`** in **`queryFn`** / **`mutationFn`** for typed JSON and **`credentials: "include"`** on **`/api/**`**. Non-OK responses throw **`FetchApiError`** with **`body`** shaped as **`IApiErrorBody`** (optional **`error_code`**, **`snackbar`**, etc.). Do not move that into **`fetchApiJson`**; keep **`fetchApiJson`** a thin transport layer. Reuse **`src/interfaces`** and **`src/DTOs`** for success bodies.
- **`useAppQuery`** (**`src/hooks/api/_shared/use-app-query.hook.ts`**): Use this instead of calling **`useQuery`** directly for **read** hooks that hit **`/api/**`**. It forwards options to **`useQuery`** with **`retry: false`** and wraps **`queryFn`** using **`useGlobalErrorHandlers().wrapFunction`**. When the inner **`queryFn`** throws **`FetchApiError`** and **`error.body.error_code`** matches a registered handler, that handler runs and the wrapped **`queryFn`** returns **`null`** (query succeeds with **`data: null`**) instead of leaving the query in **error** state. Unmatched **`FetchApiError`** and other errors still propagate.
- **`useGlobalErrorHandlers`** (**`src/hooks/api/_shared/use-global-error-handlers.hook.ts`**): Client hook that registers app-wide **`FetchApiError`** handlers via **`useErrorHandler`**. Today this includes **`APP_LEVEL_UNAUTHORIZED`** → **`router.replace("/login")`** (see **`APP_UNAUTHORIZED_ERROR_TYPES_ENUM`**). Extend this module when new **global** client reactions to **`error_code`** are needed.
- **`useErrorHandler`** (**`src/hooks/api/_shared/use-error-handler.hook.ts`**): Returns **`wrapFunction`**, which adapts a **`() => Promise<T>`** so **`FetchApiError`** with a matching **`error_code`** in **`errorHandlers`** runs the paired **`handler`** and yields **`null`**; otherwise the error rethrows. **`useGlobalErrorHandlers`** is the usual composition; use **`useErrorHandler`** directly only for localized or experimental handler lists (not duplicated in globals).
- **Example — current user:** **`useMeQuery`** (**`src/hooks/api/user/use-me.query.hook.ts`**) calls **`fetchApiJson`** for **`GET /api/me`**. On **401**, the API returns JSON with **`APP_LEVEL_UNAUTHORIZED`**; **`fetchApiJson`** throws **`FetchApiError`**; the **`useAppQuery`** wrapper runs the global handler → **`replace("/login")`** and **`null`** data. **`AuthProvider`** uses **`useMeQuery({ initialUser })`**, re-seeds **`userQueryKeys.me()`** when **`initialUser`** changes, and surfaces **`userLoaderState`** through **`useAuthContext`** so UI can distinguish initial load, background fetch, and pending states.

**Mutations:** There is no **`useAppMutation`** yet; **`mutationFn`** can still use **`fetchApiJson`**. If mutations need the same **`error_code`** → redirect (or snackbar) behavior, either call **`useGlobalErrorHandlers`**’ **`wrapFunction`** around the mutation function or add a shared mutation wrapper later.

### Front-end API error handling

Client code does not read HTTP status alone for branching; it relies on **`fetchApiJson`** throwing **`FetchApiError`** and optional **`error_code`**-driven handlers. This matches the JSON error contract produced on the server (**`withRouteErrorHandler`** / **`jsonErrorBody`** — see **§4**).

**1. Error JSON on the wire**

Failed **`/api/**`** responses are JSON objects shaped as **`IApiErrorBody`** (**`src/interfaces/api-error-body.interface.ts`**): required **`error`** (string), optional **`error_code`** (string, aligned with **`APP_ERROR_CODES_TYPE`** from **`src/features/error-handling/enums/error-codes`**), optional **`snackbar`** (**`ISnackbarArgs`** from **`src/features/error-handling/interfaces/snackbar-args.interface.ts`**). The same types are used when building responses in **`app/api`**.

**2. `fetchApiJson`**

**`src/utils/fetch-api-json.util.ts`** — **`fetchApiJson`** uses **`credentials: "include"`**. If **`!response.ok`**, it parses the body as **`IApiErrorBody`** (or falls back to a generic unknown-error shape if JSON parse fails) and throws **`FetchApiError`** with **`statusCode`** and **`body`**. Success paths return the parsed JSON typed by the caller. **`fetchApiJson`** does not catch or remap errors beyond that; all client reactions live in hooks or explicit **`try` / `catch`**.

**3. `useErrorHandler` → `wrapFunction`**

**`useErrorHandler`** (**`src/hooks/api/_shared/use-error-handler.hook.ts`**) accepts **`errorHandlers`**: **`{ error_code, handler }[]`** where **`error_code`** is **`APP_ERROR_CODES_TYPE`** and **`handler`** is **`(error: Error) => void`**.

For a wrapped async function **`() => Promise<T>`**:

- If the promise rejects with **`FetchApiError`** and **`error.body?.error_code`** is defined, the hook looks up a handler with the same **`error_code`**. If one exists, it runs **`handler(error)`** and the wrapper **resolves** with **`null`** (type becomes **`T | null`**). The rejection is **not** propagated.
- If there is no matching handler, or the error is not a **`FetchApiError`** with **`error_code`**, the error is **rethrown** unchanged.

So **`error_code`** is the discriminator for “handled globally” behavior; everything else still surfaces as a thrown error (e.g. TanStack Query **`isError`**).

**4. `useGlobalErrorHandlers`**

Registers the app-wide **`errorHandlers`** list (currently **`APP_LEVEL_UNAUTHORIZED`** → **`router.replace("/login")`**). **`useAppQuery`** always wraps **`queryFn`** with this **`wrapFunction`**, so any **`useAppQuery`**-based read that throws that **`FetchApiError`** triggers the redirect and ends with **`data: null`** instead of an error state.

**5. TanStack Query observable state**

| Outcome | Typical query state |
| ------- | ------------------- |
| Success, no throw | **`isSuccess`**, **`data`** as returned |
| **`FetchApiError`** + matched **`error_code`** | **`isSuccess`**, **`data: null`** (handler ran — e.g. navigation) |
| **`FetchApiError`** + no matching handler, or other **`Error`** | **`isError`**, **`error`** set |

**`retry: false`** on **`useAppQuery`** avoids repeating failed requests while redirects or toasts run.

**6. Mutations and one-off fetches**

**`useMutation`** does not go through **`useAppQuery`**. Wrap **`mutationFn`** with **`useGlobalErrorHandlers().wrapFunction`** (or **`useErrorHandler({ errorHandlers: [...] })`**) when you want the same **`error_code`** behavior, or use **`try` / `catch`** / **`onError`** for local handling only.

**7. Server vs browser**

**Server Components** and layout helpers (e.g. **`getCurrentUserForPage`**) use **redirects** and cookies directly — they do not use **`fetchApiJson`** or these hooks. The pipeline above applies to **client** **`fetch`** + TanStack Query (and any other caller of **`fetchApiJson`** in **`"use client"`** code).

### Toasts (Sonner)

The app uses [**Sonner**](https://sonner.emilkowal.ski/) through the shadcn **`Toaster`** wrapper under **`components/ui/sonner.tsx`**. Register new UI primitives in [COMPONENT_MAP.md](./COMPONENT_MAP.md) when you add or rename them.

- **Global host:** **`app/layout.tsx`** renders a single **`<Toaster />`** inside **`<body>`** (after **`QueryClientProviderComponent`** / **`AuthProvider`**) so any client subtree can show toasts. The layout stays a Server Component; **`Toaster`** is a client leaf.
- **Preferred API — `useShowAppToast`:** In **`"use client"`** code, call **`const { showAppToast } = useShowAppToast()`** from **`src/features/error-handling/hooks/use-show-app-toast.hook.ts`**. Pass a full **`ISnackbarArgs`** (**`type`**, **`title`**, **`message`**, **`icon`**) — the same shape as the optional **`snackbar`** field on **`IApiErrorBody`**. The hook maps **`TOASTER_TYPES_ENUM`** (**`src/features/error-handling/enums/snackbars/snackbars.enum.ts`**) to Sonner’s **`success` / `error` / `warning` / `info`** helpers and applies shared styling (semantic colors, dark mode). Use this for product snackbars so client UI matches the server error contract.
- **Raw `toast` from `sonner`:** Avoid calling **`toast(…)`** directly for user-facing app snackbars; reserve it for rare one-offs or experiments. If you add a new pattern, prefer extending **`useShowAppToast`** or the **`components/ui/sonner`** wrapper so behavior stays consistent.
- **Errors and `body.snackbar`:** **`useErrorHandler`** / **`useGlobalErrorHandlers`** do **not** automatically display **`FetchApiError.body.snackbar`**. When you want API-driven toasts, read **`error.body.snackbar`** in a **`catch`**, **`onError`**, or a dedicated handler and call **`showAppToast(snackbar)`** (after **`FetchApiError`** / shape checks).

### Path aliases

This project keeps the App Router at the project root (`app/`) and uses **`@/*` → `./*`** in `tsconfig.json`. Shared code under `src/` is imported with the `src/` segment in the path, for example `@/src/components/...`, `@/src/features/...`, `@/src/types/...`, `@/src/interfaces/...`, `@/src/DTOs/...`, `@/src/constants/...`, `@/src/hooks/...` (including **`@/src/hooks/api/...`**), and `@/src/utils/...`. **`@src/DTOs/*` → `./src/DTOs/*`** is also set so modules can import like **`@src/DTOs/me/get-me-response.dto`** (optional; **`@/src/DTOs/...`** resolves the same file via **`@/*`**). **`DB/*` → `./lib/mongodb/*`** is also configured for Mongoose schemas, models, and DB helpers without a deep `lib/mongodb` path at every call site (see [db-schema.md](./db-schema.md) and [lib/mongodb/README.md](./lib/mongodb/README.md)). If you later move `app/` under `src/` (full `src/` layout), update `paths` so `@/*` still resolves correctly.

### Library docs

When a reusable library under `lib/` has non-obvious usage, keep a local `README.md` next to it and link to it from higher-level docs when relevant.

### 4. HTTP route helpers (`lib/http`)

App Router **Route Handlers** (`app/**/route.ts`) can share a small composition layer under **`lib/http/`**:

- **`createRouteHandler`** (`create-route-handler.util.ts`) wraps a handler with optional **middleware** (one function or an array). Middleware uses an Express-style **`next`**: each function receives `(request, context, next)` and **`await next()`** runs the rest of the chain, including the route handler. Return a `Response` / `NextResponse` **without** calling `next` to short-circuit (handler never runs).
- Shared types: `IRouteHandlerContext` in `route-handler-context.interface.ts` (optional **`user`**, **`body`**, **`query`**); **`TNextAppRouteContext`** in **`next-app-route-context.type.ts`** (**`params`** from Next.js). Handlers and middleware take **`TContext & TNextAppRouteContext`**. `TRouteMiddleware` and `TRouteNext` in `route-middleware.type.ts`; `TRouteHandler` and `TRouteHandlerReturn` in `route-handler.type.ts`; `TWrappedRouteHandler` in `wrapped-route-handler.type.ts`. Intersect **`{ params: Promise<{ … }> }`** on the route generic when you need **narrow** dynamic segment types.
- **`withMongoDbConnection`** in `app/api/_shared/route-handlers/with-mongodb-connection-route-middleware.util.ts` is app-level route middleware that **`await`s `connectMongoDb()`** from `lib/mongodb/` then **`return next()`** so the handler runs with a live connection. Pair it with `createRouteHandler`, or use the app preset below.
- **Optional app middleware** (pass in **`createGlobalRouteHandler({ middleware: [ … ] })`** after the preset’s DB step): **`withAuthMiddleware`** in **`app/api/_shared/route-handlers/with-auth-route-middleware.util.ts`** sets **`context.user`** or throws **`AppLevelUnauthorizedError`**; **`withValidatedBody(schema)`** and **`withValidatedQuery(schema)`** in **`app/api/_shared/features/zod-validations/middlewares/`** parse JSON / **`searchParams`** with **Zod** and set **`context.body`** / **`context.query`** on success. On **schema** failure they throw **`ValidationError`** (see **Zod validation errors** below). If **`withValidatedBody`** cannot parse JSON (**`request.json()`** throws), it throws **`BadRequestError`** (**`"Invalid request"`**) — no Zod issues. Prefer typing **`bodySchema`** as **`ZodType<IYourRequestDto>`** with **`IYourRequestDto`** from **`src/DTOs/<domain>/*.dto.ts`**. Only one place in the chain should call **`request.json()`** (the body validator). Details and examples: [lib/http/README.md](./lib/http/README.md) (**App API route middleware**).
- **Zod validation errors (API):** **`ValidationError`** in **`app/api/_shared/features/zod-validations/instances/validation-error.ts`** extends **`AppError`**. Thrown when **`withValidatedBody`** or **`withValidatedQuery`** runs **`schema.safeParse(…)`** and **`success`** is **`false`**. The HTTP response is **400** with default body **`error: "Invalid request"`**, **`error_code: "DATA_VALIDATION_ERROR"`** (**`APP_LEVEL_ERROR_CODES_ENUM`**), and **`error_context.validation`** shaped as **`IZodValidationFailure`** (**`success: false`** plus Zod’s **`issues`** array). **`withRouteErrorHandler`** passes **`error_context`** through **`jsonErrorBody`** into **`IApiErrorBody`**, so clients that use **`fetchApiJson`** can read **`FetchApiError.body.error_context`** (narrow with **`IZodValidationFailure`** when **`error_code`** is **`DATA_VALIDATION_ERROR`**). **`ValidationError.name`** is **`validation_error`**.
- **`AppError`** in `app/api/_shared/features/error-handling/instances/app-error.ts` is a typed error class routes may throw: optional **`statusCode`** (default 500), optional **`error_code`** (`APP_ERROR_CODES_TYPE`), optional **`snackbar`** (`ISnackbarArgs` from **`src/features/error-handling/interfaces/snackbar-args.interface.ts`**), optional **`error_context`** (**`Record<string, unknown>`** — serialized when present), optional **`name`** for `Error.name` (default **`app_error`**), and readonly **`isAppError`** (`true`) for recognition. Shared error-code enums live under **`src/features/error-handling/enums/error-codes/`**; extend **`APP_ERROR_CODES_TYPE`** in `src/features/error-handling/enums/error-codes/index.ts` when you add new error-code enums.
- Convenience subclasses in the same folder: **`BadRequestError`** (`statusCode` 400, default message `"Bad request"`, `name` **`bad_request`**) and **`NotFoundError`** (404, `"Not found"`, **`not_found`**). Prefer them over raw **`AppError`** when the status is fixed at **400** or **404** so call sites stay short and consistent.
- **`appErrorResponseService`** in `app/api/_shared/features/error-handling/services/app-error-response.service.ts` exposes **`getResponseFields`**: **`AppError`** instances map directly to message, status, **`error_code`**, **`snackbar`**, and **`error_context`** as set on the instance. A **plain thrown object** is accepted only when **`isAppError === true`**, **`message`** is a string, and **`statusCode`** is a number; optional **`error_code`** is passed through as **`APP_ERROR_CODES_TYPE`**; **`snackbar`** is included only if it matches **`ISnackbarArgs`** at runtime (invalid shapes are dropped—**`AppError`** does not re-validate **`snackbar`** the same way); **`error_context`** is included only if it is a plain object at runtime (**`Record<string, unknown>`**).
- **`jsonErrorBody`** in `app/api/_shared/features/error-handling/utils/json-error-body.util.ts` builds the error JSON object as **`IApiErrorBody`** from **`src/interfaces/api-error-body.interface.ts`**: always **`error`** (string); includes **`error_code`**, **`snackbar`**, and **`error_context`** only when defined (omits those keys otherwise).
- **`withRouteErrorHandler`** in `app/api/_shared/features/error-handling/middlewares/with-route-error-handler-route-middleware.util.ts` is app-level middleware that catches failures and returns **`NextResponse.json`** via **`jsonErrorBody`**: recognized app errors use their **`message`**, HTTP status, and optional **`error_code`** / **`snackbar`** / **`error_context`**. Any other thrown **`Error`** (including subclasses other than **`AppError`**) or non-object throw gets HTTP **500** with body **`error: "Internal Server Error"`** and **`error_code: "APP_LEVEL_UNKNOWN_ERROR"`** (**`APP_UNKNOWN_ERROR_TYPES_ENUM`**, unioned into **`APP_ERROR_CODES_TYPE`** in `src/features/error-handling/enums/error-codes/index.ts`)—the raw **`Error.message`** is **not** exposed to the client. Used as the outermost layer in the preset below.

When **most API routes** should open MongoDB the same way, this repo exposes **`createGlobalRouteHandler`** in **`app/api/_shared/route-handlers/global-route-handler.util.ts`** (import **`@/app/api/_shared/route-handlers/global-route-handler.util`**): it is `createRouteHandler` with **`withRouteErrorHandler`** (outermost) and **`withMongoDbConnection`** always applied, plus optional extra middleware merged after the DB middleware (e.g. **`withAuthMiddleware`** in **`with-auth-route-middleware.util.ts`**, which resolves **`session_id`**, loads **`user`** via **`sessionRepository`** / **`userRepository`**, assigns **`context.user`**, and throws **`AppLevelUnauthorizedError`** when unauthenticated — see **`app/api/me/route.ts`** with **`IRouteHandlerContext & { user: IAppUser }`**). The **exported** handler is typed as **`TWrappedRouteHandler<IRouteHandlerContext>`**; pass a **generic** on **`createGlobalRouteHandler`** that extends **`IRouteHandlerContext`** (often an **intersection** so **`user`**, **`body`**, or **`query`** is required where middleware guarantees it).

Full usage and examples: [lib/http/README.md](./lib/http/README.md). MongoDB env and models: [lib/mongodb/README.md](./lib/mongodb/README.md).

### 5. App Router API — shared repositories, services, and mappers (`app/api`)

Route handlers under `app/api/**/route.ts` should stay **thin**: compose HTTP (e.g. `createRouteHandler` / `createGlobalRouteHandler`) and delegate to **services** and **repositories**, and use **mappers** where responses or context need shaped DTOs instead of raw persistence documents.

| Location                                | Role                                                                                                                                                                                                                                                                                                            |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `app/api/_shared/repository/<entity>/`  | All **database access** for that entity used by API routes (e.g. `user.repository.ts`, `session.repository.ts`). Export a single object such as **`userRepository`** or **`sessionRepository`** (see below).                                                                                                                                                                       |
| `app/api/_shared/mappers/`              | Pure **transformations** between persistence / schema types, API-layer shapes (`app/api/_shared/interfaces`), and shared domain shapes (`src/interfaces`). One module per concern, e.g. **`user.mapper.ts`** exporting **`userMapper`**. Add another **`<entity>.mapper.ts`** when that entity needs its own mapping; keep unrelated transforms out of the same file. Full **HTTP JSON** envelopes for routes live in **`src/DTOs/`** (compose **`src/interfaces`** fields as needed). |
| `app/api/_shared/services/<domain>/`    | **Cross-provider** or shared API logic. Examples: OAuth redirect helpers — **`authService`** in `services/auth/auth.service.ts` (**`buildOauthRedirect`** clears state and can attach **`extraCookies`**, e.g. httpOnly **`session_id`** set after **`sessionRepository.createSessionForUser`** in the Google callback); **try/catch → `null`** helpers — **`tryCatchService`** in `services/try-catch/try-catch.service.ts` (`runSync` / `runAsync`) for flows that branch on failure without `let`. |
| `app/api/_shared/interfaces/`           | **`interface`** modules for API-layer shapes that are not promoted to **`src/interfaces`** yet (or are **`app/api`-only**). Examples: **`app-user.interface.ts`** (**`IAppUser`**); **`redirect-response-cookie.interface.ts`** (**`IRedirectResponseCookie`**) for **`redirectResponse`** / **`applyCookiesToNextResponse`**. Route **`context`** optional fields (**`user`**, **`body`**, **`query`**) live on **`IRouteHandlerContext`** in **`lib/http/route-handler-context.interface.ts`**. Move to **`src/interfaces`** when shared with the client or app-wide outside **`app/api`**. |
| `app/api/_shared/utils/`                | Small route-facing helpers (e.g. **`sendResponse`** in `send-response.util.ts` — generic JSON body type, often **`src/DTOs/<domain>/*.dto.ts`**; **`redirectResponse`** in `redirect-response.util.ts` for redirects that set cookies).                                                                                                                                                                                                           |
| `app/api/auth/<provider>/_service/`    | **Provider-specific** orchestration in an underscore-prefixed folder (avoids a routable `service` segment). Example: Google in `_service/google-oauth.service.ts`. Export **`googleOAuthService`**.                                                                                                                                                                              |

**Export pattern — service/repository objects:** Do not export loose functions as the primary API. Export one **`camelCase` object** per module so call sites use a stable namespace:

```typescript
// auth.service.ts
export const authService = {
  buildOauthRedirect,
};

// Consumer
import { authService } from "@/app/api/_shared/services/auth/auth.service";

authService.buildOauthRedirect({ ... });
```

Use the same idea for repositories: `export const userRepository = { … }`, `export const sessionRepository = { … }`, and import `{ userRepository }` / `{ sessionRepository }` as needed. **Mappers** follow the same pattern: e.g. `export const userMapper = { toAppUser, toUserMe }` in `user.mapper.ts`, imported as `{ userMapper }`.

**`tryCatchService`:** Use when a service needs **const-friendly** error handling: `tryCatchService.runSync(() => …)` returns `T | null`; `await tryCatchService.runAsync(() => …)` returns `Promise<T | null>`. Swallows any thrown value (same as an empty `catch`). For logging, side effects on failure, or discriminated errors, use an explicit `try` / `catch` instead.

**`/** PRIVATE */`:** In `app/api/**` service, repository, and mapper modules, **private** means a module-level `const` that is **not** a property on the single exported object (`userRepository`, `authService`, `userMapper`, etc.). Put **`/** PRIVATE */`** only above those. **Do not** add descriptive `/** … */` blocks on helpers that **are** exported via that object. Details: [.cursor/rules/general.mdc](./.cursor/rules/general.mdc) (App Router API — service and repository exports).

Implementation details (arrow functions, `I*Props`, no `any`) follow [.cursor/rules/general.mdc](./.cursor/rules/general.mdc).

**Cursor Agent — rules, subagents, and skills:** The **Agent** (chat) loads **project rules** from [`.cursor/rules/`](./.cursor/rules/), **custom subagents** from [`.cursor/agents/`](./.cursor/agents/) ([readme](.cursor/agents/README.md)), and **skills** from [`.cursor/skills/`](./.cursor/skills/). Rules can be **always on**, **apply intelligently**, **glob-scoped**, or **@-mentioned**. Subagents are separate contexts for specialized work; invoke with **`/name`** (e.g. **`/doc-sync`**) or natural language — see [Cursor Subagents](https://cursor.com/docs/subagents). To align repo markdown and **`SKILL.md`** files with code, use subagent [doc-sync.md](.cursor/agents/doc-sync.md) (**`/doc-sync`**) — it executes the [sync-repository-docs](.cursor/skills/sync-repository-docs/SKILL.md) skill (**`/sync-repository-docs`** in the main Agent is the same workflow). Domain workflow for API services, repositories, and mappers: [api-app-service](.cursor/skills/api-app-service/SKILL.md). For authoring a **new** skill from scratch, open the user skill **create-skill** at `~/.cursor/skills-cursor/create-skill/SKILL.md` (bundled with Cursor; do not commit that copy into this repo).

## Rule of thumb

- **Used once?** Keep it next to the page: `app/<route>/components/` (and colocate local types, interfaces, constants, or hooks there if they are not shared).
- **Used more than once?** Move UI to `src/components` (or under **`src/features/<feature>/components/`** when it belongs to a named vertical — see **`src/features`** above); put **React context providers** for that feature under **`src/features/<feature>/providers/`** (see **`src/features/auth/providers/`**, **`src/features/query/providers/`** for TanStack Query); shared **`type`**-based definitions to `src/types`; shared **`interface`** declarations to `src/interfaces`; shared **HTTP JSON body** shapes (routes + client) to **`src/DTOs/<domain>/`** as **`*.dto.ts`**; shared constants to `src/constants`; shared hooks to `src/hooks` (TanStack Query **`useQuery`** / **`useMutation`** modules under **`src/hooks/api/<domain>/`**); shared non-hook helpers to `src/utils`.

## Possible extensions

Later guidelines can cover other naming topics and (if added) a **NestJS** backend and how it maps to this frontend. Client **data fetching** to **`app/api`** uses **TanStack Query** (see **TanStack Query** above). This file focuses on placement, colocation, the shared `src/` tree, **role suffixes** on filenames (`.type.ts`, `.interface.ts`, `.dto.ts`, `.hook.ts`, `.util.ts`, `.component.tsx`), and the App Router API layout under `app/api`.
