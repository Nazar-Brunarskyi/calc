# Component map

Reference for AI agents: **component name** → **path** from project root.

## Maintenance (keep in sync)

- **When:** Update this file in the **same change** as add/rename/move/remove of a **React component module** (`*.tsx` / `*.jsx`) that is part of the app UI (pages, layouts, colocated route components, shared UI under `components/`, `src/components/`, or `src/features/**/components/` / `src/features/**/providers/`).
- **Drift:** Row count changes over time; do not hardcode “N components” elsewhere — treat this file as the lookup source of truth.
- **Placement rules:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for where page-local vs shared components live.

## Components

| Component name | Path                                              |
| -------------- | ------------------------------------------------- |
| RootLayout       | app/layout.tsx                                                      |
| WithAuthLayout   | app/(with-auth)/layout.tsx                                          |
| RequireAuthGate  | src/features/auth/components/require-auth-gate.component.tsx        |
| Home             | app/(with-auth)/page.tsx                                            |
| LoginPage        | app/login/page.tsx                                                  |
| ProfilePage      | app/(with-auth)/profile/page.tsx                                    |
| ProfileView      | app/(with-auth)/profile/components/profile-view.component.tsx       |
| AuthProvider     | src/features/auth/providers/auth-provider.component.tsx             |

## Notes

- **Default exports:** Next.js pages and layouts are usually **default** exports; the **Component name** column uses the **function or const name** in the file when present.
- **Named exports:** Use the exported symbol (e.g. `Button`) and the file path.
- **Duplicates:** If the same name appears in multiple files, use the **path** to disambiguate.
