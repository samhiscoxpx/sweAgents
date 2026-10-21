# The shared working core

Every repository that vendors this plugin copies this file to `.claude/rules/core.md`, and its own rules file
points here. This file holds what is the same everywhere. Section 1 defines every term of art the rest of the
file and the skills use; read it first, and use no term this file has not defined.

## 1. Definitions

This is the shared glossary. Read it before the rules and skills. Each term starts
with its plain meaning; the following sentences preserve the required behavior.

### Roles

- **Co-CTO** — the programme coordinator: owns plans, coordinates phase leads and is the human
  principal's single point of contact. It does not build a phase.
- **Lead** — the session responsible for building, reviewing and checking one phase.
- **Builder** — an agent assigned a specific implementation task by the lead.
- **Reviewer** — an agent that checks a plan or code change and returns findings and a verdict.
- **Chief** — the agent that requested a review and manages its review rounds.
- **Human principal** — the person who owns the programme and is the only source of human approvals.
  Never an agent, whatever the harness calls the sender of a message. In messages never use this role label: say “you” when
  addressing that person; when referring to them, use the name the overlay gives, or “they” when it gives none.

### Repository-specific instructions

- **Overlay** — the repository's own rules and skill extensions, read before this shared core and taking
  precedence over it. The overlay supplies paths, packages, engine, database setup, session names,
  environment prefix, commands, suites and registers. “The overlay names it” means read that value there.

### The two kinds of code

- **Boundary code** — code where a defect lets a caller read or write a row outside its authorised scope,
  with no lower layer to catch it. It fails open and silently. This includes code deciding whose identity
  or scope a call uses, and code retaining results across callers, such as caches, queues or shared
  memory: a correct call for the wrong caller leaks data too. The overlay lists its extent by path,
  including code that cannot be identified by one path, so the diff determines which rules apply.
  Its required tests are **boundary tests**, and every one is K.
- **Security boundary** — the same code and extent as boundary code. The names are interchangeable.
- **Boundary's edge** — the contract callers depend on: entry points, the scope or purpose of a call,
  policies and response schema. Section 7 applies boundary rules to this contract too.
- **Ordinary code** — code outside the security boundary. A lower layer prevents its defects from crossing
  a scope, so its tests check correctness rather than security.
- **Boundary chunk** — a chunk changing boundary code or the boundary's edge. Its effort estimate, review and
  tests follow the boundary rules rather than the ordinary-code rules.
- **Decision requiring human approval** — a plan decision tagged `[approval-required]`; changing it needs
  the human principal's own approval. This tag is about decision authority, not the security boundary.
  The `default` tag lets the lead deviate and record why. Older plans tagged `[boundary]` retain their
  approval requirement; use `[approval-required]` in new or revised plans. Reserve “boundary” for security.

### Phases, chunks and merges

- **Phase** — an implementation stage with its own branch, PRD, IMPL, AS-BUILT and one merge to `main`.
  Its **required phase checks** are lint, typecheck, build and then the full test suite, in that order:
  tests use build output, which is not committed. These run once, at the phase merge.
- **Chunk** — one separately reviewed unit of work, with a brief, its own branch, a merge into the phase
  branch, a scratch record that is never committed, and recorded verification. Its **required chunk
  checks** cover the whole diff since the previous merge into the phase branch. Always run the whole
  architecture suite, whatever the diff holds, and boundary tests for boundary code or the boundary's edge. Do not default to the full
  suite; run every suite the whole diff reaches.
- **Merge into the phase branch**, or **chunk merge** — a merge commit integrating the chunk branch. Its message preserves
  the verification results, mutation results, unresolved findings and reasoning for that chunk.
- **Residual** — an unresolved finding or deferred work, recorded at a merge or the end of a capped plan
  review, with the failure it leaves possible.
- **Merge to `main`** — the checks required by `merge-to-trunk`, followed by the human principal's explicit
  approval naming this merge.
- Nothing smaller than a chunk has a separate phase-branch merge, review cycle, set of required checks
  or record. Inside a chunk there are commits; every commit runs the **required commit checks**: lint,
  typecheck and build. A documents-only change belonging to no chunk, such as a register entry or decision
  record, may be committed directly on the phase branch with those same checks.
