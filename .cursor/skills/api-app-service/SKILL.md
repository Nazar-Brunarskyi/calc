---
name: api-app-service
description: >-
  Adds or changes App Router API services, repositories, and mappers under app/api/_shared
  and provider-specific app/api/**/_service. Covers export object pattern (authService,
  tryCatchService, userRepository, sessionRepository, userMapper), thin route.ts handlers, MongoDB via
  createGlobalRouteHandler, and route middleware (withAuthMiddleware, withValidatedBody, withValidatedQuery).
  Use when implementing API auth flows, new OAuth providers, user persistence from routes, shaping DB documents
  to DTOs (mappers, userMapper), Zod body/query validation on routes, or when the user mentions
  app/api/_shared, _service folder, repository folder, mappers, or route middleware for Next.js API routes.
---

# App Router API — services, repositories, and mappers

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
- Shaping **Mongoose / DB documents** into DTOs or API-layer types — add or extend **`*.mapper.ts`** under **`app/api/_shared/mappers/`**.
- Adding **Zod** validation on **JSON body** or **query** via **`withValidatedBody`** / **`withValidatedQuery`** on **`createGlobalRouteHandler`**.

## Canonical references (read these)

| Doc / code                                                                                                                 | Why                                                                                |
| -------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| [ARCHITECTURE.md](../../../ARCHITECTURE.md) §5                                                                             | Folder layout: `_shared/repository`, `_shared/mappers`, `_shared/services`, `_shared/features/auth`, `_shared/utils`, `auth/<provider>/_service`. |
| [.cursor/rules/general.mdc](../../../.cursor/rules/general.mdc)                                                            | Arrow-only functions, `I*Props`, `no any`, service / repository / mapper object exports.                 |
| [lib/http/README.md](../../../lib/http/README.md)                                                                          | `createRouteHandler`, middleware **`next()`**, **`createGlobalRouteHandler`** order, **App API route middleware** (auth, Zod body/query). |
| [app/api/\_shared/route-handlers/global-route-handler.util.ts](../../../app/api/_shared/route-handlers/global-route-handler.util.ts) | Preset: composes `createRouteHandler` with **`withRouteErrorHandler`** + **`withMongoDbConnection`** + optional **`props.middleware`**; exported handler typed as **`TWrappedRouteHandler<IRouteHandlerContext>`** with a generic on **`createGlobalRouteHandler`** for extended **`context`** (see **`lib/http/README.md`**). |
| [app/api/\_shared/route-handlers/with-auth-route-middleware.util.ts](../../../app/api/_shared/route-handlers/with-auth-route-middleware.util.ts) | **`withAuthMiddleware`** — reads **`session_id`**, **`sessionRepository`** + **`userRepository`**, sets **`context.user`**, throws **`AppLevelUnauthorizedError`** when unauthenticated. |
| [app/api/\_shared/features/zod-validations/middlewares/with-validated-body-route-middleware.util.ts](../../../app/api/_shared/features/zod-validations/middlewares/with-validated-body-route-middleware.util.ts) | **`withValidatedBody(schema)`** — **`request.json()`** then Zod **`safeParse`** → **`context.body`**; Zod failure → **`ValidationError`** (**`DATA_VALIDATION_ERROR`**, **`error_context.validation`**); invalid JSON → **`BadRequestError`** (**`"Invalid request"`**). |
| [app/api/\_shared/features/zod-validations/middlewares/with-validated-query-route-middleware.util.ts](../../../app/api/_shared/features/zod-validations/middlewares/with-validated-query-route-middleware.util.ts) | **`withValidatedQuery(schema)`** — Zod on **`searchParams`** → **`context.query`**; Zod failure → **`ValidationError`** (same **`error_code`** / **`error_context`** as body). |
| [app/api/\_shared/features/zod-validations/instances/validation-error.ts](../../../app/api/_shared/features/zod-validations/instances/validation-error.ts) | **`ValidationError`** — extends **`AppError`**, **400**, **`validation_error`**, **`DATA_VALIDATION_ERROR`**, **`IZodValidationFailure`** under **`error_context.validation`**. |
| [lib/http/route-handler-context.interface.ts](../../../lib/http/route-handler-context.interface.ts) | **`IRouteHandlerContext`** — optional **`user`**, **`body`**, **`query`**; use **`IRouteHandlerContext & { user: IAppUser }`** (etc.) when middleware guarantees a field. |
| [app/api/\_shared/interfaces/redirect-response-cookie.interface.ts](../../../app/api/_shared/interfaces/redirect-response-cookie.interface.ts) | **`IRedirectResponseCookie`** — cookie shape for **`redirectResponse`** / **`applyCookiesToNextResponse`**. |
| [app/api/\_shared/features/error-handling/middlewares/with-route-error-handler-route-middleware.util.ts](../../../app/api/_shared/features/error-handling/middlewares/with-route-error-handler-route-middleware.util.ts) | App-level outermost error middleware: structured JSON via **`jsonErrorBody`** (`error`, optional `error_code`, `snackbar`, `error_context`); used by `createGlobalRouteHandler` and optional on manual `createRouteHandler` chains. |
| [app/api/\_shared/features/error-handling/instances/app-error.ts](../../../app/api/_shared/features/error-handling/instances/app-error.ts) | **`AppError`** — typed errors (`statusCode`, optional `error_code`, optional `snackbar`, optional `error_context`, `isAppError`); **`appErrorResponseService`** maps throws to response fields for `withRouteErrorHandler`. |
| [app/api/\_shared/features/error-handling/instances/bad-request-error.ts](../../../app/api/_shared/features/error-handling/instances/bad-request-error.ts) | **`BadRequestError`** — extends **`AppError`** with **`statusCode` 400**; optional `message` (default **`"Bad request"`**), optional **`snackbar`**. |
| [app/api/\_shared/features/error-handling/instances/not-found-error.ts](../../../app/api/_shared/features/error-handling/instances/not-found-error.ts) | **`NotFoundError`** — extends **`AppError`** with **`statusCode` 404**; optional `message` (default **`"Not found"`**), optional **`snackbar`**. |
| [app/api/\_shared/features/error-handling/instances/unauthorized-error.ts](../../../app/api/_shared/features/error-handling/instances/unauthorized-error.ts) | **`AppLevelUnauthorizedError`** — extends **`AppError`** with **`statusCode` 401**; used by **`withAuthMiddleware`** and other API auth paths. |
| [app/api/\_shared/features/error-handling/services/app-error-response.service.ts](../../../app/api/_shared/features/error-handling/services/app-error-response.service.ts) | **`appErrorResponseService.getResponseFields`** — normalizes **`AppError`** or app-error-shaped plain objects for the error middleware. |
| [app/api/\_shared/features/error-handling/utils/json-error-body.util.ts](../../../app/api/_shared/features/error-handling/utils/json-error-body.util.ts) | **`jsonErrorBody`** — builds **`IApiErrorBody`** (see **`src/interfaces/api-error-body.interface.ts`**) returned to clients on API errors. |
| [src/interfaces/api-error-body.interface.ts](../../../src/interfaces/api-error-body.interface.ts) | **`IApiErrorBody`** — shared **`error`**, optional **`error_code`**, **`snackbar`**, **`error_context`** for **`jsonErrorBody`** and client **`FetchApiError`**. |
| [src/features/error-handling/interfaces/zod-validation-failure.interface.ts](../../../src/features/error-handling/interfaces/zod-validation-failure.interface.ts) | **`IZodValidationFailure`** — **`success: false`** + Zod **`issues`**; nested under **`error_context.validation`** for **`ValidationError`**. |
| [src/features/error-handling/enums/error-codes/index.ts](../../../src/features/error-handling/enums/error-codes/index.ts) | **`APP_ERROR_CODES_TYPE`** — union of API error-code enums; extend when adding **`*.enum.ts`** modules under **`error-codes/`**. **`APP_UNKNOWN_ERROR_TYPES_ENUM`** supplies **`APP_LEVEL_UNKNOWN_ERROR`** for generic **500** responses from **`withRouteErrorHandler`**. |
| [app/api/\_shared/route-handlers/with-mongodb-connection-route-middleware.util.ts](../../../app/api/_shared/route-handlers/with-mongodb-connection-route-middleware.util.ts) | App-level `await connectMongoDb(); return next()` middleware; pair with `createRouteHandler` or use via `createGlobalRouteHandler`. |
| [app/api/\_shared/features/auth/services/auth.service.ts](../../../app/api/_shared/features/auth/services/auth.service.ts)                     | **`authService.buildOauthRedirect`** — optional **`extraCookies`** alongside cleared OAuth state cookie; **`buildSessionIdCookieClear`**. |
| [app/api/\_shared/services/try-catch/try-catch.service.ts](../../../app/api/_shared/services/try-catch/try-catch.service.ts) | `tryCatchService.runSync` / `runAsync` — result or `null` if callback throws.      |
| [app/api/\_shared/repository/user/user.repository.ts](../../../app/api/_shared/repository/user/user.repository.ts)         | Example: `export const userRepository = { … }`.                                    |
| [app/api/\_shared/mappers/user.mapper.ts](../../../app/api/_shared/mappers/user.mapper.ts)                                 | Example: `export const userMapper = { toAppUser, toUserMe }` — DB / **`IAppUser`** / **`src/interfaces`** shapes. |
| [src/DTOs/me/get-me-response.dto.ts](../../../src/DTOs/me/get-me-response.dto.ts) | Shared **HTTP success body** `interface` (e.g. **`IGetMeResponseDto`**) for **`sendResponse`** and client typing; composes **`src/interfaces`**. |
| [app/api/me/route.ts](../../../app/api/me/route.ts) | Thin **`GET`** with **`createGlobalRouteHandler`** + **`withAuthMiddleware`**; **`sendResponse<IGetMeResponseDto>({ user: userMapper.toUserMe(user) })`**. |
| [app/api/auth/logout/route.ts](../../../app/api/auth/logout/route.ts) | Thin **`POST`**: **`withAuthMiddleware`** (context includes **`session`**); **`authService.logout`** clears server session and returns **`sendResponse<IPostLogoutResponseDto>({ ok: true }, { cookies: [sessionIdCookieClear] })`**. |
| [app/api/test/body-validation/route.ts](../../../app/api/test/body-validation/route.ts) | Example **`POST`**: **`withAuthMiddleware`** + **`withValidatedBody(bodySchema)`**; request DTO + **`ZodType<IRequestDto>`**; generic **`IRouteHandlerContext & { user: IAppUser } & { body: … }`**. |
| [app/api/\_shared/repository/session/session.repository.ts](../../../app/api/_shared/repository/session/session.repository.ts) | Example: `export const sessionRepository = { createSessionForUser }`; **`SESSION_MAX_AGE_SECONDS`** for cookie **`maxAge`**. |
| [app/api/\_shared/utils/redirect-response.util.ts](../../../app/api/_shared/utils/redirect-response.util.ts)                 | **`redirectResponse`** — `NextResponse.redirect` plus optional cookie sets (used by `authService` and provider flows). |
| [app/api/auth/google/\_service/google-oauth.service.ts](../../../app/api/auth/google/_service/google-oauth.service.ts)        | Example: provider orchestration + `googleOAuthService`.                            |

