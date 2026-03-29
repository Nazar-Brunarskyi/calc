---
name: sync-repository-docs
description: >-
  Syncs repository markdown and Cursor skills with the codebase after code changes.
  Use when aligning ARCHITECTURE.md, README, COMPONENT_MAP, db-schema, lib READMEs
  with git diff; updating .cursor/skills SKILL.md tables and frontmatter; or
  registering new skills. The doc-sync subagent should load and follow this file.
---

# Sync repository documentation and skills

Canonical workflow for **documentation sync** in this repo. The **doc-sync** subagent (`.cursor/agents/doc-sync.md`) must **read this file** at task start and execute it; keep this skill as the **single source** for procedure — edit here first, not the subagent body.

## When to use

- After features or refactors: “sync docs”, “update ARCHITECTURE for my changes”, “fix skill tables after moving files”.
- From **main Agent** without a subagent: type **`/sync-repository-docs`** or ask naturally so this skill attaches.
- From **doc-sync subagent**: mandatory — follow every applicable step below.

## Source of truth

Align with (read before editing; do not contradict):

| Resource | Purpose |
| -------- | ------- |
| [ARCHITECTURE.md](../../../ARCHITECTURE.md) | Layout, `src/`, `lib/http`, App Router API, errors, Cursor Agent overview |
| [.cursor/rules/general.mdc](../../../.cursor/rules/general.mdc) | Canonical standards; **“Project Markdown files”** for root `*.md` registry |
| [COMPONENT_MAP.md](../../../COMPONENT_MAP.md) | UI catalog — update in the **same** change as catalogued components |
| [db-schema.md](../../../db-schema.md) | MongoDB / Mongoose, `DB/*` |
| [lib/http/README.md](../../../lib/http/README.md) | `createRouteHandler`, `createGlobalRouteHandler`, middleware **`next()`**, app middleware (**auth**, **Zod body/query**) |
| [lib/mongodb/README.md](../../../lib/mongodb/README.md) | Connection, models (route middleware under `app/api/_shared/route-handlers/`) |
| [.cursor/skills/api-app-service/SKILL.md](../api-app-service/SKILL.md) | Canonical API file-path table — update when those paths change |

Do **not** paste long policy from **general.mdc** into other docs — edit the source.

## Project context

- **Stack**: Next.js (App Router), React, TypeScript, Tailwind, MongoDB / Mongoose
- **API**: Thin `app/api/**/route.ts`; **`createGlobalRouteHandler`** = `withRouteErrorHandler` + `withMongoDbConnection` + optional middleware
- **Errors**: `AppError` and subclasses in `app/api/_shared/features/error-handling/instances/`; JSON via `jsonErrorBody`
- **Aliases**: `@/*` → repo root; `DB/*` → `lib/mongodb/*`

## Workflow

### 1. Scope the delta

- Run `git status` and `git diff` vs `HEAD` (or the base branch the user named).
- Include **uncommitted** work unless the user asked only for the last commit.

### 2. Map changes → docs

| Area touched | Update |
| ------------ | ------ |
| `app/api/**`, routes, error classes, `createGlobalRouteHandler` | [ARCHITECTURE.md](../../../ARCHITECTURE.md) (HTTP + API), [lib/http/README.md](../../../lib/http/README.md), [api-app-service/SKILL.md](../api-app-service/SKILL.md) table if paths changed |
| `src/DTOs/**`, path alias `@src/DTOs/*` | [ARCHITECTURE.md](../../../ARCHITECTURE.md) (`src/` tree, path aliases), [.cursor/rules/general.mdc](../../../.cursor/rules/general.mdc) (suffix table), [api-app-service/SKILL.md](../api-app-service/SKILL.md) table if examples change |
| UI (catalogued components) | [COMPONENT_MAP.md](../../../COMPONENT_MAP.md) |
| Schemas / collections / models | [db-schema.md](../../../db-schema.md), [lib/mongodb/README.md](../../../lib/mongodb/README.md) if needed |
| New root `*.md` | [README.md](../../../README.md), [.cursor/rules/general.mdc](../../../.cursor/rules/general.mdc) “Project Markdown files” |
| Renamed paths in docs | **Grep** old path; fix all hits |

### 3. Maintain `.cursor/skills/*/SKILL.md`

- **Frontmatter**: `name` = folder (kebab-case); `description` keyword-rich for Agent matching.
- **Body**: “When to use”, workflow, “Related”; mirror **api-app-service**.
- **New skill**: Add a line in [ARCHITECTURE.md](../../../ARCHITECTURE.md) (Cursor Agent bullet) and [README.md](../../../README.md) if discoverability matters.

### 4. New skill from scratch

Send authors to **create-skill** at `~/.cursor/skills-cursor/create-skill/SKILL.md` — do not copy that guide into this repo.

## Output format

Report:

1. **Summary** — What was wrong and what you fixed (or “already aligned”).
2. **Files edited** — Paths.
3. **Grep / diff notes** — Old → new paths if renamed; confirm no stale refs.
4. **Follow-ups** — Tests, commits, or open questions.

## Red flags

- Editing **`.cursor/rules/*.mdc`** without the user asking.
- Large **ARCHITECTURE** / **general.mdc** rewrites without matching code changes.
- Missing **COMPONENT_MAP** updates when a registered component moved or was renamed.

## Related

- **Subagent**: [.cursor/agents/doc-sync.md](../../agents/doc-sync.md) — isolated context; must load this skill.
- **API patterns**: [api-app-service](../api-app-service/SKILL.md)
- **Subagents (Cursor)**: https://cursor.com/docs/subagents
- **Skills (Cursor)**: https://cursor.com/docs/skills
