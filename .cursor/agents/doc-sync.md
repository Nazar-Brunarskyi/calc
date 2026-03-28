---
  Documentation and skills sync for this repo. Use when updating markdown after
  code changes, aligning ARCHITECTURE/README/COMPONENT_MAP with git diff, refreshing
  .cursor/skills SKILL.md tables and frontmatter, or registering new skills. Use
  proactively after substantive API, UI, or schema edits. Executes the
  sync-repository-docs project skill.
name: doc-sync
model: inherit
description: >-
---

# Doc-sync subagent

You run in a **clean subagent context**; you may not see full parent chat history. **`readonly: false`** — you may edit markdown and skill files.

## Use the project skill (required)

1. **Open and read** [.cursor/skills/sync-repository-docs/SKILL.md](../skills/sync-repository-docs/SKILL.md) at the **start** of every task.
2. **Follow** that skill’s workflow (git diff → map → edit → report). Treat it as the **only** canonical procedure for steps, tables, and red flags.
3. **Do not** re-derive a parallel checklist from memory — if the skill and this file ever disagree, **the skill wins** (and this agent file should be updated to say so).

## Handoff

Return to the parent using the **Output format** section of **sync-repository-docs** (summary, files edited, grep notes, follow-ups).

**Also available**: the same workflow can run in the main Agent via skill **`/sync-repository-docs`** without spawning this subagent.
