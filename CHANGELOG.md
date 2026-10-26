# Changelog

## Unreleased

- Add `swe-inbox`, an optional second plugin in the marketplace (`/plugin install swe-inbox@swe`).
  It is a Claude Code mod. Agents file each question for the human principal with its `ask` tool,
  which gives the item its W-number. The principal answers in a pane beside the chat (`/inbox`), and
  the answer reaches the session that asked as a prompt. A typed `W7: B` answers the item too. An
  approval is answered only in the session that raised it, by a prompt the principal sends. Items
  are kept in `.swe/inbox/` under the main working tree, shared by every worktree. No core rule
  changes.
- `/inbox terminal` opens the same inbox in a terminal window of its own (`tui/inbox.py`, Python
  standard library only); an approval cannot be given there.
- A note in the inbox can have several lines. The pane's note field is three rows tall. In the
  inbox terminal, Ctrl+J or Alt+Enter starts a new line, and a paste keeps its lines.

## 0.2.0 — 2026-10-21

Quick-start review fixes, 2026-10-21:

- The pre-commit hook prints `pre-commit: running <checks>` and runs them with `sh -ec`; the
  quick-start fills the commit checks one command per line, so the first failure fails the hook.
- The quick-start requires `templates/CLAUDE.md` under the plugin root, offers a pin bump with a core
  re-copy when the pin is older than the loaded version or the root has no templates, checks the tag
  with `git ls-remote` before writing the pin, replaces an existing vendored core by an approved
  re-copy rather than a merge, fills the finished-register blank by halves, takes `<human-name>` from
  `git config user.name`, states the question tool's option limit, and writes on branch `setup/swe`.
- Add the MIT `LICENSE` and the `license` field; rename the README title to `sweAgents`; pin example
  `v0.2.0`.
- The TESTING starter points at core sections 1 and 7 and keeps headings for what the repository adds;
  the PRD starter cites core section 9; `architecture.json` uses the architecture-guardrails section
  names `sensitivePaths` and `restrictedImports`.
- Core section 3: the ping uses `PushNotification` or, where the harness has no such tool, a message in
  the session. The co-cto install bullet names `swe:quick-start`; its fix order says what happens with
  no brief or record template.
- A finished `CLAUDE.md` keeps no setup scaffolding: the quick-start's last step, after its checks
  pass, removes the "Blanks to fill" section, every "Keep, adapt or delete" line and the opening's
  sentence about filling blanks, then checks again. The template tells a hand-filler to do the same.
- The quick-start is started only by the human principal: `disable-model-invocation: true`, and the
  co-cto skill no longer installs the rules on a first session.
- Version 0.2.0.

Meaning-preservation fixes and approved additions, 2026-10-21:

- Apply review items F1–F24. Restore ASD-STE100 and the poster test to the core following the
  human principal's ruling, reversing the earlier move to consumer rules. Restore the Co-CTO's
  design preferences, build-time restricted imports, required ordinary staff review, builder
  commit-title restrictions, and the stronger verification and retry wording.
- Apply round-2 review items G1–G19: restore dropped instructions in the four added skills, give the
  template stubs their shared bodies' descriptions, and add three template blanks and a terms section.
- Use the approved objective-check wording for rule authors. Read cache versions without the pin's
  leading `v`. Clarify architecture-suite scope, boundary review, comments, and handover terminology.
- Add night-watchman, status-update, walk-through and edit-a-rule as overlaid shared skills, applying
  the candidate review's fixes. Keep frontend-engineer out. Define the question-tool policy once in
  core section 3: only explicit walkthroughs use the tool; other questions use lettered prose.
- Rebuild `templates/CLAUDE.md` on the primary repository's rules file: the same sections and
  sentence form, generic rules kept as default text, each value a blank in its sentence, a
  "keep, adapt or delete" line per section and a blanks index; the 48 blanks are unchanged.
- Add a repository rules template and twelve thin overlay stubs. Derive local values as blanks from
  the approved filled sources; retain no private product names, paths or policies. README links them.
- Record-format change from A4: `box-start` now contains two keyed lines, `box:` and `start:`, rather
  than the earlier single-value form. The merge template includes `box` and `end`; `end-commit` may
  replace `end`. Start/end examples include timezone offsets. Existing field names remain stable.
- Scope clarification: the wording-only pass changed no executable tooling. Earlier privacy cleanup
  changed the machine-lock test's temporary-directory prefix to the public package prefix; this is
  a test-fixture naming change, not a lock-algorithm change.
