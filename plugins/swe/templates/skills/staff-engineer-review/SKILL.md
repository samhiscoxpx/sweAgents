---
name: staff-engineer-review
description: Run the staff engineer review loop, one persistent reviewer agent that reviews a plan or a chunk over rounds until its verdict stands. Use when a PRD or IMPL is drafted, or a significant chunk has just been committed and needs review before the next chunk.
---

Read `CLAUDE.md` and `.claude/rules/core.md`, then invoke `swe:staff-engineer-review`.
The repository-specific values are in `CLAUDE.md`; apply them with the shared body.
Keep additional instructions here only when this skill needs repository-specific
behavior the shared core does not provide. Do not repeat its rules.