## Placement rules

1. **Repository** — `app/api/_shared/repository/<entity>/<entity>.repository.ts`
   - Only **Mongoose / DB** calls for that entity needed by API routes.
   - Export: `export const userRepository = { methodA, methodB }`.

2. **Mapper** — `app/api/_shared/mappers/<entity>.mapper.ts`
   - Pure **mapping** between persistence types, `app/api/_shared/interfaces`, and `src/interfaces` DTOs (no DB I/O).
   - Export: `export const userMapper = { toAppUser, toUserMe }` (name methods by intent, often `to*`).

3. **Shared service** — `app/api/_shared/services/<domain>/<domain>.service.ts` (e.g. `try-catch/try-catch.service.ts`) or **`app/api/_shared/features/auth/services/auth.service.ts`** for cross-provider **auth** helpers (`authService`).
   - Logic **reused across providers** (redirect + cookie clearing, try/catch → `null` for uniform error branches).
   - Export: `export const authService = { … }`, `export const tryCatchService = { runSync, runAsync }`.

4. **Provider service** — `app/api/auth/<provider>/_service/<provider>-oauth.service.ts` (underscore folder keeps the segment out of the URL path)
   - **One provider’s** flow (env, tokens, profile, call repository + shared `authService` / `redirectResponse`).
   - Export: `export const googleOAuthService = { readGoogleOauthEnv, createAuthorizeGoogleRedirect, handleGoogleOAuthCallback }` (adjust names per provider).