- Replace the template's blanks index with a table of all 53 blanks: each one's section, what fills
  it, a pattern that ties it to the others, and an example from one invented repository.
- Ship starters for what the rules require: the product document, testing policy, both registers and
  their finished files, hazards file, repository and threat documents and decision batch under
  `plugins/swe/templates/docs/`, both hooks, the hooks-path script and the boundary file; the template's table
  names each starter, and the threat document, integration suite and test environment may read "none".
- Add the standalone `quick-start` skill: it derives every value it can from the repository, asks the
  rest in batches of at most four lettered questions, shows the filled `CLAUDE.md` and every file it
  will create, writes on approval, and checks the blanks, both hooks and the vendored core. The core's
  question-format rule names it beside the walk-through, as the human principal decided.
- Move `templates/` and `tooling/` to `plugins/swe/templates/` and `plugins/swe/tooling/`, so they
  install with the plugin; the earlier entries below name the old paths. The quick-start reads every
  file from the plugin's installed copy at the pinned version, and `templates/settings.json` carries
  the pin and the compaction hook.
- The package version is 0.2.0 (the quick-start review fixes above); the release owner creates the tag.


Approved plain-language pass, 2026-10-21:

- Define retained workflow terms in the shared glossary; replace the selected workflow labels and
  prose metaphors with concrete language throughout the rules and skills.
- Use `[approval-required]` for decisions needing human approval. Existing `[boundary]` plan tags keep
  that approval requirement. Consumer overlays must adopt the new prose when they update their pin.
- Preserve skill identifiers, tool calls, paths, record fields and the merge-message template for
  compatibility. No executable tooling or process changes are part of this wording pass.


Approved review decisions C4–C15 and A1–A4, 2026-10-21:

- Apply all sixteen approved decisions: approval conditions,
  factual briefs, hook behavior, approved C tests, mutation scope, fresh built dependencies, merge/chunk
  checks, standalone invocation, document references, escalation routing and initial architecture controls.
- Refresh both the repository overlay and pinned shared skill from disk; document the cache path and
  read the version from the repository pin. Align the README compaction hook with the same instruction.
- A timeout-only run is invalid, with one lead-authorised retake of timed-out files alone at a quiet moment.
  A second invalid run stops the work. Planned diagnostic samples are a separate activity, never used to obtain a better pass.
- Make a requested bug audit's report-before-fixing behavior an explicit exception. Record time limits
  and system-clock starts in time box files, and box/start/end or a bounding commit in chunk merge records.
  No existing field names change; the package's tools do not read chunk/merge records.
- Remove remaining private-repository hashes, phase/chunk identifiers and source labels from the
  changelog, and the personal name from review prose. Keep the public plugin's installation coordinates
  and publisher metadata. The terminology pass is recorded above.

Chunk-merge clarification approved by the human principal, 2026-10-21:

- Use one chunk-merge workflow regardless of workspace arrangement: the lead commits the builder's work
  on the chunk's own branch, review reads named commits there, and the chunk merge is a merge commit onto
  the phase branch carrying the required evidence. Remove the obsolete shared-worktree direct-commit
  and uncommitted-review procedure. Freeze the reviewed tip for both lead and builder during review.
- A documents-only change belonging to no chunk, such as a register entry or decision record, may be
  committed directly on the phase branch and takes the required commit checks. This exception does not apply to
  documentation that is part of a chunk.

Approved wording changes V1–V6, 2026-10-21:

- Apply the six approved before-and-after proposals exactly as approved:
  the time-box introduction, false brief assumptions, chunk overhead, boundary claims without a
  threat document, facts hidden in memory, and re-verification of residuals. No procedures change.
- The V4 incident account, removed from the working instruction: one Co-CTO told a lead a published
  package was inert without its credential, and told the human principal a restricted database
  connection could be used. The threat document and the tree contradicted both.

Test-execution clarification approved by the human principal, 2026-10-21:

- Assign focused tests and mutations by access: a builder that can reach the locked test entry point
  runs them there; otherwise the lead runs the named commands and returns the captures. Keep test-first
  hand-offs for builders without access. The lead runs the chunk verification run and personally re-runs every
  expected mutation failure the merge relies on, even when a builder already ran it. Align the team workflow and
  mandatory brief with that distinction. The public instructions name no particular harness.

Review-round decision approved by the human principal, 2026-10-21:

- Round counts are maxima: PRDs, boundary chunks and final cleanup reviews take at most two rounds;
  ordinary chunks at most one, with no staff review for ordinary moves, renames or documents.
  Stop on APPROVE, including after a clean first review. At the cap, report the actual verdict and
  escalate unresolved blockers to the Co-CTO instead of adding another round. Boundary IMPL rows
  remain uncapped. Align the core, lead, reviewer persona and team loop, including its zero-review path.
- Test ownership was initially held for a check of current practice, then clarified in the entry above.
  The other review decisions and V1–V6 were subsequently approved and applied above.

Conservative duplication pass, 2026-10-20:

- Repeated instructions consolidated in their existing homes: filling overlay blanks and writing to the
  principal in the core; lead-start instructions in co-cto section 1; test tags and fixture boxes in
  phase-plan section 5; provenance definitions in the core glossary; planning depth in core section 10;
  verification of reviewer claims in staff-engineer-review; verification of builder completion in
  phase-lead section 2; factual review briefs in staff-engineer-review section 4; and handover hedges in
  cto-handover section 3. The Co-CTO keeps its additional wording constraints.
- Reviewer personas, required builder-brief text and the standalone architecture recipe retain their
  repetitions, because they reach separate readers. No role, procedure or approval rule is changed.
- Only approved proposals from this pass are applied.

Requested by the human principal, 2026-10-20, from a read of the core, for an adversarial review.

- Section 9 rewritten: one definition of the three provenance tags (in section 1, now covering the engine,
  its driver, the cloud and the toolchain); a fact is recorded as reasoned or inherited but no chunk builds on
  it before a probe verifies it here; probes run in the probe chunks, or in the first dependent chunk for an
  unforeseen fact; a dependency's promise has one sanity suite, which is its probe; a claim about our own code
  counts only after a planted input or mutation; the observed-failure rule governs mechanisms outside the
  boundary, and boundary tests (architecture tests over boundary code included) need no incident; the
  incident story moves to this entry.
- The closed-directory rule moves from section 9 to section 5, and "nothing is inherited unmeasured" becomes
  "no pattern is copied from it without being measured here first", so "inherited" keeps one meaning.
- Repeats removed: the guard definition in section 1 keeps the meaning only; section 8's Co-CTO line restating
  the two preferences is deleted; the co-cto skill's copy of "a claim about somebody else's work" now points to
  the core's rule and keeps only what is its own.
- Tools named where a rule calls for one: `SendMessage` for session messages, the retrospective, the time
  box's half-way line and a builder's stop; `PushNotification` in place of "ping".
- One vocabulary: the glossary term "Import wall" becomes "Restricted imports" and "architecture
  config file", the industry terms the architecture-guardrails skill uses; phase-lead follows; "allow-list"
  and "deny-list" become "allowlist" and "denylist", and the denylist sentence says plainly what happens.
- The earlier move of ASD-STE100 to consuming rules is superseded: the human principal restored
  ASD-STE100 and the poster test to core section 3 for the 0.2.0 baseline.
- The incident behind the observed-failure rule: a plan carried a walk refusing any second copy of a rule
  list anywhere in the workspace, written to answer a review minor; the copy it guarded against had never
  existed, the compiler already checked every typed use, and it was deleted at the close after a debt sprint
  had been signed to extend it.

## 0.1.20

Requested by the human principal, 2026-10-20; drafted by a consuming repository's Co-CTO and approved by the
human principal the same day.

- New standalone skill, `architecture-guardrails`: the design that keeps coding agents from tangling a
  codebase (one door per package, a sibling package in place of a second door, each capability held by
  one package, one allow file, parser-based architecture tests that fail closed, planted-tree proofs),
  with a TypeScript and pnpm recipe and a Python and uv recipe. It has no overlay and names no
  repository.

## 0.1.19

Requested by a consuming repository's Co-CTO and approved by the human principal, 2026-10-17.

- The staff-engineer-review persona and its silent-reviewer recovery message send to `main`, not
  `team-lead`. A message to `team-lead` reaches a session only when a running agent carries exactly
  that name, which is usually not so, and it is lost with no error: a builder whose lead copied the
  wording lost two questions and stopped mid-chunk (2026-10-17). A message to `main` reaches the
  session that spawned the agent, measured in a consuming repository the same day.

## 0.1.18

Requested by a consuming repository's Co-CTO and approved by the human principal, 2026-09-27.

- The machine lock's waiting line names the holder's start time and the time waited, and repeats at
  least once per report interval (60 s by default, `reportEveryMs` to change it) while the wait goes
  on, not only when the holder or the queue changes. A builder took a quiet 60 to 90 second wait for a
  hang and killed every session's test runs by name.