- **Phase loop**, in order, skipping no step: 1) Agree scope and name with the human principal and create
  the branch. 2) Write the PRD: requirements, journeys, architecture and open questions, no code; the
  Co-CTO reads it in full. 3) Review the PRD for at most two rounds, stopping on APPROVE; record the final
  verdict and unresolved findings in the PRD. 4) The human principal answers its questions and decides
  those findings. 5) Write the IMPL against that PRD: invariants, decisions, chunk and test tables, never
  function bodies; the Co-CTO reads it in full. 6) Review the IMPL until every row touching boundary code or its edge is approved;
  other rows follow the limit section 7 permits. 7) Build chunk by chunk after the principal explicitly
  approves it, naming the build. 8) Run the final cleanup review, report phase-check results and wait for the
  principal's merge approval. The IMPL waits for step 4: writing it on guessed answers causes rewrites,
  and a PRD defect then costs an implementation plan too.
- **Review of changes since plan approval** — the lead compares the approved plan with everything merged
  to `main` since approval, records deviations in the plan and takes up unresolved findings from capped reviews.
  Changes to decisions requiring human approval go to the Co-CTO.
- **Final cleanup review** — the phase's last chunk: remove duplicate tests, dead code and rules made
  redundant by the implementation.
- **First end-to-end integration chunk** — the first chunk carrying a real caller through one read
  and one write on a path the phase adds. It follows probes and boundary chunks, and precedes other work.
  A path is a new transport, package on the request path, route family or deployed process. A phase adding
  no path says so in its PRD and has no such chunk.
- **Chunk table** — the IMPL table listing each chunk's files, dependencies, verification, time box and
  tests. **Row** means one entry in that table or the test table.

### Checks, results and time

- **Required checks** — the checks needed before a commit, a chunk merge or a phase merge, as defined above.
- **Recorded verification run** — execution of the required checks against a named commit, recording the
  command, exit code, counts and decisive output. Without those results the run is not recorded evidence.
- **Readings** — saved measurements or results, such as clock times, test counts and command outcomes.
  Use the concrete noun in prose. Existing record headings and keys remain compatibility labels.
- **Latest commit whose required checks passed** — the most recent branch commit verified successfully.
- **Invalid run** — a run providing no trustworthy pass/fail evidence. A timeout-only run is invalid,
  with one lead-authorised retake. It is not an assertion failure.
- **Unreliable suite results** — results that cannot be trusted because of a crash, a repeated timeout-only
  invalid run, an otherwise valid run far slower than its previous measurement on the same tree shape (the same files and test structure), or load
  above the overlay's threshold. The lead skill specifies the limits and stop/report procedure.
- **Load** — the machine's load average when a measurement is taken, recorded beside it because other
  sessions affect timings.
- **Capture** — a saved command's complete output, read afterwards and never committed. Never filter live
  output through a pipe: it can hide the exit code and diagnostics.
- **Time box** — the work's wall-clock time limit in hours. At the limit, stop and report progress and blockers.
- **Test environment** — the lead's running database container and port, borrowed by its agents. Renaming
  it does not change its ownership or resource limits.

### Documents and registers

- **PRD** — product requirements document: numbered requirements a test could disprove, journeys and
  architecture, without code.
- **IMPL** — implementation plan: invariants, decisions, chunk table and test table; never function bodies.
- **AS-BUILT** — completion report written from the tree and chunk records: what shipped, changed or was
  deferred. When it disagrees with the plan, the completion report wins.
- **Journey** — a numbered acceptance path a consumer or agent performs, naming each interface it crosses.
- **Chunk record** — working notes in the worktree's scratch directory, kept for the phase and never committed.
- **Defect register** — dated entries of broken behavior, grouped by state. **Deferred-feature register**
  records missing work in the same way. The overlay names both files.
- **Debt sprint** — one time-boxed phase-end effort to build deferred tests and fixes, called by the human
  principal or Co-CTO.

### Tests, checks and evidence

- **K, C and D** — plan test categories. **K** proves an acceptance criterion or security-boundary
  rejection; all required boundary tests are K. **C** takes under fifteen minutes to write at unit level,
  but must catch a named failure not already ruled out by the type system. Approved K and C rows are
  built. **D** is everything else, deferred and logged as test debt with the failure it would catch.
- **Mutation** — deliberately deleting or inverting one guarded condition, observing the predicted test
  assertion fail, then restoring the code exactly. This demonstrates that the test detects that defect.
