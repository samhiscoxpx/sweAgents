---
name: phase-plan
description: Shared core for writing a phase PRD and IMPL. Invoked by the repository's own phase-plan skill; do not invoke directly.
user-invocable: false
---

# Phase plan, shared core

If you reached this skill by invoking `swe:phase-plan` yourself, stop and invoke the repository's
`phase-plan` skill instead; it invokes this one and holds the repository's own rules.

This is the shared core; the repository's own skill of the same bare name holds its overlay and was
read before this.

## 1. The two documents

- **Two documents, one author, in the order the core's phase loop sets**: the PRD is written,
  reviewed for the rounds the `staff-engineer-review` skill sets, and reviewed by the human principal
  before the IMPL is written; the IMPL is then written and reviewed for the rounds the core's section 7
  sets. Two phases wrote both documents in one sitting and put the PRD's questions to the human
  principal after the IMPL existed, and the IMPL was edited to each answer under review.
- **Features and requirements, numbered, each stated so a test could fail it.** No code. Every
  failure a consumer can see is listed as an outcome, because ordinary code gets one test per
  outcome the plan names and none for an outcome it does not.
- **Acceptance as two or three end-to-end journeys** a consumer or an agent performs, each step
  naming the interface it crosses. They are the phase's claim, and the AS-BUILT reports each step as
  met, deviated or deferred, so write them as steps and not as prose.
- **Architecture and interfaces: what exists, what changes, and where the security boundary moves.**
  Every capability that crosses the security boundary names both ends and the path between them,
  because a capability admitted at one layer and stopped at the next is the commonest gap.
- **Where a check guards something another component executes, the plan says the executed input is
  the checked output, by construction.** Two readers of one input drift apart, and the gap between
  them is the hole: one verification run was planned as a syntax-tree analysis beside the compiler, and the first review built
  four trees the syntax-tree analysis read one way and the compiler another.
- **A check that reads a structure by the position of its parts names, for each container on the
  path, what the executing component does with a part of any kind in that slot, and its test rows
  insert a part of the wrong kind in each such slot.** A rule that reads a slot by the kind it expects
  is passed by a hand-built part of another kind that the executing component writes out anyway.
  One phase met this three times, and each time an adversarial input found it, never the plan.

## 2. The facts a plan rests on

- **Every platform fact carries its provenance tag as defined in the core's section 1.**
- **A plan that rests on an unmeasured fact names the chunk that measures it.** Where the plan rests
  on a reasoned fact, chunk zero is the probe; the boundary chunks follow it, and a first end-to-end integration chunk, where the
  phase has one, comes after them.
- **A first measurement of a mechanism runs the code that ships, never a fixture that imitates it,
  and a measurement whose claim is "X happens" names the control that shows X's preconditions held,
  in the same row as the reading.** Four measurements of one path presented a fixture's integer
  identifier and so never showed that the engine refuses the string the shipping code generates; and one
  merge reading counted a fast-forward as a clean merge because no control showed the two sides had
  diverged.
- **A measurement of how the engine resolves a name** (a reference, a table, a database, a function)
  **includes a letter-case variant and a prefix variant as controls.** One phase measured an
  absent-reference refusal and found case-insensitive resolution mid-build, which opened two leaks.
- **An invariant that asserts engine behaviour names the recorded platform fact it rests on and the
  login that fact was measured as.** One that names no recorded fact becomes a measurement, and one
  measured as a different login becomes a measurement in chunk zero: an invariant rested on a form
  measured as the superuser, where an ordinary login is refused the read outright.
- **A plan's list of facts it takes from another branch names each fact's file and line on that
  branch**, and the lead verifies every row against that branch by a command before building, never
  against the plan that describes it. One such check of eight rows found a stale comment three
  readers had passed, and the same check a day earlier found a fact tagged measured that no test in
  the tree had measured.

## 3. Invariants and interfaces

- **Invariants and decisions, never function bodies.** The test for every line: could the builder
  choose wrong without it? Tag each decision `default`, where the lead may deviate and record it, or
  `[approval-required]`, where a change goes up to the human principal.
