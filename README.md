# sweAgents

A Claude Code plugin marketplace holding one plugin, `swe`. The plugin carries the generic core
of role and workflow skills and of the repository rules file, shared by every repository that pins it.

License: MIT. See [`LICENSE`](LICENSE).

## Quick start

1. In Claude Code, add the marketplace and install the plugin:
   `/plugin marketplace add benjaminfh/sweAgents`, then `/plugin install swe@swe`.
2. In the repository, run `/swe:quick-start`.

That is all. The skill reads the repository, asks only what it cannot read, shows the filled
`CLAUDE.md` and every file it will create, and writes them when you approve. It commits nothing.

## What is in it

| file | what it holds |
|---|---|
| `plugins/swe/skills/co-cto/SKILL.md` | the Co-CTO role: one coordinator over lead sessions |
| `plugins/swe/skills/phase-plan/SKILL.md` | how a phase's PRD and IMPL are written |
| `plugins/swe/skills/phase-lead/SKILL.md` | how a lead builds, verifies, merges and closes a phase |
| `plugins/swe/skills/architecture-guardrails/SKILL.md` | how to design and enforce module boundaries that keep coding agents from tangling a codebase; a standalone skill with no overlay, invoked as `swe:architecture-guardrails` |
| `plugins/swe/skills/quick-start/SKILL.md` | the first setup of a repository from the template and starters; a standalone skill with no overlay, invoked as `swe:quick-start` |
| `plugins/swe/skills/night-watchman/SKILL.md` | overnight coordination within existing approval limits |
| `plugins/swe/skills/status-update/SKILL.md` | verified programme and phase status |
| `plugins/swe/skills/walk-through/SKILL.md` | existing open decisions, presented without changing IDs or option letters |
| `plugins/swe/skills/edit-a-rule/SKILL.md` | lossless rule editing and versioned adoption |
| `plugins/swe/skills/staff-engineer-review/SKILL.md` | persistent staff review within the applicable round limit |
| `plugins/swe/skills/launch-builder-team-slim/SKILL.md` | builders, named-commit review and chunk merges |
| `plugins/swe/skills/merge-to-trunk/SKILL.md` | the checked worktree-to-main merge recipe |
| `plugins/swe/skills/time-box/SKILL.md` | work limits, clock evidence and stop/report rules |
| `plugins/swe/skills/cto-handover/SKILL.md` | a verified successor handover |
| `plugins/swe/rules/core.md` | the shared core of the repository rules file |
| `plugins/swe-inbox/` | an optional second plugin: an inbox pane beside the chat for the questions and decisions sessions put to the human principal; see its README |

The shared rules do not name a private consuming repository or require its package names, paths,
engines, session names or environment prefixes. The consuming repository supplies those values in
its overlay (repository-specific rules and skill extensions). The standalone architecture skill includes public-tool examples for TypeScript/pnpm
and Python/uv; the installation instructions name this public plugin and its repository.

## How a repository pins and enables it

Add the marketplace to `.claude/settings.json`, pinned to a tag, and enable the plugin:

```json
{
  "extraKnownMarketplaces": {
    "swe": {
      "source": {
        "source": "github",
        "repo": "benjaminfh/sweAgents",
        "ref": "v0.2.0"
      },
      "autoUpdate": false
    }
  },
  "enabledPlugins": {
    "swe@swe": true
  }
}
```

`ref` pins the tag, so a change here never reaches a repository until that repository bumps its
pin. `autoUpdate` is false for the same reason.

## The compaction hook