- **Adversarial input** — a hand-crafted input or fixture designed to challenge a check. Unlike a code
  mutation, it tests an input the design may not have anticipated.
- **Vacuous test** — a test that passes without detecting the failure it claims to guard.
- **Architecture test** — a check of code structure rather than product behavior. One test checks one
  rule. The **architecture suite** collects these tests; each is planned with the silent security failure
  it catches.
- **Restricted imports** — build rules and architecture tests preventing an unapproved package from
  resolving a dangerous client, connection or handle, so the unsafe import fails to build. Allowlists live in one **architecture config
  file** named by the overlay; `architecture-guardrails` describes the implementation.
- **Syntax-tree analysis** — using a language parser to enumerate code structure, rather than matching text.
- **Probe** — a script checking a claim against the actual engine, driver, cloud or toolchain.
- **Platform fact** — a statement of observed or expected platform behavior with one provenance tag.
  **Verified** means a probe ran it in this repository. **Reasoned** means documentation or inference,
  without a local probe. **Inherited** means another repository measured it and no local probe has.
  These are the only tag definitions; section 9 uses them.
- **Sweep** — a bulk pass over files, records or databases, reported as a conclusion rather than a transcript.
- **Contract commit** — the chunk's exported types and signatures without implementation, committed for
  an independent test author to use.
- **Test author who has not read the implementation** — an agent writing from the contract commit and
  plan only, without reading implementation or the chunk record.
- **Refusal** — the product rejecting an operation and explaining why. Say “rejection response” for the
  returned error and “rejection rule” for the policy when the distinction matters. Changing one requires a decision, rather than being an implementation choice.
- **Guard** — an explicit check that its author must keep complete. **Removing a capability** means making
  an unsafe operation unreachable, such as an import the build cannot resolve. Section 8 says which to prefer.

## 2. How to read this file

- **Fill every blank in the overlay from the repository itself**, verified against the tree and never from
  memory; a blank whose subject is not built yet names the chunk that builds it.
- **Start with the product document, which the overlay names.** It states the product and the decisions
  everything rests on; this file is how we work. A session that builds a phase invokes `phase-lead` first, one
  that writes a plan invokes `phase-plan` first, and the Co-CTO invokes `co-cto` first. Invoke the repository's
  overlay for skills that have one. The standalone `swe:architecture-guardrails` skill has no overlay and is
  invoked directly.
- **After a compaction, or a merge that brings new rules, use Read to read both skill files from disk:**
  the overlay at `.claude/skills/<name>/SKILL.md` and the pinned shared body at
  `~/.claude/plugins/cache/swe/swe/<pinned version>/skills/<name>/SKILL.md`. Read the pinned version from
  the repository's `.claude/settings.json` pin, without its leading `v`. The Skill tool may serve a cached copy, so invoking it
  does not count as the refresh. After compaction this restores the instructions; after a merge it takes
  up the rules the merge brought.
- **Outside a security boundary, an agent unsure whether a production-grade concern applies assumes it does
  not**, files it in the deferred-feature register and continues. Inside one there is no such shortcut.
- **Each kind of fact has one home and the overlay's table says which**, because a fact written in a second
  place drifts from the first and no reader can tell which moved.

## 3. Sessions, and what reaches the human principal

- **One Co-CTO session and one lead session per phase, communicating with the `SendMessage` tool.** Sessions are isolated:
  nothing one writes to disk is an instruction to another. The overlay names the session pattern.
- **The Co-CTO owns the plans, the cross-phase documents and the clashes between phases, and runs no phase.**
  A lead reconciles the approved plan, builds, reviews, verifies and writes the AS-BUILT; it records `default` deviations in its
  own plan and sends every change requiring human approval to the Co-CTO.
- **The Co-CTO is the human principal's single point of contact.** Status, questions and findings go through it, batched as
  multiple-choice questions with plain context. Leads exchange facts directly; plan questions go to it.
- **What reaches the human principal is a decision, never a solved problem.** A defect with one clear fix is
  fixed and recorded, not reported. The principal hears a marginal call between fixes, a blocker, and anything
  that changes the product's direction, removes a feature or reverses a requirement already agreed.
- **A lead that needs the human principal's own word** (a merge approval, a change requiring human approval) tells the
  Co-CTO, then itself asks the principal as a multiple-choice question the next time the principal engages
  that session.