- **If the plan lists the parts of an interface, it says which chunk uses each part.** A part no
  chunk in this phase uses is not in this plan; it goes into the plan of the phase that needs it.
  One plan listed eight parts of one interface, and the two no chunk used became test debt and then an
  unplanned chunk.
- **An allowlist names its derived counterpart in the same line, and a claim that a capability is
  absent names every form the engine offers for it** and says why each form it leaves out is safe.
  One plan confirmed a record unwritable by one statement kind alone and checked only the roles
  granted to the login itself; a reviewer got through with a second statement kind, then with a
  grant to the public role, and each rule needed a second widening.
- **An operation that hands a caller a library object lists which of that library's methods the
  caller can reach through it**, and says for each whether it is admitted, refused or removed. Two
  operations each handed out a query-builder instance, and three of its methods appeared mid-build
  as routes the plan had not named, one decision round apiece.
- **A chunk row names every capability the chunk must add to the layer beneath it**, the data-access
  layer the overlay names, and never only the feature that uses them. One builder read its row as
  though the verification path already existed, and extended that layer inside its own time box.
- **Every chunk row shows the two things the core's section 7 asks of a plan:** whether the row
  changes the boundary's edge, and, for a row outside the boundary, the boundary file and line behind
  each access property the row relies on.
- **A plan that lists what the code contains pastes a parser's output, never a text search's.** One
  routine list came from a text search, missed a call a compiler node carried, and a builder found
  it mid-chunk.

## 4. The chunk table

- **Chunks are estimated, not defaulted.** A split between two chunks must buy parallelism,
  validating an implementation pattern before the hard part, or a separate security review; a forced sequence is one
  chunk. Each row names its files, its dependencies and its verification run, and rows with disjoint file sets
  are marked so the lead can run them in parallel worktrees.
- **Where two chunks move the two ends of one derived subject, the dependency column names that
  subject**, so the split is planned and the second chunk's brief carries the join. One phase put the
  code that builds a set of test inputs in one chunk and the list those inputs must match in another,
  with a single test standing between them.
- **Split a chunk only when its de-risking, parallelism or review value exceeds the extra overhead:**
  a brief, builder, review, verification run and merge into the phase branch. Fifteen chunks across two phases took 23 to 105 minutes each,
  regardless of their time boxes. Chunk count is the main cost lever.
- **Every chunk row carries a time box in wall-clock hours, estimated by the chunk's kind from the
  measured elapsed time of past phases, never from how large the work feels.** A time box estimated by feel is five
  to eight times what any chunk takes and never fires. The time box is the 90th percentile of actual duration for
  its kind, so it fires on about one chunk in ten, which is what a stop signal is for. Each merge into the phase branch
  reports actual duration against it; a chunk past its time box is reported, not absorbed.

  | kind | time box |
  |---|---|
  | ordinary chunk, any kind | 1 h |
  | boundary chunk, estimated for two review rounds | 2 h |
  | probe | 15 min plus 5 per fact |
  | any chunk | never under 30 min |
  | a row carrying a state machine | 2 h, or split at plan time |

- **That table is provisional.** It was derived from two phases of one repository and adopted for
  the others before any of their phases had merged. Re-derive it from the author dates of this
  repository's own chunk merge commits when a phase's actual durations fall outside it, and say so in the plan.
- **The phase estimate is the critical path in wall clock, not the sum of the time boxes**, stated on the
  day the plan is approved; parallel chunks overlap, and one phase's 13.5 hours of combined time boxes merged in 7.3.
- **The chunk table gets a second pass before review**, weighing complexity per chunk against the
  phase's total. The pass asks of each split which of the three things it buys, and whether that is
  worth an hour of overhead. It merges every forced sequence into one chunk. It checks that no chunk
  has grown too large for a review to read in one sitting. It is recorded in one line: rows before,
  rows after, and which splits were merged and why. One first table of eleven rows came out at eight
  and saved three chunk merges.
- **The pass runs again whenever a row is added, split, merged or moved after it**, before the edit
  is committed. One table was edited four times after approval, and each edit that skipped the
  re-read cost a review round.
- **The pass reads the dependency, parallel and file columns as one set, not only the rows
  touched.** A row moved out of sequence changes what can run beside what, and two rows marked
  parallel must name no file in common.
