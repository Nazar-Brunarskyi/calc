---
name: api-app-service
description: >-
  Adds or changes App Router API services and repositories under app/api/_shared
  and provider-specific app/api/**/service. Covers export object pattern (authService,
  tryCatchService, userRepository), thin route.ts handlers, and MongoDB via
  createGlobalRouteHandler. Use when implementing API auth flows, new OAuth providers,
  user persistence from routes, or when the user mentions app/api/_shared, service
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
| [ARCHITECTURE.md](../../../ARCHITECTURE.md) §5                                                                             | Folder layout: `_shared/repository`, `_shared/service`, `auth/<provider>/service`. |
| [.cursor/rules/general.mdc](../../../.cursor/rules/general.mdc)                                                            | Arrow-only functions, `I*Props`, `no any`, service object exports.                 |
| [lib/http/README.md](../../../lib/http/README.md)                                                                          | `createRouteHandler`, middleware.                                                  |
| [src/route-handlers/global-route-handler.util.ts](../../../src/route-handlers/global-route-handler.util.ts)                | Preset with MongoDB for API routes that need the database.                         |
| [app/api/\_shared/service/auth/auth.service.ts](../../../app/api/_shared/service/auth/auth.service.ts)                     | Example: `export const authService = { … }`.                                       |
| [app/api/\_shared/service/try-catch/try-catch.service.ts](../../../app/api/_shared/service/try-catch/try-catch.service.ts) | `tryCatchService.runSync` / `runAsync` — result or `null` if callback throws.      |
| [app/api/\_shared/repository/user/user.repository.ts](../../../app/api/_shared/repository/user/user.repository.ts)         | Example: `export const userRepository = { … }`.                                    |
| [app/api/auth/google/service/google-oauth.service.ts](../../../app/api/auth/google/service/google-oauth.service.ts)        | Example: provider orchestration + `googleOAuthService`.                            |

## Placement rules

1. **Repository** — `app/api/_shared/repository/<entity>/<entity>.repository.ts`
   - Only **Mongoose / DB** calls for that entity needed by API routes.
   - Export: `export const userRepository = { methodA, methodB }`.

2. **Shared service** — `app/api/_shared/service/<domain>/<domain>.service.ts` (e.g. `auth/auth.service.ts`, `try-catch/try-catch.service.ts`)
   - Logic **reused across providers** (redirect + cookie clearing, try/catch → `null` for uniform error branches).
   - Export: `export const authService = { … }`, `export const tryCatchService = { runSync, runAsync }`.

3. **Provider service** — `app/api/auth/<provider>/service/<provider>-oauth.service.ts`
   - **One provider’s** flow (env, tokens, profile, call repository + shared `authService`).
   - Export: `export const googleOAuthService = { handleGoogleOAuthCallback }` (name reflects provider).

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

## Example import shapes

```typescript
import { authService } from "@/app/api/_shared/service/auth/auth.service";
import { userRepository } from "@/app/api/_shared/repository/user/user.repository";
import { googleOAuthService } from "@/app/api/auth/google/service/google-oauth.service";
```

## New OAuth provider (sketch)

1. Implement Google OAuth in `app/api/auth/google/service/google-oauth.service.ts` (env, HTTP to Google, constants, `createAuthorizeRedirectResponse`, `handleGoogleOAuthCallback` on `googleOAuthService`).
2. Add `app/api/auth/<provider>/callback/route.ts` (and start URL route if applicable) using `createGlobalRouteHandler` when MongoDB is required.
3. Implement `<provider>OAuthService` that calls `authService.buildOauthRedirect` (or shared helpers) and `userRepository` / new repository methods.
4. Extend **user** schema and repository only if new fields or lookup keys are required; see [db-schema.md](../../../db-schema.md).
