# Cursor subagents (this project)

Markdown files in this folder define **custom subagents** for Cursor Agent. Each file is a specialist prompt with YAML frontmatter. Cursor discovers them automatically.

- **Official docs:** [Subagents](https://cursor.com/docs/subagents)
- **This repo:** [doc-sync.md](./doc-sync.md) — subagent that **must** follow the [sync-repository-docs](../skills/sync-repository-docs/SKILL.md) skill (canonical steps). Invoke with **`/doc-sync`**, or use **`/sync-repository-docs`** in the main Agent to run the same workflow without a subagent.

**Invoke explicitly:** `/doc-sync` (subagent) or `/sync-repository-docs` (skill).

**Frontmatter (see docs):** `name`, `description`, optional `model` (`inherit` | `fast` | model id), `readonly`, `is_background`.