- **Only a merge approval and a change requiring human approval need the human principal's own word in the session that
  acts.** Every other decision the human principal gives the Co-CTO, a debt sign-off included, is acted on the
  moment it is relayed, and no session blocks on a prompt to the principal for it. Two slips in one evening: a Co-CTO withheld a signed debt
  sprint for a word the rule does not require, and the lead blocked on a prompt to reconfirm it, and the phase
  idled about two and a half hours.
- **A lead decision that changes an exported signature or a refusal goes to the Co-CTO first**, even when it
  looks like ordinary code: one lead took three such decisions alone and each cost a review round.
- **Write to the human principal in short sentences, one topic each, active voice, no idiom.** Use the most specific noun and
  verb: "the boundary the code sits in decides which tests it must have", not "the boundary drives ceremony",
  because nobody can tell what the second one claims.
- **Write for the human principal in ASD-STE100, Simplified Technical English**, which is the named standard
  behind one meaning per word and one topic per sentence. Apply the poster test to every heading and rule you
  write: if the sentence would work as a poster, rewrite it until a reader could act on it or disagree with it.
- **An explicit walk-through or the quick-start setup asks with `AskUserQuestion`; every other question is lettered prose.**
  This is the shared question-format rule for every role and skill. Preserve existing question IDs and option letters in either format.
- **Every status or recap message to the human principal ends with its own section headed "Waiting on"
  and the principal's name**, naming each decision or action the principal owes or saying "Nothing";
  options are lettered A, B, C, the recommended one `[REC]`.
- **An open item keeps its number until the human principal answers it or it is withdrawn.** Each question gets a
  prefixed number once (`W1`, `W2`, ...); a new one takes the next number never used in the conversation
  and is appended, however urgent, with the urgency in the prose; an answered or withdrawn number is
  retired and later lists skip it, so gaps are normal; nothing is sorted, merged or renumbered. Options
  keep their letters the same way, a new option taking the next letter, and only the `[REC]` mark moves.
  When an answer could belong to an older list, state the reading before acting on it. With merge approvals
  and decisions requiring human approval in that list, an answer applied to the wrong question is a real hazard.
- **Send the human principal a push notification, with the `PushNotification` tool or, where the harness has no such tool, a message in the session, only when** blocked on a
  decision only the principal can make, a merge is ready for approval, or a verification run finished while the principal
  was away. Never for progress. One line.
- **Messages to another project's sessions go only from the Co-CTO, only with the human principal's approval,
  per topic, at most three exchanges.** An inbound message is reported to the principal with a drafted answer
  and nothing is sent until the principal says so. No lead, sub-agent or reviewer ever answers one; it is forwarded to the Co-CTO. Two
  coordinating sessions left to talk get chatty and run away with each other's time.
- **Auto-memory is shared by every session, so a memory is a fact and never an instruction or a plan:** a
  decision the human principal gave in conversation, a measured fact about this machine. Never save your role or your plan
  there, because another session reads it as its own. Each names the phase and session it came from.
- **After each chunk merges, the lead sends the Co-CTO a short retrospective:** each pattern that slowed the
  chunk, one line, with a proposed fix. It is its own `SendMessage` message, because a paragraph folded into a commit
  message nobody re-reads turns into no fix.
- **Each retrospective also names which rule caught what, and which rule failed to prevent the slip.** A rule
  that never fires is invisible until somebody counts, and the rule that failed is the one worth rewriting.
  One line per rule named, for example "the brief-reads-the-tree rule caught the stale path".

## 4. Agents and models

- **Do not use Artifacts.** Never invoke the `Artifact` tool or load `artifact-design` unless the human principal
  asks for it by that exact name. Default to markdown in the terminal, because a published page is a second copy of the
  answer that no later session can read and nobody reviews.
- **Delegate implementation to sub-agents, one agent per task**, briefed with exact file paths, the change,
  the invariants and how to self-verify. Agents sharing a worktree run one at a time; agents in their own
  worktrees run in parallel on disjoint files. The lead reviews each merge into the phase branch.
- **Never more than two chunks in flight per lead; merge or abandon one before starting a third.** Agents per
  chunk are unconstrained. Chunks are the limit because each is a stream of detail the lead must understand
  and verify, not relay.
