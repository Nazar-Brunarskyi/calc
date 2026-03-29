---
name: api-app-service
description: >-
  Adds or changes App Router API services and repositories under app/api/_shared
  and provider-specific app/api/**/_service. Covers export object pattern (authService,
  tryCatchService, userRepository, sessionRepository), thin route.ts handlers, and MongoDB via
  createGlobalRouteHandler. Use when implementing API auth flows, new OAuth providers,
  user persistence from routes, or when the user mentions app/api/_shared, _service
  folder, or repository folder for Next.js API routes.
---

# App Router API — service and repository layer

## What Cursor skills are

**Agent Skills** are folders (often under `.cursor/skills/` in a repo, or `~/.cursor/skills/` for personal use) containing a **`SKILL.md`** file: YAML **frontmatter** (`name`, `description`) plus markdown instructions. Cursor matches the **description** to the user’s task and injects the skill so the agent follows the same workflow each time. Do not put custom skills in `~/.cursor/skills-cursor/` (reserved for Cursor-built-in skills).

To **author any new skill** from scratch (folder layout, description best practices, checklists), read the user skill **create-skill** at `~/.cursor/skills-cursor/create-skill/SKILL.md`.

## When this skill applies

Use this workflow when:

- Adding a new **provider** (e.g. Telegram OAuth) next to `app/api/auth/google/`.
- Moving **DB access** out of `route.ts` into a **repository**.
- Adding **shared HTTP/auth helpers** used by multiple providers (redirects, cookies).
- Using **`tryCatchService.runSync` / `runAsync`** for const-friendly steps that map any throw to `null`.
- Refactoring existing API handlers to match the project’s **object export** pattern.

## Canonical references (read these)