## 0.1.17

- The machine lock's waiter test reads only the lock's own stderr lines. On Node before 22.18 the child's
  type-stripping flag also prints an experimental-feature warning first, and 0.1.16's test read that
  warning as the waiting line and failed on every run there (a consuming repository's main, Node 22.17.1).

## 0.1.16

Requested by the human principal, 2026-09-26.

- The machine lock says on stderr when it must wait: the lock path, the holder's session and pid, and how
  many waiters are ahead, again whenever that changes, and one line when it takes the lock after a wait. An
  uncontended acquire prints nothing. A commit hook queued three minutes behind another project's suite
  printed nothing and looked hung. Both projects' vendored copies take it with the pin move.

## 0.1.15

All changes approved by the human principal, 2026-09-26.

- The core's section 7 gains the chunk order: probe chunks, boundary chunks, the spine, the other chunks, a
  final boundary chunk if needed, the volume review. The first boundary chunks build every entry point the
  plan foresees, a later chunk carries boundary work only where the plan names it (a later change to code
  outside the boundary stays ordinary), and no phase merges, and no branch deploys, with deferred boundary
  work still open. The rule was proven in one consuming repository first, and its Co-CTO reviewed this text. The Spine definition and the phase-plan skill's chunk-table rules follow it.
- The phase-plan skill: a check that reads a structure by the position of its parts names what the
  executing component does with a part of any kind in each slot, and its tests plant a part of the wrong
  kind there. One phase met the bypass three times.
- The core's worktree recipe and the builder-team skill use `git switch -c`, not `git reset --hard`, which
  a permission check can refuse; a builder lost its setup to it.
- The phase-lead skill: every builder brief forbids widening a plan clause (two widenings in one phase), and
  a builder's commit title never says "WIP" or "Land" (one of each in one phase).

## 0.1.14

- `tooling/machine-lock/`: the two default lock paths are built from the running user's home directory
  (`join(homedir(), ".claude", "machine-gate.lock")` and the same for `machine-build.lock`) instead of
  naming one user's home. On the machine both repositories share, the paths are the same files as before,
  so a repository on 0.1.13 and one on 0.1.14 still take one lock. A consuming repository's Co-CTO asked for it
  (2026-09-25), approved by the human principal.

## 0.1.13

- `tooling/machine-lock/` is level with a consuming repository's copy again: its lock module and tests,
  copied verbatim by the human principal (a second lock path, `machine-build.lock`, for commit
  hooks, lint, typecheck, build and whole-project unit and architecture runs; and a first-come-first-served
  queue of tickets on both locks). That copy had moved on from 0.1.2 without this repository,
  and nothing checked the two agreed; each repository now vendors these files from the pinned tag with a
  drift check.
- The ancestor rule, new: a holder records the locks it holds, path to pid, in `SWE_MACHINE_LOCK_HOLDERS`,
  which its child processes inherit, and a descendant whose environment names a path held by a live pid
  that the lock file still names goes ahead at once. A commit hook that takes the build lock and runs a
  build script that also takes it no longer waits on itself; a wrapped integration run that takes the gate
  lock inside the wrapper no longer deadlocks. The holder's own process gets no pass, and a stale or
  hand-set entry grants nothing. Three tests, each shown able to fail by breaking the clause it holds. A
  consuming repository's Co-CTO asked for it (2026-09-25), approved by the human principal.

## 0.1.12

Both changes from this repository's owning Co-CTO, 2026-09-25, approved by the human principal.

- The core's phase loop now has eight steps, and the IMPL is written only after the human principal has
  reviewed the PRD: start; PRD authoring; PRD review (two rounds, ending in a verdict with residuals);
  the human principal's PRD review (open questions answered, residuals decided); IMPL authoring; IMPL
  review (until the boundary rows are approved); build, on the principal's word; close. The old loop put
  both reviews after both documents, which contradicted the phase-plan skill's rule that open questions
  are settled before the IMPL is written; two phases followed the loop and edited their IMPL to each
  answer under review. The phase-plan skill's order lines match.
- The review skill: where the reviewer reads a branch, the chief creates its worktree before dispatch
  and names the path in the briefing, and the reviewer checks it before any git command. Two reviewer
  worktree slips in one phase: a refused worktree, and a reviewer that moved `HEAD` in the lead's own
  worktree.

## 0.1.11

Both changes come from the other repository's Co-CTO, 2026-09-24, amended, approved by the human principal.

- The core's rule on facts from another project splits in two (section 9). An inherited fact, meaning
  engine or driver behaviour recorded in another repository and never run here, is run as a probe before a
  chunk builds on it. A dependency's promise about its own product is cited, never re-tested: the consumer
  keeps at most one sanity suite against it, and a gap goes to the dependency's owner. The old sentence was
  read as asking a consumer to re-test a dependency's guarantees on every query form.
- The spine exists only where a phase adds a path a caller crosses, and it is the first chunk that path can
  carry: after the probe and after any chunk that builds an entry point it calls (the core's definition, and
  the phase-plan skill's two lines). A forced spine in a phase that adds no path proves nothing.

## 0.1.10

- The `co-cto` skill names no model version. The Co-CTO runs on the model the overlay names for it, and
  plan authors on the model the overlay names for them; the reviewer's model is the review skill's
  overlay's. A model change then touches only the overlay. From the other repository's Co-CTO,
  2026-09-23, approved by the human principal.

## 0.1.9

All six changes come from the other repository's Co-CTO, 2026-09-22, amended.

- Section 7, the boundary's one home: each repository defines its boundary in one machine-readable file
  its tooling reads, named by the overlay; documents point to it and never restate it; a change that adds
  code inside the boundary updates the file in the same change, and the brief and the review ask.

- Section 1, boundary code: it includes, however thin, code that decides whose identity or scope a call
  to the boundary runs under, and code that holds results across callers, such as a cache, a queue or
  shared memory. The overlay's list of boundary paths includes such code or names it.
- Section 1, a new term, the boundary's edge: what callers of boundary code depend on, meaning its entry
  points, the scope or purpose a call runs under, its policies and the shape of its answers. A boundary
  chunk, and the boundary tests at the chunk bar, now cover a diff that touches the edge.
- Section 7: a change to the edge takes the boundary rules even when its file sits outside the listed
  paths, and the plan marks each row that changes the edge.
- Section 7: code outside the boundary cites, in its plan, the boundary file and line behind each access
  property it relies on. It is tested for its own behaviour only and never re-tests a refusal the boundary
  makes. The `phase-plan` skill's section 3 points each chunk row at this rule.
- Section 7: a gap found in the boundary is fixed and tested in the boundary, never patched in the code
  above it.
- Section 7: an implementation plan's review still runs until approval on every row that touches boundary
  code or its edge. For other rows the overlay may let the plan's author cap the rounds; a finding open
  past the cap becomes a residual recorded in the plan, which the lead's re-baseline takes up. The cap is a
  backstop behind section 10's rule to decide at the depth the decision needs. The phase loop in section 1,
  the definitions of residual and re-baseline, the `phase-plan`, `phase-lead` and `staff-engineer-review`
  skills now say the same. The phase loop and the `phase-plan` skill also now give the PRD review the two
  rounds the `staff-engineer-review` skill already set, where they said it ran until approval.

## 0.1.8

- Section 1, the human principal: the term is for the rule files only. A message says "you" to the
  principal and uses the name the overlay gives, or "they", about them; the status section is headed
  "Waiting on" and that name.

- Section 5, the hook proof: the hooks directory also holds a `pre-merge-commit` running the same bar,
  because git runs it and not `pre-commit` for a merge commit (O, 2026-09-20: every merge since the first
  day landed with no bar, one carrying six typecheck errors; D, 2026-09-21: the same gap confirmed, closed
  by one file and a widened commit-bar test).
- The `co-cto` skill, section 5: a rule's example is optional, at most one, and in words a reader outside
  the project understands; the incident in the project's own vocabulary lives in the commit (O,
  2026-09-21: about thirty rules landed in one day, one carrying five examples in private vocabulary that
  no reader without prior context could act on).
- The `co-cto` skill, section 6: with no threat document, read the tree alone, say so in the claim, and
  record the missing document once (O, 2026-09-21: a repository with no threat document could not
  discharge the rule as written and had been half-ignoring it).
- The plugin now ships eight skills. Four are new: `time-box`, `merge-to-trunk`, `cto-handover` and
  `launch-builder-team-slim`, each a generic core that a repository's own skill of the same name invokes.
  The `staff-engineer-review` skill is new in this release too. The three skills already present are
  `co-cto`, `phase-lead` and `phase-plan`. In the `launch-builder-team-slim` core, the rule on builders
  sharing one database reads as a general rule: builders share one test server, such as a database, that
  only one test run can safely use at a time, under a lock the suites take themselves, and never own or
  configure it; the overlay names the server.
- Every personal name in the rule text of the core and the skills now reads "the human principal": the one
  person the programme answers to and the only source of approvals, defined in section 1 of the core.
  Dated attributions such as "<name>, 2026-09-14" leave the rule text; each rule keeps what it says, and the
  history stays in git.
- Every provenance comment is removed from the core and the skills. These were the HTML comments that
  recorded which repository and which line each rule came from. The prose around each is unchanged; the
  history stays in git.
- Twenty-seven phrases are rewritten in plain words that a reader outside either repository can act on.
  Examples: "no two-tenant fixtures" now reads "no fixtures with two separate owners of data"; a rule
  about "the previous project's directory" now covers any directory the overlay names as closed; an
  observed process mistake is now a "slip" everywhere, where some rules said "sighting"; reviews name
  the `staff-engineer-review` skill in place of "a senior staff review".

## 0.1.7

Five changes adopted on 2026-09-20 after incidents in consuming repositories.

- Core, section 1: the C tag's "cheap" is not a reason on its own; a C row names the failure it catches,
  and a claim the type system already states is a cut (a volume review found rows asserting a
  subset the spread makes true and manifest fields another check reports).
- The `co-cto` skill: the periodic check-in while the human principal is away is a cron job at about seventeen minutes,
  not a habit, created per session and visible in `CronList` (a lead idle nine hours after a landing
  push on the night its phase was to reach merge-ready).
- The `phase-lead` skill, section 11: a landing's push is not the end of the turn; brief the next chunk or
  say in one line that you are stopping (the same incident).
- The `phase-lead` skill, section 9: the brief's clause map names the one case that holds each clause and
  each refusal site, and a mutation that comes back green is a question until somebody can name the
  assertion that should have caught it (two chunks mutating a clause no case held; two rows that
  could not fail, found by a reviewer reading the rows rather than their results).
- The `phase-lead` skill, section 8: before a timed reading every live agent is told to hold, and the
  chunk record says so (two of six worker-bound readings lost; a throughput reading at load 105 that
  priced a decision at nothing and was never retaken).

## 0.1.6

- Section 3, beside the "Waiting on the human principal" rule: an open item keeps its number until the human principal answers it or
  it is withdrawn; new items append with the next unused number, options keep their letters, nothing is
  renumbered. The human principal, 2026-09-19, to one consuming repository's Co-CTO, after an item was inserted at position 1 while the principal was
  answering by number; adopted by both Co-CTOs the same day.
- The `co-cto` skill, section 4: an Opus agent writes every PRD, IMPL and added chunk from the Co-CTO's
  brief, and the Co-CTO reviews the whole draft beside the staff reviewer and still owns it; a token read
  costs about a fifth of one written. The human principal, 2026-09-19, to conserve tokens; adopted by both Co-CTOs.
- The `co-cto` skill, section 1: the Co-CTO runs on Opus 5 unless the human principal says otherwise at launch; and it may
  escalate one piece of work to a sub-agent on the strongest model with the human principal's advance word per spawn, for a
  session caught in a loop, a difficult issue a review has not settled, or a hard architectural decision.
  the human principal, 2026-09-19.
- Section 9, the mechanism rule: a reviewer's request is not a failure, and a request to turn a weak
  assertion into a rule is a cue to ask whether it should exist. The human principal, 2026-09-19, on impact.

## 0.1.5

Two changes adopted on 2026-09-16: one follows incidents in consuming repositories where
residual work had no register entry; the other clarifies an existing comment rule.

- Section 6, the deferral rule: a residual whose subject outlives the phase goes into the register at
  the landing, never into a queue for the AS-BUILT; a landing message is not a register.
- Section 10, the comment rule's "unrecoverable" example: a migration may name the migration whose lock
  or constraint it depends on, because SQL has no import graph and the code cannot get a reader there;
  that is inside the existing rule, not an exemption, and the example stops a reviewer reading the
  pointer as a citation.

## 0.1.4

Three rules adopted on 2026-09-15 after incidents in a consuming repository: one on impact,
two on recurrence. Their reasons are recorded below.

- Only a merge approval and a `[boundary]` change need the human principal's own word in the session that acts on it;
  every other decision the human principal gives the Co-CTO, a debt sign-off included, is acted on the moment it is relayed,
  and a session never blocks on a prompt to the human principal for it. Two incidents on one evening
  (2026-09-14): the Co-CTO withheld a signed debt sprint for a word the rule does not require, and the lead
  blocked on a prompt to reconfirm it; the phase idled about 2.5 h. High impact justified the change. Replaces the reading of
  "a relayed ruling is never an approval" as covering every decision.

Two changes to phase-lead after repeated incidents reported on 2026-09-14:
- A diff that changes a mechanism other code passes through (a result sink, a statement wall, a
  guard), or a value other code parses (an image reference, a version, a key format), names that
  mechanism's or value's readers in the brief and runs the whole suite that reaches them before
  the review closes, not first at the gate (three incidents: a later statement check rejected an earlier
  chunk's output; a shared output refusal broke a probe; pinning an image by digest broke a version check).
- A claim about what a change reaches names the file-and-line chain that was read, or is not made
  (a lead and a Co-CTO each relayed a consumer-path claim on an untraced path in one chunk, costing
  a ruling re-made and a brief re-sent).

## 0.1.3

Five rules adopted by the human principal on 2026-09-14 after incidents in consuming repositories.

- **A third provenance tag, `[inherited]`**, in the core's facts section and in the glossary
  entry for a fact. It marks a fact another project measured on this engine that nothing in this
  repository has confirmed, and a chunk that depends on one measures it first, exactly as it would
  a reasoned fact. Facts now cross between the two repositories, and a reader has to be able to
  tell which of them were measured here.
- **A detector's adversarial forms are written before the detector, and each is shown to go red**
  beside the mutation rules in the phase-lead core. The detector's condition names the
  predicate the rule states, never a path or a name standing in for it. One project shipped four
  boundary detectors that each missed a case a reviewer found in minutes; the other spent two
  review rounds and a re-run of every planted form on three walks.
- **The chunk bar always runs the architecture suite, whatever the diff holds**, replacing
  the clause that ran it only where the diff could move what an architecture test reads. The same
  change is made where the phase-lead core states the chunk bar's contents. A detector whose
  subject is the whole tree imports nothing, so no derivation from the diff will ever reach it, and
  the suite costs seconds.
- **A contract brief for an operation that takes a lock lists every ref the operation reads a head
  from, and says for each whether it is locked**, with the contract briefs in the phase-lead
  core. Two concurrent branch deletes each named the other as the merge target used as evidence and discarded
  a row with no write authority checked, because the witness was read unlocked.
- **Every brief that may run a mutation quotes the restore rule, reviewer briefs included**,
  beside the mutation restore rule. Restore by reversing the edit by hand, never by a checkout. A
  builder in one chunk and a reviewer in another each restored by checkout.

| document | lines at 0.1.1 | lines at 0.1.3 |
|---|---|---|
| `plugins/swe/rules/core.md` | 386 | 391 |
| `plugins/swe/skills/co-cto/SKILL.md` | 114 | 114 |
| `plugins/swe/skills/phase-plan/SKILL.md` | 189 | 189 |
| `plugins/swe/skills/phase-lead/SKILL.md` | 393 | 404 |

No rule was removed.

## 0.1.2

`tooling/machine-lock/` is added beside the plugin: the machine-wide gate lock both repositories
take around a whole integration or mutation run so heavy runs on one machine serialise. Four files,
contributed on 2026-09-14:
`tests/setup/machine-lock.ts` (`acquireMachineLock({ path, session, waitMs? })`, a one-second poll,
a thirty-minute bound that throws naming the path, the holder and the bound, the holder written as
one JSON line with session, pid and time, a dead holder's file replaced), `tests/setup/machine-lock-child.ts`,
`tests/setup/machine-lock.test.ts` (five cases) and `scripts/with-machine-lock.ts`
(`--session <name> <command> [args...]`). Each repository vendors the directory at this tag to the
same paths under its root and takes the lock before its own port lock, releasing after it. The
tooling directory is not part of the plugin; the tag is the pin for both. No rule changed.

## 0.1.1

A review of the four documents by a reader with no prior context, applied line by line. Every line the
read flagged as unactionable, as using an undefined term, as carrying two readings, as over-long or
as missing its reason was rewritten. Thirteen generic rules that were present in a source repository
but in neither the overlay nor the core were recovered. No rule was removed.

**Cold-read lines applied, by file and kind:**

| document | unactionable | undefined term | two readings | over-long | missing why | total |
|---|---|---|---|---|---|---|
| `plugins/swe/rules/core.md` | 2 | 11 | 3 | 2 | 4 | 22 |
| `plugins/swe/skills/co-cto/SKILL.md` | 2 | 4 | 2 | 0 | 1 | 9 |
| `plugins/swe/skills/phase-plan/SKILL.md` | 0 | 5 | 2 | 0 | 1 | 8 |
| `plugins/swe/skills/phase-lead/SKILL.md` | 6 | 5 | 5 | 3 | 0 | 19 |
| **total** | **10** | **25** | **12** | **5** | **6** | **58** |

Two patterns the read found across all four files were fixed as patterns. The definition of
**overlay** moved out of the preamble into section 1. The word **boundary** carried six unreconciled
senses; each now has its own name, and section 1 holds them all.

**Section 1 of the core is now the one glossary**, grouped by subject, and no skill carries a
glossary of its own. Definitions added: overlay; boundary code; ordinary code; the security boundary
(named as the same thing as boundary code); a `[boundary]` decision in a plan (named as unrelated to
boundary code); boundary chunk; landing; re-baseline; the volume review; chunk table; gate; red;
green; green tip; misbehaves; load; capture; PRD; IMPL; AS-BUILT; journey; chunk record; defect
register; deferred-feature register, with the line dividing it from the defect register; debt
sprint; K, C and D, with C's fifteen-minute threshold stated once; mutation; plant; architecture
test; architecture suite; import wall; probe; fact; sweep; contract commit; refusal.

Two further renamings followed from the glossary. The split between two chunks is now called a
split, not a boundary. Boundary code's design is now called closed-by-default, so it no longer reads
as the deny-list that section 8 warns against.

**Thirteen recovered rules:**

| rule | document, section |
|---|---|
| (a) a chunk that repairs a guard mutates that guard | phase-lead, mutations |
| (b) a message asserting two properties is read for whether both can hold | phase-lead, records and landings |
| (c) a contract-commit brief lists every exported shape the plan leaves open | phase-lead, blind authorship |
| (d) a vacuous refusal row is deleted rather than repaired | phase-lead, mutations |
| (e) a `Bin` line in a source file's diff stat is a defect | phase-lead, the chunk bar |
| (f) comments, naming and dead code are residuals by default | phase-lead, review rounds |
| (g) what an admitted name can do, and what can sit under an admitted root | phase-lead, review rounds |
| (h) the lead's own read of the line that builds a narrowing | phase-lead, what a brief may assert |
| (i) a review finding demanding a new test states its tag | phase-lead, the chunk bar |
| (j) write for the human principal in ASD-STE100, with the poster test | core, sessions and what reaches the human principal |
| (k) each retrospective names which rule caught what and which failed | core, sessions and what reaches the human principal |
| (l) the executed input is the checked output, by construction | phase-plan, the two documents |
| (m) the dependency column names a derived subject split across two chunks | phase-plan, the chunk table |

No sentence in any of the four documents now runs past 45 words.

| document | lines at 0.1.0 | lines at 0.1.1 |
|---|---|---|
| `plugins/swe/rules/core.md` | 271 | 386 |
| `plugins/swe/skills/co-cto/SKILL.md` | 111 | 114 |
| `plugins/swe/skills/phase-plan/SKILL.md` | 183 | 189 |
| `plugins/swe/skills/phase-lead/SKILL.md` | 358 | 393 |

## 0.1.0

First cut of the shared core, drawn from two repositories' rules files and skills and from the
classification that paired them. Four documents, 260 rules.

| document | sections | rules |
|---|---|---|
| `plugins/swe/rules/core.md` | 10 | 70 |
| `plugins/swe/skills/co-cto/SKILL.md` | 6 | 30 |
| `plugins/swe/skills/phase-plan/SKILL.md` | 7 | 45 |
| `plugins/swe/skills/phase-lead/SKILL.md` | 13 | 115 |

Nine conflicts between the two sides were resolved before drafting. The ones that change a rule's
meaning rather than its wording:

- The two kinds of code are named, not numbered: "boundary code" and "ordinary code".
- The build starts on the human principal's word naming the build, given after the plans are approved. This gate
  was carried from one side only and now applies to both.
- Two review rounds is the default cap, and a diff that touches the boundary takes the scaled
  rule instead.
- The per-chunk retrospective is its own message to the Co-CTO, not a paragraph in the landing
  commit.
- A blind author's files must reach the branch without the author seeing the implementation and
  without an unrun file surviving; each repository keeps its own mechanism in its overlay until
  one is scripted.
- One name for a planned structural test: "architecture test".

The three core skills carry `user-invocable: false` and a first-line check, so a session reaches them
only through its repository's own skill of the same bare name.