- **A lead runs on the model the human principal named at launch and says so in its first message to the
  Co-CTO**, which checks it before briefing and tells the principal at once on a mismatch. A lead launched on the strongest model by
  accident ran a phase's close on it before anyone looked.
- **Sub-agent models are pinned, never inherited:** the cheaper capable model for recon and well-scoped
  implementation, the stronger one where surprises are expected, the strongest only with the human principal's
  advance approval per spawn. The agent's name ends in its model and its first message states it.
- **Every piece of work runs under the `time-box` skill.** The estimate is often wrong; the point is that at
  the time box the agent stops and raises instead of iterating. A suite producing unreliable results is a stop before the time box.

## 5. Worktrees and the shared machine

- **Never work on `main`.** Run `EnterWorktree` (never `git worktree add`), `git switch -c <branch> main` on
  the clean new tree, the workspace install with the frozen lockfile, the work, then `ExitWorktree`. Use
  `git switch -c`, not `git reset --hard`: a permission check can refuse the reset, and a builder stopped by
  it once lost its setup. The install is not optional: worktrees resolve installed packages upward, so a
  missing install passes imports, lint and typecheck and appears later as unrelated-looking toolchain
  failures. Create a fresh branch per unit of work off local `main`, never the remote's, which may be far
  behind. Confirm `git branch --show-current` does not print `main`. Merging to `main` is a scripted recipe:
  use the `merge-to-trunk` skill, never improvise it.
- **The agent tool rewrites the shared hooks path at every isolated spawn**, so a worktree finds no hook or
  runs the main checkout's copy and a commit completes in silence. Before its first edit every agent sets that
  path back to the repository's own relative hooks directory, which the overlay names by its exact value, and
  proves the hook in its own worktree with `git hook run pre-commit`, and the repository's hooks directory holds a
  `pre-merge-commit` that runs the same required checks, because git runs that hook and not `pre-commit` for a merge that
  creates a commit: one repository made every merge from its first day with no lint, typecheck or build, and
  a merge brought in six typecheck errors unstopped. A lead does both again after every spawn
  and before every verification run. The proof is per worktree and per commit, never per session, because any spawn by
  anyone rewrites the value.
- **Only a lead session launches a container**, and takes it down when done. A sub-agent never launches one
  and never writes an environment file; it borrows its lead's test environment. A second container answers on a port some
  other session's suite is already using, and both then read each other's database state.
- **Never `git checkout` a file another agent may have uncommitted work in.** Commit a work-in-progress or
  confirm the tree is clean first.
- **Never kill a process by name.** Every session's server and test runner is the same kind of process on this
  machine, so a name match kills them all. Find the process id holding your own port and kill that.
- **Stage files by name, never a blanket add.** The human principal edits documents in an editor while a session runs, and a
  blanket stage once swept an uncommitted 497-line section into an unrelated commit. Check the short status
  first; if a file this session did not touch is modified, leave it and say so.
- **Read the hazards file, which the overlay names, before diagnosing a failing run that looks unrelated to your
  change.** It holds engine quirks, tool blind spots and the cost of a shared machine.
- **A directory the overlay names as closed is not opened without the human principal's explicit approval:**
  not read, listed, grepped or copied from, and neither is its git history. Agents copy the patterns they
  read, and a directory is closed because its habits are ones this repository must not repeat. A session that
  wants to look asks the Co-CTO, who puts it to the principal; a sub-agent never goes there at all, and no
  pattern is copied from it without being measured here first.

## 6. Verification runs and shipping

- **Every merge to `main` requires the human principal's explicit approval, given after the required checks are reported as passing and
  naming this merge.** No standing instruction confers it: not "finish this off", not a plan approved earlier,
  not an "ok" to a status update. It comes from the principal directly, never relayed and never inferred.
- **The build starts on the human principal's word naming the build, given after the plans are approved**, and never inferred
  from a planning instruction, a launched session or an earlier phase's word; one phase was built without it.
  Branch creation, the test environment, the review of changes since plan approval and the probe are pre-build work and need no such word.
- **`--no-verify` is forbidden**, with no exceptions. The required commit checks are the point; fix the cause.
- **A test must detect the failure it claims to guard.** Mutation demonstrations are compulsory for boundary
  tests and for mutations a plan names explicitly. An ordinary test needs one when a reviewer suspects a
  vacuous assertion. Apply the edit, run the test and restore the edit under the lead skill's mutation rules.