| Doc / code                                                                                                                 | Why                                                                                |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [ARCHITECTURE.md](../../../ARCHITECTURE.md) §5                                                                             | Folder layout: `_shared/repository`, `_shared/services`, `_shared/utils`, `auth/<provider>/_service`. |
| [.cursor/rules/general.mdc](../../../.cursor/rules/general.mdc)                                                            | Arrow-only functions, `I*Props`, `no any`, service object exports.                 |
| [lib/http/README.md](../../../lib/http/README.md)                                                                          | `createRouteHandler`, middleware `next()`.                                         |
| [app/api/\_shared/route-handlers/global-route-handler.util.ts](../../../app/api/_shared/route-handlers/global-route-handler.util.ts) | Preset: composes `createRouteHandler` with **`withRouteErrorHandler`** + **`withMongoDbConnection`** + optional **`props.middleware`**; exported handler typed as **`TWrappedRouteHandler<IRouteHandlerContext>`** with a generic on **`createGlobalRouteHandler`** for extended **`context`** (see **`lib/http/README.md`**). |
| [app/api/\_shared/route-handlers/with-auth-route-middleware.util.ts](../../../app/api/_shared/route-handlers/with-auth-route-middleware.util.ts) | **`withAuthMiddleware`** — reads **`session_id`**, **`sessionRepository`** + **`userRepository`**, sets **`context.user`**, throws **`AppLevelUnauthorizedError`** when unauthenticated. |
| [app/api/\_shared/interfaces/authenticated-route-handler-context.interface.ts](../../../app/api/_shared/interfaces/authenticated-route-handler-context.interface.ts) | **`IAuthenticatedRouteHandlerContext`** — extends **`IRouteHandlerContext`** with **`user`** for routes that use **`withAuthMiddleware`**. |
| [app/api/\_shared/interfaces/redirect-response-cookie.interface.ts](../../../app/api/_shared/interfaces/redirect-response-cookie.interface.ts) | **`IRedirectResponseCookie`** — cookie shape for **`redirectResponse`** / **`applyCookiesToNextResponse`**. |
| [app/api/\_shared/features/error-handling/middlewares/with-route-error-handler-route-middleware.util.ts](../../../app/api/_shared/features/error-handling/middlewares/with-route-error-handler-route-middleware.util.ts) | App-level outermost error middleware: structured JSON via **`jsonErrorBody`** (`error`, optional `error_code`, optional `snackbar`); used by `createGlobalRouteHandler` and optional on manual `createRouteHandler` chains. |
| [app/api/\_shared/features/error-handling/instances/app-error.ts](../../../app/api/_shared/features/error-handling/instances/app-error.ts) | **`AppError`** — typed errors (`statusCode`, optional `error_code`, optional `snackbar`, `isAppError`); **`appErrorResponseService`** maps throws to response fields for `withRouteErrorHandler`. |
| [app/api/\_shared/features/error-handling/instances/bad-request-error.ts](../../../app/api/_shared/features/error-handling/instances/bad-request-error.ts) | **`BadRequestError`** — extends **`AppError`** with **`statusCode` 400**; optional `message` (default **`"Bad request"`**), optional **`snackbar`**. |
| [app/api/\_shared/features/error-handling/instances/not-found-error.ts](../../../app/api/_shared/features/error-handling/instances/not-found-error.ts) | **`NotFoundError`** — extends **`AppError`** with **`statusCode` 404**; optional `message` (default **`"Not found"`**), optional **`snackbar`**. |
| [app/api/\_shared/features/error-handling/instances/unauthorized-error.ts](../../../app/api/_shared/features/error-handling/instances/unauthorized-error.ts) | **`AppLevelUnauthorizedError`** — extends **`AppError`** with **`statusCode` 401**; used by **`withAuthMiddleware`** and other API auth paths. |
| [app/api/\_shared/features/error-handling/services/app-error-response.service.ts](../../../app/api/_shared/features/error-handling/services/app-error-response.service.ts) | **`appErrorResponseService.getResponseFields`** — normalizes **`AppError`** or app-error-shaped plain objects for the error middleware. |
| [app/api/\_shared/features/error-handling/utils/json-error-body.util.ts](../../../app/api/_shared/features/error-handling/utils/json-error-body.util.ts) | **`jsonErrorBody`** — builds the JSON object returned to clients on API errors. |
| [src/features/error-handling/enums/error-codes/index.ts](../../../src/features/error-handling/enums/error-codes/index.ts) | **`INTERNAL_SERVER_ERROR_CODE`**, **`APP_ERROR_CODES_TYPE`** — extend the type union when adding new error-code enums. |
| [app/api/\_shared/route-handlers/with-mongodb-connection-route-middleware.util.ts](../../../app/api/_shared/route-handlers/with-mongodb-connection-route-middleware.util.ts) | App-level `await connectMongoDb(); return next()` middleware; pair with `createRouteHandler` or use via `createGlobalRouteHandler`. |
| [app/api/\_shared/services/auth/auth.service.ts](../../../app/api/_shared/services/auth/auth.service.ts)                     | **`authService.buildOauthRedirect`** — optional **`extraCookies`** alongside cleared OAuth state cookie. |
| [app/api/\_shared/services/try-catch/try-catch.service.ts](../../../app/api/_shared/services/try-catch/try-catch.service.ts) | `tryCatchService.runSync` / `runAsync` — result or `null` if callback throws.      |
| [app/api/\_shared/repository/user/user.repository.ts](../../../app/api/_shared/repository/user/user.repository.ts)         | Example: `export const userRepository = { … }`.                                    |
| [app/api/\_shared/repository/session/session.repository.ts](../../../app/api/_shared/repository/session/session.repository.ts) | Example: `export const sessionRepository = { createSessionForUser }`; **`SESSION_MAX_AGE_SECONDS`** for cookie **`maxAge`**. |
| [app/api/\_shared/utils/redirect-response.util.ts](../../../app/api/_shared/utils/redirect-response.util.ts)                 | **`redirectResponse`** — `NextResponse.redirect` plus optional cookie sets (used by `authService` and provider flows). |
| [app/api/auth/google/\_service/google-oauth.service.ts](../../../app/api/auth/google/_service/google-oauth.service.ts)        | Example: provider orchestration + `googleOAuthService`.                            |

## Placement rules

1. **Repository** — `app/api/_shared/repository/<entity>/<entity>.repository.ts`
   - Only **Mongoose / DB** calls for that entity needed by API routes.
   - Export: `export const userRepository = { methodA, methodB }`.