Add this to the same `.claude/settings.json`, so a session that has just been compacted is told to read
its skill from disk rather than trust what it remembers:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "hooks": [
          {
            "type": "command",
            "command": "echo 'Your context was just compacted. Use Read to read both your repository overlay at .claude/skills/<name>/SKILL.md and its pinned shared body at ~/.claude/plugins/cache/swe/swe/<pinned version>/skills/<name>/SKILL.md. Read the pinned version from .claude/settings.json without its leading v. Use phase-lead for a lead, phase-plan for a plan-writing session, or co-cto for the Co-CTO. The Skill tool may serve a cached copy and does not count as the refresh.'",
            "timeout": 5
          }
        ]
      }
    ]
  }
}
```

## How the overlays work

Start with [`plugins/swe/templates/CLAUDE.md`](plugins/swe/templates/CLAUDE.md) and the thin stubs
under [`plugins/swe/templates/skills/`](plugins/swe/templates/skills/); both install with the
plugin. Fill the named blanks from verified repository facts; then copy the rules template to
`CLAUDE.md` and each overlay stub to `.claude/skills/<name>/SKILL.md`. Each template section opens with a line saying when to keep,
adapt or delete it; keep long local policies in their authoritative documents rather than copy
them into it.

The rules name documents and files a new repository does not have. The starters ship beside the
template in `plugins/swe/templates/`: the documents under
[`docs/`](plugins/swe/templates/docs/), the two hooks under [`hooks/`](plugins/swe/templates/hooks/),
the hooks-path script `scripts/setup.sh`, the boundary file `architecture.json` and the settings
`settings.json`, which carries the pin and the compaction hook above. Copy each to the path its
blank names in the template's table and fill the blanks inside it, or let `swe:quick-start` do it. Each starter holds headings
and one line of guidance under each, never a filled policy, and each unfilled hook or script exits
non-zero until its blank is filled.

Each repository keeps its own skill of each bare name. Its instructions read the repository
rules and invoke the plugin's shared skill (`swe:co-cto`, `swe:phase-plan`, `swe:phase-lead`,
and the other overlaid skills). Additional text contains only that skill's local instructions.
The stubs refer to values in `CLAUDE.md` rather than create a second set of blanks.

**Invoke the repository's overlay for skills that have one. The standalone
`swe:architecture-guardrails` skill has no overlay and is invoked directly. The human principal
runs `/swe:quick-start`; no session invokes it.** Overlaid core skills say "do not invoke directly" in their descriptions and carry
`user-invocable: false`, which takes
them out of the `/` menu while leaving the repository's skill able to invoke them.

**After a compaction, or a merge that brings new rules, use Read to read both files from disk:**
the overlay at `.claude/skills/<name>/SKILL.md` and the pinned shared body at
`~/.claude/plugins/cache/swe/swe/<pinned version>/skills/<name>/SKILL.md`. Read the pinned version
from the repository's `.claude/settings.json` pin, without its leading `v`. The Skill tool may serve a cached copy, so it
does not count as the refresh. The compaction hook above prints this instruction.

## How the rules file is copied

`plugins/swe/rules/core.md` is copied into the repository at `.claude/rules/core.md`, and the
repository's `CLAUDE.md` carries a line pointing at it. Copy it again, and commit the diff, each
time the repository bumps its pin. The copy is checked in so that a session with no plugin
installed still reads the rules.

## How a core change is made

1. The maintainer commits the change here and tags a new version.
2. The maintainer sends a notice to each consuming repository's Co-CTO naming the tag and the rules that moved.
3. Each repository bumps its `ref`, re-copies `rules/core.md`, and removes from its own overlay
   anything the core now states.

## What enters the core

A rule enters the core only when it addresses incidents observed in two consuming repositories, or one high-impact incident
in any one. A rule addressing one incident at low or medium impact stays in the repository that met it, until
a second observed incident justifies sharing it. The reason a rule exists lives in the commit that added it and in this
repository's changelog, never as provenance comments in the rule text.

## The machine-wide verification run lock

`plugins/swe/tooling/machine-lock/` holds the lock every consuming repository takes around a whole integration or mutation
run, so at most one heavy run is in flight on a shared machine. Each repository vendors the directory's
files to the same paths under its own root (`tests/setup/machine-lock.ts`, `machine-lock-child.ts`,
`machine-lock.test.ts`, `scripts/with-machine-lock.ts`) at the pinned tag, wires the lock into its
integration project's global setup before its own port lock and releases it after, and wraps a
mutation runner with `scripts/with-machine-lock.ts --session <name> <command>`. The lock file is
`.claude/machine-gate.lock` under the running user's home directory; a thirty-minute wait means another project's run holds it, and
the file names the holder.