- **Missing test infrastructure is a prerequisite chunk**, told to the Co-CTO first. Never a manual checklist
  standing in as the plan, never "TODO: add tests later".
- **A run whose every failure is a timeout is invalid, not an assertion failure.** The lead may retake only the timed-out files,
  once, alone, at a quiet moment. A second invalid run on the retake means the suite produces unreliable results: stop, record the
  reading and report to the lead, who tells the Co-CTO. Other signs of a suite producing unreliable results still require a
  stop under the lead skill. Never re-run a suite for a better pass or a better number, or wrap one in a loop.
- **Default is to ship.** Implement now unless blocked by a decision only the human principal can make, an unsafe security
  path, an interface you do not understand well enough, or missing test infrastructure. A deferral is logged
  in the defect or deferred-feature register as `- [phase N, date] description` under the heading for its
  state, moved when the state changes, closed with a dated note rather than a rewrite. Never a comment.
  A residual whose subject outlives the phase goes into the register at the merge into the phase branch, never into a queue
  for the AS-BUILT: a chunk merge message is not a register, and one phase's close carried ten residuals with
  no register home until its debt sign-off.
- **Fix or record pre-existing defects:** a pre-existing failure, lint error or piece of dead code is fixed in-branch or filed in
  the defect register with its root cause. Never "pre-existing, ignoring". A sub-agent files it and tells the
  lead, who decides whether the chunk absorbs the fix.
- **Each phase has a PRD, an IMPL and an AS-BUILT**, the last written at close from the tree and the scratch
  records and never rewritten to match the plan; where they disagree the as-built wins. A chunk record is
  working state, not a document: it lives in the worktree's scratch directory for the phase and is never
  committed, and neither is a capture. What survives a chunk is its merge commit's message, which carries
  the readings, the verification run table, the mutation table, the residuals and the reasoning.
- **The IMPL tags every wanted test K, C or D and sets a time box on every fixture.** A chunk builds its K and
  C tests and logs its D tests as test debt. At the phase end the human principal and the Co-CTO sign off that debt before the
  merge, with one debt sprint on offer.

## 7. The two kinds of code

Section 1 defines boundary code and ordinary code. The diff decides which tests a change needs, not judgment.
The two are named and not numbered: a number has to be looked up, and a reader who meets "the boundary"
already knows what it means.

- **Boundary code takes the closed-by-default design plus the boundary tests**, at every merge into the phase branch and at the
  merge. Closed by default means an input form is refused unless it appears on a list of admitted forms, which is
  the allowlist section 8 asks for and not a list of forbidden ones.
- **Ordinary code gets happy-path tests plus a regression for a defect actually observed.** No fixtures
  with two separate owners of data, no adversarial forms, no mutation requirement. Test effort there buys
  correctness and not security. Spend accordingly.
- **The boundary's edge counts as inside the boundary.** A change to the edge takes the boundary rules, even
  when its file sits outside the paths the overlay lists. The plan marks each row that changes the edge.
- **A phase runs its chunks in this order: probe chunks, boundary chunks, the first end-to-end integration chunk if the phase has one, the
  other chunks, a final boundary chunk if needed, and the final cleanup review.** The first boundary chunks build
  every new entry point into the boundary that the plan foresees, each naming the later chunk that calls it,
  so the later chunks only call those entry points and stay ordinary code. A later chunk may carry boundary
  work the plan names for it, where that work cannot come before the code it tests, and it takes the
  boundary tests. A later chunk that does boundary work the plan missed, or changes code a boundary chunk
  built inside the boundary, takes the boundary tests, and its lead tells the Co-CTO; a later change to
  code outside the boundary stays ordinary. The final boundary chunk removes boundary code the phase made
  redundant and any new entry point no chunk called, and does the boundary work that could wait: which
  credential a call presents, state shared between callers, and what an error shows. It is dropped when it
  has nothing to do. **No phase merges, and no branch deploys, with deferred boundary work still open.**
  Boundary work spread through a phase takes the full review in every chunk it touches, while grouped at the
  two ends it is reviewed twice.
- **Code outside the boundary cites the boundary and never re-tests it.** For each access property that code
  relies on, its plan names the boundary file and line that provides it. The citation lives in the plan,
  never in code or comments. The outside code is tested for its own behaviour only. It never re-tests a
  refusal the boundary makes, because a second copy of a boundary test proves nothing new and drifts from the
  first.
