---
name: launch-builder-team-slim
description: Launch a slim builder team (isolated or serialized builders, one reviewer, the session as lead) that builds an approved IMPL chunk by chunk. Use when an IMPL has passed review and the human principal asks for a team to build it.
---

Read `CLAUDE.md` and `.claude/rules/core.md`, then invoke `swe:launch-builder-team-slim`.
The repository-specific values are in `CLAUDE.md`; apply them with the shared body.
Keep additional instructions here only when this skill needs repository-specific
behavior the shared core does not provide. Do not repeat its rules.