- **A row amended at a merge into the phase branch is re-read against the invariant it implements before the merge into the phase branch is
  committed**, for the same reason.
- **A phase that adds a path a caller crosses has a first end-to-end integration chunk, as the core defines it, and a phase that adds
  none has no first end-to-end integration chunk.** The PRD names the new path, or says there is none. The first end-to-end integration chunk is the first chunk
  the new path can carry: after the probe and the boundary chunks, which build the entry points it
  calls, and before every other chunk, so a wiring gap appears as early as the path exists and not in
  the last chunk. A first end-to-end integration chunk in a phase that only adds behaviour along paths already carrying callers tests
  no new wiring and is a chunk that proves nothing.
- **The table's rows follow the core's chunk order: probes, boundary chunks, the first end-to-end integration chunk, the other
  chunks, a final boundary chunk if needed, the final cleanup review.** Each boundary row names the later row
  that calls each entry point it builds. A later row that carries boundary work names that work and
  says why it cannot come earlier. The second pass checks the order, and a row that moves out of it
  says why in the same line.

## 5. The tests the plan names

- **Name every test the phase wants and tag it K, C or D**, as section 1 of the core defines those
  three tags. The plan says which tests the chunk builds, K and C, and lists the D tests as debt
  with the failure each would catch.
- **The tests the boundary requires are K by definition**, not a judgment made per chunk.
- **A test that spawns a process or opens a database is K, or it is not in the plan.** Those tests
  are the expensive ones, so the plan decides them rather than a builder.
- **The boundary tests for a new entry point are named per entry point, by reference, and written by
  an agent that has not read the implementation.** A refusal decided in process from the arguments
  or the restricted database connection's own state is a unit case the builder writes, and the independent
  test author does not repeat it.
- **Every fixture, harness or piece of test infrastructure carries a time box**, sized to the piece
  by the plan's author and never one size for all.
- **A measurement harness is built only when a constant must be derived from it.** Otherwise the
  constant ships provisional, with a named owner and a retirement condition.
- **A mutation the plan names says what it isolates and whether it can be built.** A mutation whose
  answer is "everything" proves nothing: one plan asked for one table's access rule removed, and
  removing it also broke the test data setup, so the check could not be built as named. A
  mutation whose predicted assertion failure needs two connections is tagged D at plan time, never discovered at the
  verification run.
- **A plan line that defines a measurement names the time window it covers**, and every comparison
  it asks for says same input structure, same time window, same suite.
- **A test of concurrent behaviour states the parallelism it runs under.** The same test passes
  alone and fails at four workers, so a reading without that number cannot be compared with the next
  one.
- **Shared fixtures name every phase that reads them**, and a change to one runs those phases'
  specs.

## 6. Review and close

- **A review through the `staff-engineer-review` skill on the PRD, then, after the human principal's
  review of the PRD, on the IMPL, for the rounds section 1 of this skill names.** Facts only in the briefing, which names each IMPL row that touches
  boundary code or its edge, and the cap on the other rows where the overlay allows one. The reviewer
  calibrates its test demands to whether the diff will touch boundary code or its edge.
- **The review brief asks of every requirement whether the sentence is true of the tree the chunk
  will leave.** One phase carried four that were not, and each appeared as a review finding two
  chunks later.
- **The review brief for a probe chunk names the reviewer's first job:** read each row's verdict
  against its own observation, row by row, before anything else. One first report carried two
  verdicts that reached past what their observations showed, and that reading caught both.
- **The debt review the phase will end with is anticipated:** the plan says what is essential to substantiate the phase's claim, so the debt sprint has its list ready.
- **A plan approved before other phases merged is reconciled with changes since approval by its lead against every merge into the phase branch
  since**, on the branches, over the range the plan's facts were verified against. The review of changes since plan approval
  records deviations in the IMPL, and a `[approval-required]` change comes back to the author.

## 7. Open questions and scope

- **Open questions go to the human principal as multiple choice with a recommendation first, with the
  PRD's review residuals, at the PRD's review**, and are settled before the IMPL is written, never
  inside it.
- **Nothing below a chunk gets its own row.** A piece that needs its own merge into the phase branch, review and record
  is a chunk in the table; anything smaller is commits inside one.