- **A gap found in the boundary is fixed and tested in the boundary**, never patched in the code above it. A
  patch above the boundary leaves the gap open to every other caller.
- **The boundary is defined in one machine-readable file that the repository's tooling reads**, and the
  overlay names that file. No document restates its list; a document that needs the boundary points to the
  file. A change that adds code inside the boundary updates the file in the same change, and both the brief
  and the review ask whether it did. A list written out a second time drifts from the first, and nothing
  tells a reader which one moved.
- **An implementation plan's review runs until the reviewer approves every row that touches boundary code or
  its edge**, because builders follow an approved plan and a hole in it becomes code. For every other row, the
  overlay may let the plan's author cap the review rounds; the author states the cap in the review's briefing.
  A finding on a capped row that is still open past the cap becomes a residual, recorded in the plan, and the
  lead's review of changes since plan approval takes it up. The cap is a backstop. The first rule is section 10's: decide at the depth
  the decision needs, and stop.
- **Architecture tests are planned:** each is named in an IMPL with the silent failure at the security
  boundary it catches, and approved with the plan. An agent that wants one mid-build raises it to the Co-CTO
  and never adds it, and one the plan did not name does not merge. An architecture test is for drift no reader
  would notice, so do not write one for drift the next commit's reader would see anyway.
- **Pick the most robust solution genuinely on the table.** Coding agents make doing it right cheap, so the
  justification needed for a weaker approach is substantial; but do not invent unbounded scope or speculative generality either. Take
  a shortcut only when the clean solution is out of scope this session, then name it and file it.

## 8. Failing closed

- **A `catch` may return a deliberate, safe-looking value only when it narrows on the one error that value is
  the right answer for**; every other error propagates. The tell in review is a `catch` with no error
  inspection above a value a reviewer would call correct: ask what else reaches it. A swallowed connection or
  permission error becomes "no rows", which looks exactly like enforcement working.
- **A catch on a database error narrows on more than the error code.** One engine reports every unique
  violation under one code, so a catch on the code turns a key collision into "this name is taken" and sends
  the caller to change a name that was never the problem. Narrow on the constraint name the migration
  declares. Where the engine leaves that field empty, parse the name out of the message with a parser that
  tolerates the text changing. On a parse that finds no name, give the generic refusal and log the raw
  message.
- **Remove the capability, do not add a guard.** A guard fails open on the case you did not think of; a
  removal makes the unsafe operation unreachable by construction, so it fails closed and needs no discipline.
  A guard is defence in depth on top of a removal, never the primary boundary. Write down every removal, or it
  is as invisible as a guard.
- **An enforcement mechanism derives the files, packages or inputs it checks from structure** (the schema, the package's export
  list, a table of rules the code itself reads, the parsed tree), never from a hand-kept list, and fails
  closed on anything it does not recognise. Allowlists over denylists: a denylist permits
  everything not written on it, so a new member is permitted by default. Where a hand-kept list is unavoidable, a second check fails when it disagrees with derived reality. Ask of every check what its
  set of checked items comes from; if the answer is a person, ask what fails the day it is wrong.
- **The set is the tree, never a tool's idea of what is committed, and widening a hand-kept list is never the
  fix.** A whole-tree detector that listed only tracked files could not see the suite's own untracked tests,
  so two cases passed without detecting the defect until the files were committed. A chunk that expands the files or inputs a guard checks lists the forms the new subjects use and mutates each.
- **This governs security boundaries, not product scope.** Do not enforce a product decision by construction
  and turn a reversible choice irreversible.
- **The overlay's data-access rules are required for correctness**, and hang below this
  line, written for the engine and package the overlay names. Where the engine has no row-level security an
  unscoped query does not throw or log: it returns plausible rows and passes review, so the design makes the
  mistake unwriteable rather than caught.

## 9. Facts and provenance

- **Record every platform fact with its tag, as section 1 defines the three tags.** Read the vendor's
  documentation first, then run a probe, because the documentation says what should happen and the probe
  says what does. A fact may be recorded as reasoned or inherited, but no chunk builds on it until a probe
  has run it here and its entry says verified.
- **A phase's probes run in its probe chunks, which come first (section 7).** A fact the plan did not foresee,
  found mid-phase, is probed in the first chunk that depends on it, inside that chunk's time box, and its entry is
  updated from the committed probe report.
