---
name: launch-builder-team-slim
description: Shared core for launching a slim builder team (isolated or serialized builders, one reviewer, the session as lead) that builds an approved IMPL chunk by chunk. Invoked by the repository's own launch-builder-team-slim skill; do not invoke directly.
user-invocable: false
---

# Slim builder team, shared core

If you reached this skill by invoking `swe:launch-builder-team-slim` yourself, stop and invoke the
repository's `launch-builder-team-slim` skill instead; it invokes this one and holds the repository's own
rules.

This is the shared core; the repository's own skill of the same bare name holds its overlay and was read
before this.

**Spawn named agents; a team forms by itself on the first spawn.** This needs
`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. Do not call `TeamCreate`, which no longer exists. Teammates are
addressed by `name` through `SendMessage` and share the task board.

## 1. Precondition, not planning

- **This skill runs only on an approved, committed IMPL with a chunk table.** Check before you spawn
  anything: the user named the plan document; its status says approved; the plan commit is on the phase
  branch; the phase to build is clear; every chunk names its files and its verification run. Where the plan has a
  chunk-zero probe, that chunk is reviewed too, and its review is not put off until the first end-to-end integration chunk.
- **If any precondition is missing, stop and ask.** There is no test planning or chunk scoping inside
  this skill. The IMPL is the plan; if it is not good enough to build from, fix the IMPL, not a second
  plan.

## 2. Roster

- **Builders, one per active chunk, at most two active chunks.** Each builder builds exactly one chunk,
  test first for the tests the IMPL names, and keeps it simple. More builders may help inside those two
  chunks; they never start a third stream. Builders run on the cheaper capable model, and the overlay
  names the model, the permission mode and the name pattern, which ends in the model.
- **One reviewer**, spawned through the `staff-engineer-review` skill and named as that skill's overlay
  names it, reviews chunk merges that require staff review under `phase-lead` section 7: ordinary code takes one staff round except for moves, renames or documents;
  boundary chunks take up to two. Its verdicts are
  APPROVE, REQUEST_CHANGES or DISCUSS, and nothing softer.
- **The session is the lead.** It scopes the briefs, owns the test environment, merges the chunks, and fixes or
  escalates. There is no tech-lead role, no test-engineer role and no reserve expert: blockers go to the
  Co-CTO under section 8.

## 3. Parallelism, from the dependency column

- **Create one task per chunk**, with `addBlockedBy` set from the IMPL's dependency column; a review task
  is always blocked by its build task.
- **Spawn builders only for chunks that are independent and name disjoint files.** The lead checks the
  overlap from the briefs before it spawns. Any overlap means one after the other, with no exceptions.
  Fewer, larger chunks beat many small ones.
- **Without isolated worktrees per agent, only one builder is active**, because with shared files only
  one agent may write to the shared worktree at a time, even when the IMPL has independent chunks.

## 4. Workspace mode and isolation

Choose the workspace arrangement the agent interface supports, and state it before you spawn. Where a
builder edits does not change how a chunk merges: each chunk has its own branch, created from the phase branch;
review reads named commits there, and a merge commit integrates it into the phase branch.

- **Isolated mode.** Each builder gets a worktree from the spawn: pass the interface's worktree-isolation
  option. The builder moves it to the phase branch tip with `git switch -c <branch> <tip>` on the clean
  tree, never `git reset --hard`, which a permission check can refuse, then runs the workspace
  install the overlay names, which is not optional. The brief says not to create, enter, leave or move any
  other worktree. A builder's first message reports `pwd` and `git branch --show-current`, and the lead
  checks both before any edit. The lead commits the builder's work on the chunk branch before review.
- **Lead-owned (shared) worktree.** The builder edits in a worktree the lead prepares on the chunk's own branch.
  Exactly one builder is active in that worktree, and it is the only writer. The lead and reviewer make
  no edits while it works. After the builder hands back ownership, the lead commits its work on the chunk
  branch. Review reads named commits there; revisions return to the builder and are committed on that
  same branch before re-review. The lead checks `pwd`, the branch and a clean, expected starting tree
  before each new chunk. The merge into the phase branch is the merge commit described above, not a direct phase-branch commit.
- **Never ask a builder to call a session-scoped worktree command.** It can move the lead and every other
  agent.

## 5. A shared test server that one test run uses at a time

- **Builders share one test server, such as a database, that only one test run can safely use at a time, and
  never own or configure it.** The lead's worktree holds the only instance, for example the test environment's database
  server; the overlay names it and the recipe that sets it up. Builders that can reach the locked test
  entry point use it directly; its setup takes the lock for suites that need the server. Two suites on
  one server collide, with failures that look unrelated, so the lock prevents the collision and the roster does
  not.
- **A builder runs a focused file that needs the shared test server only through the repository's test
  entry point with the files named**, which selects the suite and takes the lock. It never invokes the test runner
  directly. It reads the runner's file count to confirm that only the named files ran. The suite waits
  until the server is free. The lock is the authority: a process listing is for diagnosis only, and
  never a reason to delay a command that takes the lock.
- **A builder passes the server's connection values in the shell of each run, and never writes an
  environment file.** Where each test creates its own database, builders share the server and never a
  database.
- **In isolated mode the lead copies, at spawn, every file the connection values point at by a path
  inside the worktree**, such as a certificate, into each builder's worktree. Exporting the values does
  not bring those files with them. The overlay names the files.
- **A builder that can reach the locked test entry point runs its focused tests and mutations there,
  and records the output in the chunk record.** Otherwise the builder hands the named commands and tests
  to the lead, who runs them and returns the captures. The lead runs the chunk verification run under the same lock
  and re-runs every expected mutation failure the merge into the phase branch relies on, as `phase-lead` section 9 requires. Any suite that
  needs a resource no lock covers, such as a fixed server port or a real consumer process, stays with the lead.

## 6. The build, review and merge loop, per chunk

1. **The builder writes the smallest named failing test first.** Where it needs the shared test server,
   whoever can reach the locked entry point runs it under section 5's rule. If that is the lead, the
   builder goes idle until the lead returns the recorded test failure; only then does it implement. After the
   implementation, the same command must pass and the required mutations are run. Other checks
   stay in the builder's own focused failing and passing loop where it can run them.
2. **The builder reports done**: its runnable local checks passing, inaccessible checks handed to the lead,
   and the brief's self-verification answered. A
   builder resumed after any interruption runs `git status` and `git diff` before its next command and
   reports both. An interruption mid-mutation leaves the edit applied, and the `phase-lead` skill's
   four-part mutation rule assumes the run that applied an edit also reverses it. After the builder
   hands back ownership, the lead commits the builder's work on the chunk's own branch before review.
3. **Where staff review is required, the reviewer reviews the diff at a named commit**, assigned by
   `TaskUpdate`. Neither the lead nor the builder adds commits until the verdict returns, because a finding
   against a head that has moved costs a round sorting stale findings from real ones. For an ordinary move, rename or documents-only chunk, where no staff review
   is required, the lead's own read replaces steps 3 and 4.
4. **On REQUEST_CHANGES the work goes back to the builder.** The cap is two review rounds for a diff that
   touches boundary code, one for ordinary code, and none for a move, a rename or documents in ordinary
   code, matching the `phase-lead` skill's review rule. Stop on APPROVE, including after a clean first
   review. At the cap, record the actual verdict and permitted residuals, and escalate unresolved blockers
   to the Co-CTO rather than starting another round.
5. **On APPROVE, or after the lead's own read where no staff review is required, the lead runs the chunk's
   verification run against the reviewed code in the test environment**: the set the IMPL row names, widened to whatever else
   the diff reaches. A verification run failure goes back to the builder with the complete output. It uses no review
   round by itself, but a code change it causes is reviewed if a
   round remains.
6. **On a verification run whose checks passed, the lead merges the chunk branch onto the phase branch with a merge commit carrying
   the required evidence.** This is the merge into the phase branch in either workspace arrangement. Only then are dependent
   tasks unblocked.
7. **Make one merge commit per chunk.** The diff picks the test scope while the phase is in flight; the phase merge
   takes the full required phase checks.

## 7. What every builder brief carries

Every builder brief carries these inline, never as a bare file path.

- **The repository's rules and the test budget, verbatim:** "Before any source edit or test command, read
  the rules file and the testing document in full. In your first message, confirm that full read, name
  the required checks the diff selects, and name the smallest focused failing and passing commands for this chunk. While you
  implement, run only the smallest suite or named files that cover the change; do not run the full suite
  or the required phase checks. Capture the complete output of each command to a log and read the log afterwards;
  never pipe a live test command through a filter. The lead owns the chunk verification runs and the final full
  set of phase checks." The brief replaces "the rules file" and "the testing document" with the paths the overlay names.
- **The chunk's IMPL section and the IMPL's shared-invariants section**, never the whole plan. The plan
  documents are already committed on the branch the builders start from.
- **The K, C and D tests the chunk builds, by name**, from the IMPL. A builder adds no test the IMPL did
  not tag, unless it names the test's tag and the failure it catches that nothing else catches.
- **The time box, from the `time-box` skill:** the time box in hours, the time box file written with the start time
  and quoted in the first message, and the stop at the time box.
- **Dependency pins, when the chunk adds or changes one:** "Run the package manager's audit on the
  resolved tree and quote the result in the record; a pin inside an advisory is a finding, not a
  courtesy." The overlay names the audit command.
- **Stop and escalate, verbatim:** "If any assumption turns out to be wrong, such as a plan you did not
  expect, the wrong branch state, or a task you cannot claim, STOP. Send the lead a message with `SendMessage`. Do NOT improvise."
- **The ready-check, folded into the first message:** "Confirm the brief, the branch and the task in your
  first message, then start." There is no round trip waiting for a go.
- **Test first on the shared test server, when the chunk's proof needs it:** "Write the smallest named
  failing test before production code. If you can reach the locked test entry point, run your focused
  tests and mutations there. Otherwise hand the named commands and tests to the lead and go idle for its
  captures. Do not implement until the test failure is recorded; after implementation, record the same command
  passing and run the required mutations, through the lead where necessary. The lead runs the chunk verification run
  and personally re-runs every expected mutation failure the merge into the phase branch relies on."
- **The shared test server, verbatim:** "You do not own the server's configuration. Never start a
  container, and never create, copy or change an environment file. In shared-worktree mode, use the lead's
  existing environment file; in isolated mode, the lead may give you its connection values for your shell.
  Run only your chunk's named files, and only through the repository's test entry point with named files,
  so its setup takes the shared lock; never invoke the runner directly. If a mutation check against the
  server cannot use that entry point, write it and hand it to the lead's verification run." The overlay names the
  server, the environment file and the values.
- **Mutation scope and clauses, verbatim:** "Mutation demonstrations are compulsory for boundary tests
  and for mutations the plan names explicitly. An ordinary test needs one when a reviewer suspects a
  vacuous assertion. For a validation table or refusal list within that scope, make one mutation per
  clause, never one per check: delete the clause, run, restore, and record which assertion failed.
  A mutation per check leaves clauses that survive it." One chunk found six undetected mutations in two rounds
  before the split was applied.

**A first message that does not confirm the full read of the rules file and name the scoped commands is a
failed ready-check.** The lead interrupts before any edit or test and corrects the brief. The reviewer also
reads the rules file and the testing document in full before its first review, and says so with its
verdict. It does not run the required phase checks during a review in the middle of a build.

## 8. Escalations and drift

- **Send show-stoppers to the Co-CTO.** Where the core requires the principal's own approval in the acting
  session, follow that direct-approval procedure.
- **A convention test or an architecture test is built only where the IMPL names it.** One that a
  builder or the reviewer wants in the middle of a build goes to the lead, who sends it to the Co-CTO with
  the silent failure it would catch. It enters the plan or it is refused, and it is never added on the
  spot.
- **Rationale lives in commit messages**, never in source comments and never in a document that outlives
  the phase. A review-fix commit adds no prose that justifies itself, and adds a test only when the
  finding named one. A comment stays only on the core's comment rule's own terms, and stands alone.
- **Verify completion claims under `phase-lead` section 2.**

## 9. The check-in cron

- **Arm a check-in cron on any delegated build that runs for long, and remove it when the work merges.**
  When the lead launches a team whose work may run while the human principal is away, it schedules a recurring self
  check-in with `CronCreate`, about every half hour, off the round minute.
- **Each fire is cheap.** If the human principal sent a message in the last twenty minutes or so, do
  nothing, because the principal is driving. Otherwise read the agent and task state, chase any agent silent for more than about
  twenty-five minutes while it holds active work, process the reports, and move the work on. That
  includes merging an approved chunk into the phase branch and starting the next chunk that is scoped and already approved.
- **Default is to ship.** Do not invent a checkpoint that waits on the human principal when none is needed.
- **Delete the cron with `CronDelete` only when all delegated work is done and the next step truly needs
  the human principal's decision.** Never start new scope, or anything that needs the principal's decision,
  on a cron fire.
- **The cron lives only as long as the session.** It keeps a live session moving while the human principal is away, and it
  does not survive the session being killed.

## 10. Resuming

- **Teams do not survive sessions.** On resume, read the phase documents and the task list, and identify
  the merged chunks from `git log` on the phase branch, which is the ground truth; the task board is not.
- **Create tasks only for the remaining work**, spawn fresh builders for the next independent set, and
  tell the user where you are picking up from before you launch.