2. **Shared service** — `app/api/_shared/services/<domain>/<domain>.service.ts` (e.g. `auth/auth.service.ts`, `try-catch/try-catch.service.ts`)
   - Logic **reused across providers** (redirect + cookie clearing, try/catch → `null` for uniform error branches).
   - Export: `export const authService = { … }`, `export const tryCatchService = { runSync, runAsync }`.

3. **Provider service** — `app/api/auth/<provider>/_service/<provider>-oauth.service.ts` (underscore folder keeps the segment out of the URL path)
   - **One provider’s** flow (env, tokens, profile, call repository + shared `authService` / `redirectResponse`).
   - Export: `export const googleOAuthService = { readGoogleOauthEnv, createAuthorizeGoogleRedirect, handleGoogleOAuthCallback }` (adjust names per provider).

4. **Route handler** — `app/api/**/route.ts`
   - Stay **thin**: `createRouteHandler` or `createGlobalRouteHandler`; call `<provider>Service.method(request)` or similar.
   - No business logic or direct `getUserModel` if a repository already exists for that entity.

## Implementation checklist

- [ ] **Arrow functions only** — no `function` keyword; destructure props in the signature: `const foo = ({ a, b }: IFooProps) => { … }` (not `props` + `const { … } = props`).
- [ ] **Multi-arg** → single object + **`I` + PascalCase + `Props`**.
- [ ] **Primary export** is **`export const <name>Service` or `userRepository`** with methods as properties; internal helpers stay unexported `const` arrows.
- [ ] Prefer **`tryCatchService.runSync` / `runAsync`** for steps where failure is handled the same way (e.g. redirect); use explicit **`try` / `catch`** when logging or inspecting `error`.
- [ ] **`/** PRIVATE */`:** only on module-level `const`helpers **not** listed on the exported`*Service`/`userRepository`object; **no** other descriptive`/\*_ … _/`on implementation`const`s in those modules.
- [ ] **Imports** use `@/app/api/...` paths.
- [ ] **Types**: keep `interface` in the same file until shared app-wide; then `src/interfaces` per ARCHITECTURE.
- [ ] **Update** [ARCHITECTURE.md](../../../ARCHITECTURE.md) §5 if you introduce a **new top-level pattern** or folder.
- [ ] **Error classes:** If you add **`AppError`** subclasses under **`instances/`**, update [ARCHITECTURE.md](../../../ARCHITECTURE.md) §4 (HTTP route helpers), this skill’s canonical table, and [.cursor/rules/general.mdc](../../../.cursor/rules/general.mdc) if the intentional-throw guidance should mention them.

## Example import shapes

```typescript
import { authService } from "@/app/api/_shared/services/auth/auth.service";
import { sessionRepository } from "@/app/api/_shared/repository/session/session.repository";
import { userRepository } from "@/app/api/_shared/repository/user/user.repository";
import { googleOAuthService } from "@/app/api/auth/google/_service/google-oauth.service";
```

## New OAuth provider (sketch)

1. Implement Google OAuth in `app/api/auth/google/_service/google-oauth.service.ts` (env, HTTP to Google, constants, `readGoogleOauthEnv`, `createAuthorizeGoogleRedirect`, `handleGoogleOAuthCallback` on `googleOAuthService`). The start route may use `tryCatchService.runSync(() => googleOAuthService.readGoogleOauthEnv())` and return JSON **500** when env is missing, then call `createAuthorizeGoogleRedirect`.
2. Add `app/api/auth/<provider>/callback/route.ts` (and start URL route if applicable) using `createGlobalRouteHandler` when MongoDB is required.
3. Implement `<provider>OAuthService` that calls `authService.buildOauthRedirect` (or shared helpers; optional **`extraCookies`** for session cookies), `userRepository`, and **`sessionRepository`** when issuing browser sessions; see Google’s `google-oauth.service.ts`.
4. Extend **user** / **session** schemas and repositories only if new fields or lookup keys are required; see [db-schema.md](../../../db-schema.md).