- **A dependency's promise about its own product is checked once, not on every use.** For example, "the data
  library returns only the rows a handle may read". The consuming repository keeps one sanity suite against
  that promise, in one place, and that suite is the promise's probe. Plans cite the promise and the suite;
  they do not re-test the promise on every query form, because a second copy of the owner's tests drifts
  from them. A gap the suite finds goes to the dependency's owner, who fixes it in the dependency's own code.
- **Measure our own mechanisms before trusting them.** A claim about one of our own checks or mechanisms, such as "this check finds
  every table a query writes", counts only after a hand-crafted adversarial input or a mutation has shown it fail. Write the
  falsification criterion first: name the observation that would kill the claim, then build it. For that
  check, the criterion is a query that names a table in a form the check does not recognise. Our own code is
  more suspect than the engine, because nobody else has run it.
- **A mechanism outside the boundary merges only with the observed failure it closes, named with its date and
  record.** This governs added rules such as lint checks and architecture tests over ordinary code;
  "none observed" is rejected during review. It does not govern boundary tests, the architecture tests that guard
  boundary code included: those exist to refuse hostile inputs nobody has sent yet. It does not govern the
  removal of a capability either, which needs no incident. A reviewer's request is not a failure, and a
  request to turn a weak assertion into a rule is a cue to ask whether the assertion should exist at all. No
  syntax-tree analysis can prove that everything which should not exist in the repository is absent.

## 10. Writing code and documents

- **Enumerate code structure with a parser.** A fluent-builder call spans lines, and a text match silently
  returns a smaller answer that looks complete. Grep is for text: captures, tags, records.
- **Decide at the depth the decision needs, and stop.** A design document records what is expensive or
  irreversible to get wrong. Would being wrong here cost a migration, or an afternoon? An afternoon means stop
  writing and go build it.
- **State the document's decisions and procedures completely.** Reference authoritative definitions, lists
  and configuration at their single home rather than copying them. Delete superseded text rather than
  leaving it beneath a correction.
- **A document that describes the security boundary is checked claim by claim against the exported public API,
  and every absolute word is a claim.** Read only, never, always and cannot against the signatures the package
  exports, asking who else can reach this behaviour, never against the function's own comment, which states
  the rule the code intends and not the rule the public API enforces. One consumer document had eleven of its
  twenty-one absolute claims wider than the code in its first draft.
- **A comment explains why.** It is allowed only for **an unexpected fact** (a competent reader would not
  predict it; if the strangeness is ours, fix the defect), **a prior incident**, or **a fact that cannot be
  inferred from the code**. State it in the comment's own words: no signposts, no citations, and no requirement identifiers
  anywhere in code, comments, strings, errors or test names. A fact that cannot be inferred from the code may name a thing the
  reader cannot otherwise reach: a migration names the migration whose lock or constraint it depends on,
  because SQL has no import graph; that is inside the rule, not an exemption, and a reviewer does not read
  the pointer as a citation. Exempt: a doc comment on an exported symbol,
  which carries its contract, and code whose subject is a document or a probe. History goes in the commit
  message and rationale in a document, and a comment narrating a review fix is a defect.
- **A review finding is closed by the cheapest evidence that closes it**, never by a comment and not always by
  a test. The forms, cheapest first: the commit where the diff is correct by inspection, a command output
  quoted in the record, a mutation on an existing test, and a new test last. The reviewer names the form.
- **Imports at the top of the file, always**, because an import inside a branch or a `try` turns a missing
  dependency into a silent fallback at run time instead of a failure at load. **No hidden fallback that
  supplies a default for a missing key; fail loudly**, because the default is indistinguishable from a real
  value in every log afterwards. **No emojis in code, ever**: they carry no meaning a reader can act on and
  they break the tools that read the file as bytes.
- **Test suites run fastest first: unit, then integration, then architecture.** A failure in the fast suite is
  usually the same failure the slow one would take twenty minutes to show you. The overlay names each suite's
  command and where its files live.
- **A claim about somebody else's work is not a finding until it is checked.** Sessions are isolated, so
  inference is the only tool to hand; check anyway, by asking the session that owns it or running the one
  command that settles it. Read a phase's public APIs on its branch until it merges; after it merges, diff the
  range the claim was verified against, base to head at the time of verification.