5. **Route handler** — `app/api/**/route.ts`
   - Stay **thin**: `createRouteHandler` or `createGlobalRouteHandler`; call `<provider>Service.method(request)` or similar.
   - No business logic or direct `getUserModel` if a repository already exists for that entity.
   - Typed JSON success bodies shared with the client: **`sendResponse<YourDto>(…)`** with **`YourDto`** from **`@/src/DTOs/<domain>/…`** (or **`@src/DTOs/…`**).
   - **Middleware:** add **`withAuthMiddleware`**, **`withValidatedBody(zodSchema)`**, and/or **`withValidatedQuery(zodSchema)`** via **`{ middleware: [ … ] }`** when needed; order auth before body/query. Match **Zod** output to **`src/DTOs`** request interfaces (**`ZodType<IRequestDto>`**). After **`withValidatedBody`**, use **`context.body`** only (do not call **`request.json()`** again).

## Implementation checklist

- [ ] **Arrow functions only** — no `function` keyword; destructure props in the signature: `const foo = ({ a, b }: IFooProps) => { … }` (not `props` + `const { … } = props`).
- [ ] **Multi-arg** → single object + **`I` + PascalCase + `Props`**.
- [ ] **Primary export** is **`export const <name>Service`**, **`userRepository`**, or **`userMapper`** (or **`<entity>Mapper`**) with methods as properties; internal helpers stay unexported `const` arrows.
- [ ] Prefer **`tryCatchService.runSync` / `runAsync`** for steps where failure is handled the same way (e.g. redirect); use explicit **`try` / `catch`** when logging or inspecting `error`.
- [ ] **`/** PRIVATE */`:** only on module-level `const`helpers **not** listed on the exported`*Service`/`userRepository`/`*Mapper`object; **no** other descriptive`/\*_ … _/`on implementation`const`s in those modules.
- [ ] **Imports** use `@/app/api/...` paths.
- [ ] **Types**: keep `interface` in the same file until shared app-wide; then `src/interfaces` per ARCHITECTURE. **HTTP JSON body** shared by route + client → **`src/DTOs/<domain>/*.dto.ts`**.
- [ ] **Update** [ARCHITECTURE.md](../../../ARCHITECTURE.md) §5 if you introduce a **new top-level pattern** or folder.
- [ ] **Error classes:** If you add **`AppError`** subclasses under **`instances/`**, update [ARCHITECTURE.md](../../../ARCHITECTURE.md) §4 (HTTP route helpers), this skill’s canonical table, and [.cursor/rules/general.mdc](../../../.cursor/rules/general.mdc) if the intentional-throw guidance should mention them.
- [ ] **Validation routes:** If you add **`withValidatedBody`** / **`withValidatedQuery`**, colocate request shapes in **`src/DTOs/<domain>/*.dto.ts`**, type the schema as **`ZodType<IRequestDto>`**, and extend [lib/http/README.md](../../../lib/http/README.md) / [ARCHITECTURE.md](../../../ARCHITECTURE.md) §4 only if the pattern changes (not for every new route).

