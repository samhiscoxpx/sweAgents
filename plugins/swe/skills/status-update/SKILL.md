---
name: status-update
description: Report verified programme or phase status, including chunk progress, deviations, deferrals and decisions owed. Invoked by the repository status-update skill; do not invoke directly.
user-invocable: false
---

# Status update

If you reached this skill by invoking `swe:status-update` yourself, invoke the repository's
`status-update` skill instead. Its overlay supplies the repository-specific values and is read first.
The shared core's definitions, authority rules and question-format rule apply here.

Read branch commits, plans, verification records and registers rather than recalling their state.
Every claim names a commit or file. Check reported results against the underlying evidence.
A status report presents the existing decisions owed; use the core's question-format rule.
An explicit request to resolve them invokes the walk-through.

## A phase lead

1. State the phase, branch, current commit and state: planning, building, verification in progress,
   blocked, merge-ready or merged.
2. Give one row per chunk in plan order:

   | chunk | description | state | reviewed or merged commit | verification | notes |
   |---|---|---|---|---|---|

   Use not started, building, in review, verification in progress, verification failed, blocked,
   merged or dropped. A dropped chunk names its decision record. In verification, name the tested
   commit, outcomes of the required suites, counts and exit codes, and link the complete record.
   Say “not run” or “not verified” where appropriate; do not imply evidence for a different commit applies.
3. List deviations: what changed from the plan, why, and the decision or commit.
4. List deferrals, including D tests and unresolved findings, with each register entry's file and line.
5. End with the core's “Waiting on” section.

## The Co-CTO

1. Give one row per phase or chore: the last three or four merged, all active work, then all queued work.

   | phase or chore | lead | state | current or merge commit | next step | decision owed |
   |---|---|---|---|---|---|

2. For every active phase, include its chunk table as above. Obtain it from the lead and verify its
   evidence, or read it from the repository. Add deviations and deferrals only when one needs the human
   principal.
3. End with the core's “Waiting on” section.

## Both roles

In “Waiting on”, preserve existing IDs and option letters. New questions use the session prefix the
overlay names. Future work with no question yet may appear under “Coming” without a number; an
already-open question keeps its ID and stays open until answered or withdrawn.

Use the core's writing standard. Give no time estimates in days. Say “Nothing” when no decision is owed.
