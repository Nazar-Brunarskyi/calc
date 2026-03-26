# Application architecture

This document describes how the **calc** frontend is organized. The stack is **Next.js** (App Router), **React**, **TypeScript**, and **Tailwind CSS**.

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

| Folder | Purpose |
|--------|---------|
| `src/types` | Shared definitions made with the **`type`** keyword: aliases, unions, intersections, mapped/conditional utility types, and other type-level-only constructs. |
| `src/interfaces` | Shared declarations using the **`interface`** keyword: object shapes, contracts, and extendable API/domain shapes. |
| `src/constants` | Shared **constants** (config keys, limits, labels used in multiple places, enum-like values). Avoid dumping unrelated literals in one file as the tree grows. |
| `src/hooks` | Shared **React hooks** (`use*` modules) used from more than one route or feature. |

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

## Rule of thumb

- **Used once?** Keep it next to the page: `app/<route>/components/` (and colocate local types, interfaces, constants, or hooks there if they are not shared).
- **Used more than once?** Move UI to `src/components`; shared **`type`**-based definitions to `src/types`; shared **`interface`** declarations to `src/interfaces`; shared constants to `src/constants`; shared hooks to `src/hooks`.

## Possible extensions

Later guidelines can cover other naming topics, data fetching, API clients, and (if added) a **NestJS** backend and how it maps to this frontend. This file focuses on placement, colocation, the shared `src/` tree, and kebab-case filenames for type, interface, and hook modules.