## Example import shapes

```typescript
import { authService } from "@/app/api/_shared/features/auth/services/auth.service";
import { userMapper } from "@/app/api/_shared/mappers/user.mapper";
import { sessionRepository } from "@/app/api/_shared/repository/session/session.repository";
import { userRepository } from "@/app/api/_shared/repository/user/user.repository";
import { googleOAuthService } from "@/app/api/auth/google/_service/google-oauth.service";
import type { IGetMeResponseDto } from "@/src/DTOs/me/get-me-response.dto";
```

## New OAuth provider (sketch)

1. Implement Google OAuth in `app/api/auth/google/_service/google-oauth.service.ts` (env, HTTP to Google, constants, `readGoogleOauthEnv`, `createAuthorizeGoogleRedirect`, `handleGoogleOAuthCallback` on `googleOAuthService`). The start route may use `tryCatchService.runSync(() => googleOAuthService.readGoogleOauthEnv())` and return JSON **500** when env is missing, then call `createAuthorizeGoogleRedirect`.
2. Add `app/api/auth/<provider>/callback/route.ts` (and start URL route if applicable) using `createGlobalRouteHandler` when MongoDB is required.
3. Implement `<provider>OAuthService` that calls `authService.buildOauthRedirect` (or shared helpers; optional **`extraCookies`** for session cookies), `userRepository`, and **`sessionRepository`** when issuing browser sessions; see Google’s `google-oauth.service.ts`.
4. Extend **user** / **session** schemas and repositories only if new fields or lookup keys are required; see [db-schema.md](../../../db-schema.md).
