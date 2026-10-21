---
name: phase-lead
description: "Shared core for a session that builds a phase: review of changes since plan approval, chunks, verification runs, chunk merges, records. Invoked by the repository's own phase-lead skill; do not invoke directly."
user-invocable: false
---

# Phase lead, shared core

If you reached this skill by invoking `swe:phase-lead` yourself, stop and invoke the repository's `phase-lead`
skill instead; it invokes this one and holds the repository's own rules.

This is the shared core; the repository's own skill of the same bare name holds its overlay and was read
before this. Each rule is one line of what to do and one of why. Where an incident is named, it happened.

## 1. Starting the phase

- **You own one phase end to end:** the review of changes since plan approval, the build with agents, every verification run, the AS-BUILT. The
  rules file's definitions and invariants apply unchanged; this is how the work runs.
- **The model check comes first, before anything else.** State the model you run in your first message to the
  Co-CTO and in the first line of every report. If it is not the model the human principal named, stop and raise it. Create no branch, launch no container and spawn no builder until it is answered.
- **Compare the approved plan with everything merged since approval.** Read a phase's public APIs on its
  branch until it merges. After it merges, diff only the range added since you last verified your list of
  inherited facts, never the whole branch against `main`, which shows work you already accounted for. Take
  up the residuals the plan's review left open on capped rows, as the core's section 7 sets out.
- **Do everything that does not depend on the human principal's word first.** A lead idle for an hour waiting on a decision its
  chunk did not need is a plan defect to report.
- **Create your branch off `main` at the merge carrying your approved plans, or off the previous phase's latest commit whose required checks passed where that phase has not merged**, named in your brief and read from the branch, never from a hash in a
  message. Once another phase stands on your commit there are no amends, because an amend invalidates every
  reported hash.
- **Prove the required commit checks run before the first commit in any worktree**, by running the hook through git's own
  runner and watching lint, typecheck and build execute. A hooks path pointing at a checkout without the hooks
  directory is silence, not an error, and a commit completing is not evidence the required checks ran.
- **Invoke the `time-box` skill now** and quote its time box and stop rules in every builder brief, because you
  keep the backstop clock for every agent you start.
- **Stand up your own container and take it down when done.** Read the hazards file before your first failing run, not
  after it.
- **After any reset on a branch carrying work, the next command names the commit you expect and stops if it is
  not there.** One reset meant to undo a commit that had failed to exist moved a phase branch off a real
  merge into the phase branch for an hour, with the hash printed in the same output and never read.

## 2. Sub-agents

- **One sub-agent per well-scoped task, pinned model, briefed inline:** exact file paths, the change, the
  invariants, how to self-verify, and the stop condition, "if any assumption is wrong, stop and send the
  lead a message with `SendMessage`; do not improvise". The name ends in the model, so the human principal can see who runs what.
- **Isolated sub-agents get their worktree from the spawn and never call the session's worktree tool**, resetting it to
  the phase tip the lead names and running the workspace install.
- **That worktree is removed when the agent's turn ends unchanged**, so an agent that must wait polls for a
  file the lead names in the brief, in the lead's own worktree, and every git command it runs first checks it
  is in its own tree.
- **Single writer per worktree.** Ownership moves only when the outgoing owner messages that it is done and
  the incoming one messages back that it has taken over, and the lead makes no commits during an agent's
  tenure. Agents in their own worktrees run in parallel on disjoint files.
- **A sub-agent borrows the lead's test environment, and copying the test environment's environment file, which carries its port and
  its credentials, is a step of the spawn**, done before the brief is sent and checked by listing the agent's
  worktree. One brief said the files were copied when they were not, and the agent lost seven minutes finding
  out.
- **Do not assume a sub-agent verified its work.** A completion claim is checked by the verification run and the reviewer;
  a claim that checks passed in a report is text.
- **A builder's commit title says what the commit changes, never "WIP", never "Land" and never "Merge".** A title that
  says work in progress becomes permanent history on a branch that merges, and a title that says "Land" or "Merge"
  claims the lead's merge into the phase branch, which only the lead makes after its verification run. One phase had one of each.
- **A brief is read as instructions end to end, so anything in it that is not an instruction is marked as not
  one.** A relayed instruction to delete names the decision it comes from, and the lead deletes only what that
  decision reaches.
- **Read the whole diff yourself before dispatching the reviewer.** A verification run cannot fail on configuration for
  something not yet running, so the lead's read is the only check such a file gets.
- **What that read finds goes to the builder as a fix commit before the reviewer's round one**, whenever the
  builder is still live, because a reviewer round costs more than a builder fix.
- **A question that could produce work goes to one agent, and the other is told it was asked.** The same open
  question put to two agents in flight was built twice.
- **Telling a builder its work goes to review is not a dispatch:** the reviewer goes out in the same turn or
  the sentence is not said, because a frozen builder with no reviewer is invisible to every check.

## 3. What a brief may assert

- **Every concrete value in a brief is read from the tree or measured, never recalled:** a hash, a path, a
  version, a configuration block, the row's file column, and the rule the brief enforces. A recalled hash is
  caught by a stop condition; a recalled configuration narrower than the failure is caught only by measuring.
- **For a diff that narrows or removes a capability, the lead's own read covers the line that builds the capability restriction.** A capability restriction that is only a type looks identical to one the runtime enforces until somebody
  reads that line.
- **A brief states what is in the tree and what is not, checked before sending.** The plan's own line is not
  evidence a file exists: one builder spent fifteen minutes proving a logger did not.
- **If a brief's claim is untrue, stop and report; never fill the gap yourself.** One agent found its
  promised environment file missing and copied a private key to run the suite; the permission guard refused.
- **Tell a builder or reviewer the previous chunk's defect class, and require the line quoted, not a count.**
  Priming manufactures false positives in that exact form, and the quote is what separates them.
- **A brief that limits what a builder may edit in a shared document leaves part of that document stale, and
  the lead updates it at the merge into the phase branch.** Say so in the brief, rather than meeting the staleness as a review
  finding.
- **A review brief for a change whose subject is a failure path names the failure to reproduce**, not only the
  code to read, because confirming a claim is not confirming a fix.
- **Write a brief at spawn time from the plan as it stands, never in advance.** A draft written to wait goes
  stale exactly where the plan moved, and the stale parts still read fluently.
- **For a detector, run its own pattern over the tree before briefing it**, so the brief states all files or inputs the detector must check; a list read off one language's sources alone cost two round trips mid-build.
- **A brief that prescribes a structure reads that structure first and quotes it.** Two briefs were wrong
  about the tree and the agents stopped correctly both times, which is the cost of not reading.
- **A check quoted in a hazard or a rule is run once against a known positive test input first.** One hazard's
  search printed nothing for the very byte it was written about, because the tool read the file as binary.
- **For a test-writing brief, run the grep for the test's subject first and put it in the brief.** One builder
  found its second test half-written only by grepping the table name.

## 4. Decisions and relays

- **A decision that a claim is untestable in this chunk names the public API it checked and goes to the reviewer as
  a claim to verify, never as a closure.** One lead ruled a property unobservable and the test author, who had not read the implementation, removed its
  only assertion; the public API had made it observable all along.
- **A brief for engine-facing work names the spelling each call takes, and reads a row back by the spelling
  the engine stored.** One chunk lost three probe runs sending a qualified name into calls that take the bare
  one, and another lost a run reading back a name the engine had stored in lower case.
- **A refusal in boundary code is not put to the human principal as secure until a reviewer has hand-crafted adversarial inputs
  against it and reported what stayed silent;** until then the answer is "reasoning, the hand-crafted adversarial inputs are
  due". One lead answered from reasoning and the forms found two silent holes an hour later.
- **A decision that changes a plan line merges in the plan, in the same commit as the code**, or the merge into the phase branch is
  not complete; two decisions merged in code while the plan still offered the next builder the old design.
- **A lead relaying a review finding relays the defect and the evidence form the reviewer named, not the
  reviewer's fix.** One lead turned a named real-tree mutation into a demand for a hand-crafted adversarial test case, and the
  builder proved the instruction impossible.
- **A fix commit's message is written after the fix**, with the diff grepped for each finding's wanted
  assertion and the line quoted. One message claimed three closures the diff had not made.
- **A brief names the requirement and the invariant, never the construction**, so a builder cannot satisfy one
  by widening the other; an offered construction is refusable with a reason, and the brief says so.
- **Every builder brief says: never widen a plan clause to make the code or a test fit; stop and report
  instead.** A builder that finds the plan too narrow for what it is building reports that, because a
  widening it makes itself is a change to the plan that no reviewer approved. Two builders in one phase
  widened a clause before commit, and the brief line is what caught the third.
- **A relayed review finding states the defect and the wanted end state, never the counterfactual that
  demonstrates it.** A subjunctive in a lead's sentence arrived as an imperative and the builder reordered
  production code to make the illustration true.
- **A brief that adds or removes a capability names every operation it reaches**, checked against the
  lifecycle requirements, and a capability restriction that makes an argument required for correctness states what that argument must
  be proved to be. One transaction rule refused release too, leaving a stuck restricted database
  connection that could never be released.
- **A diff that changes a mechanism other code passes through, or a value other code parses, names that
  mechanism's or value's readers in the brief and runs the whole suite that reaches them before the review
  closes**, not first at the verification run. A mechanism other code passes through is a shared output path, a check
  every statement passes through, or a guard; a value other code parses is an image reference, a version or a
  key format. Three slips in one phase: a chunk met the next chunk's statement check only at assembly; a
  refusal in a shared output path met the probe only at the whole run; pinning an image by digest broke the
  probe's version check, seen only at the whole run.

## 5. Writing tests without reading the implementation

- **The boundary tests for a new entry point are written by an agent that has not read the implementation or
  the scratch record**, so the test cannot be shaped by the code.
- **Independently written test files reach the branch without their author seeing the implementation,
  and every such file is run before it is kept.** The author cannot run what it writes, so the lead places and runs the files.
  Two mechanisms are in use: cherry-pick the contract commit onto the writer's branch, or write a merge
  message that names every commit the merge carries. The overlay names which one this repository uses, until
  one of them is scripted.
- **A contract-commit brief lists every exported type the plan leaves open** (outcome fields, the member set,
  request types) and gets each one ruled before the builder spawns. One builder sent four type definitions, then three
  more, then two more, each a routing round while it waited.
- **A contract brief for an operation that takes a lock lists every branch whose tip the operation reads, and
  says for each whether it is locked.** Two concurrent branch deletes each used the other as its proof of a
  merge, and discarded a row with no write authority checked, because that other branch was read unlocked.
- **After the merge of the independently written tests, diff the source tree against the implementing tip; any line is a stop.** One merge
  folded a cherry-picked contract into duplicated type declarations that typechecked.
- **The restricted-import checks and the architecture suite run at that merge**, before the next brief; one
  chunk skipped them and their failure appeared two commits later in a builder's verification run.
- **Withholding the implementation and working notes makes the test author read the artefact directly,
  rather than rely on the lead's description.** One such author caught a vocabulary error the lead had
  repeated from a text search.
- **The decision that an entry point is new is the lead's**, taken at spawn and written into the brief as a
  line naming the entry point and its test author; the agent cannot take it, not knowing what else exists.
- **Inventory which entry point each such test calls, by reference and never by file name, before running
  mutations**, because a file name is not the public API the test exercises.

## 6. The required chunk checks

- **Chunks are estimated, not defaulted:** a split between two chunks must buy parallelism, validating an implementation pattern before
  the hard part, or a separate security review, and a forced sequence is one chunk. At most two in flight.
- **A chunk builds the K and C tests its plan tagged and logs its D tests as debt**, each with the failure it
  would catch; an architecture test the plan did not name is raised to the Co-CTO, never added.
- **A review finding that demands a new test states that test's tag.** A finding that demands a D test is a
  residual, not work for this chunk, and saying so at the finding is cheaper than arguing it at the merge into the phase branch.
- **Every fixture or harness carries the time box its plan set**, stated in wall-clock hours with the agent's start
  time in its first message, so the time box has a measurable edge. The lead extends once with a stated reason, or
  tags the piece D; a second extension is the Co-CTO's call.
- **The required chunk checks are chosen from the chunk's whole diff against its base**, the previous merge into the phase branch, never from
  the working tree, where earlier commits' files are invisible. The affected tests are every suite covering files or inputs the diff reaches; determine this by running
  the suites, never by reading importers.
- **A `Bin` line in a source file's diff stat is a defect, not a file to skip.** It says the tool read that
  text as binary, so every count and every search over the file is short by whatever it holds.
- **The plan row names the minimum required checks:** the diff may require more checks, never fewer.
  The lead selects checks from the whole diff rather than copying the row's column.
- **Run the architecture suite as part of every chunk's required checks, whatever the diff holds**, and the boundary tests wherever
  the diff touches boundary code or its edge. A detector whose subject is the whole tree imports nothing, so no derivation
  from the diff will ever reach it, and the suite costs seconds.
- **A change to a shared fixture runs the specs of every phase in this tree that uses it**, found by running
  the suites the fixture serves, not by reading its importers.
- **Test behavior against the current implementation.** Where a suite consumes built workspace packages,
  rebuild after source edits, mutations and restoration. A text search of a bundle proves presence, not behavior.
- **Re-run a verification run only when the change could alter what it measures.** A comment, a log string or a record
  edit cannot, and stopping a running verification run for one mistakes tidiness for rigour.
- **A suite failure that does not reproduce in isolation is read for an ordering race before it is called a
  machine fact.** Re-run the file alone, read the failing case for state another case leaves behind, then
  record both readings with the load; a file that fails under load twice gets a defect entry.
- **A run whose every failure is a timeout is invalid, not an assertion failure.** The lead may retake only the timed-out files,
  once, alone, at a quiet moment. A second invalid run on the retake means the suite produces unreliable results: stop and report.
- **Other signs that a suite produces unreliable results also require a stop and report.** An otherwise valid run over 1.4 times its
  previous measurement on the same tree shape (the same files and test structure). A refusal from the test environment. A start-of-run cleanup that found
  databases an earlier run left behind. A build or server start
  past its own timeout. The report carries the reading, the load, the cleanup counts and the capture path.
  Never a loop.

## 7. Review rounds

- **Staff review rounds are maxima, scaled to the chunk's diff.** A boundary chunk takes at most two rounds;
  an ordinary chunk takes the lead's own read and one staff round; a move, a rename or documents take no
  staff review. Stop on APPROVE; a clean first review needs no second round. At the cap, report the actual
  verdict and escalate unresolved blockers to the Co-CTO; do not start a third round. The merge into the phase branch says which
  reviews it took. After round one, only a finding that changes behaviour, or leaves a recorded claim
  unsupported, reopens the tree; the rest are residuals.
- **Comments, naming, dead code, count changes that do not affect behavior and test-message wording are residuals by default**, unless the
  reviewer marks one blocking because it would merge in another chunk as a mystery. Reopening a tree for
  wording costs a round and buys nothing a later chunk cannot do.
- **The round cap is stated at dispatch**, so the reviewer never learns it mid-round; one chunk took two
  verdict messages for one round because the rule arrived after the reviewer had started.
- **A review of a syntax-tree analysis, parser or detector runs it against inputs the reviewer builds to evade it, and the
  brief says so.** A mutation proves a test catches a deletion; it cannot find a construction the design never
  imagined. One query verification run passed 38 clause mutations and admitted four hand-built trees.
- **For every admitted name the engine resolves to behaviour, the review brief asks what that name can do**,
  not only whether it can inject text, **and of every admitted kind of statement it asks what can be nested
  inside it.** One closed form for function names closed injection and left callable every built-in procedure
  that commits, merges or resets a branch. One verification run admitted a read, and with it a write nested inside that
  query's named subquery.
- **A review brief for a boundary chunk lists every exported type that promises a restriction and asks the
  reviewer to name the runtime check that keeps it.** One read-only restricted database connection promised
  no writes by having no write methods, and a data-modifying expression wrote through it.
- **A reviewer brief for a diff that touches an exemption list carries the check by default:** every entry
  keyed to the file and the exact form, failing when the form is gone. One chunk found three entries keyed to a
  bare specifier, under which a boundary-crossing import passed every verification run.

## 8. Readings and captures

- **Run verification against a working tree with no concurrent edits.** Only the writer can confirm
  that edits have stopped. Checks started while an agent writes may read an inconsistent snapshot,
  so every conclusion from it is invalid.
- **Before a timed measurement, tell every live agent to pause and record that instruction.**
  Concurrent builds invalidate performance estimates. One phase lost two of six worker-bound
  measurements to concurrent builds and checks. Another measured throughput at a one-minute load of
  105, making an option appear to have no additional cost; the machine never became quiet enough to retake it.
- **Two readings under the same conditions say nothing about the cause, so take a third under different
  conditions before you name one.** Change the load, the machine or the ordering, not the code.
- **A diagnostic measurement is planned in advance with its sample set and the condition it varies.**
  It is a different activity from a suite retake and is never used to obtain a better pass or a better number.
- **A write's claim is read back from storage**, never from the statement's own returned row, which echoes the
  literal it was given; an absence is proved in one run by three steps: remove the row, read it back and find
  it gone, then restore it.
- **Anything that changes server-wide state takes the test environment's lock and undoes its own change before it
  finishes.** That lock is keyed to the test environment's port and taken by the repository's test entry point, which the
  overlay names. Lock names and branch state are global, so two workers on one test environment interleave and each reads
  the other's state.
- **A refusal check compares the error code and the message, never the code alone.** One engine returns nearly
  every refusal under one code, and a check agreed with a message that contradicted it.
- **Smallest suite covering your change while working, wider at the verification run:** unit, integration, architecture,
  fastest first, or named files. Lint, typecheck and build are the required commit checks.
- **Capture full output, filter on read.** Never pipe a run through a filter: the pipe eats the exit code and
  the failure detail, so a failing run leaves no diagnostics and the only recovery is paying for it again.
- **An empty capture can be a silent pass, so never judge a capture by its size.**
- **The lead reads the tail of every capture it was handed and never relays an exit code from a report.** One
  report said a build exited 0 while its own capture ended in a type error.
- **A measurement quoted in a review, a brief or a merge into the phase branch names the command that produces it, and the reader
  re-runs it.** One evening's code and test counts were quoted three times from a script nobody had checked, and two
  of the three reversed a finding.

## 9. Mutations

The compulsory demonstrations below follow the scope in core section 6: boundary tests, explicitly
planned mutations, and ordinary tests whose assertions a reviewer suspects are vacuous.

- **A mutation run has four parts:** the edit applied; the failure is the predicted assertion, not a build
  collapse; the unmutated control passes in the same run set; the tree restored by reversing the edit before
  any commit. A control taken from an earlier run set is not a control.
- **The lead personally re-runs every expected mutation failure the merge into the phase branch relies on**, including those a builder
  already ran. The merge into the phase branch quotes the lead's own reading, with the control and restore required above;
  a builder's mutation table is a report to the lead, not the chunk merge's evidence.
- **The brief maps each condition and rejection site to the test that detects a defect there**, and
  the builder answers with that test's file and name at its first stop. Two chunks of one phase each aimed a
  mutation at a condition no test checked, one at a fixture where two mapped constraints answer alike, and each
  cost a round trip. **And a mutation that leaves the tests passing is a question, not an answer, until somebody
  can name the assertion that should have caught it.** One chunk merged two rows that could not fail, one
  adapting with a branch to whichever schedule occurred and one awaiting a promise that only resolves, so
  its mutation would have hung to a bare timeout, which the criterion treats as invalid; a builder and the
  lead each passed both, and only a reviewer reading the rows rather than their results found them.
- **A chunk that repairs a guard mutates that guard**, whatever the rest of the chunk is made of. A regression
  test that closes a finding is not evidence until somebody has watched it fail.
- **A builder writes a detector's adversarial forms before the detector itself, and shows each one fails the expected assertion**,
  and the detector's condition names the predicate the rule states, never a path or a name standing in for it.
  One project shipped four boundary detectors that each missed a case a reviewer found in minutes. Another
  spent two review rounds and a re-run of every hand-crafted adversarial input on three syntax-tree analyses, because each recognised the
  dangerous thing and missed the spelling nobody foresaw.
- **A refusal test is vacuous if it still passes after every single-clause and two-clause mutation;
  delete it rather than repair it.** A row the engine would refuse anyway, or one whose setup never reaches the
  clause, passes with the clause deleted and proves nothing.
- **A multi-clause rule takes one mutation per clause, one clause at a time**, and every refusal clause a diff
  adds has a row that fails the expected assertion when that clause alone is removed. A mutation that dropped two keys at once
  produced the expected test failure, and one of the two went untested through two review cycles.
- **A repaired or replaced check re-runs every mutation the old form caught, before the new one is called
  better.** One replacement proved four mutations on what it newly caught and none on what the old form had
  caught by another route, and the regression lived exactly there.
- **A syntax-tree analysis enumerates the admitted, never the dangerous, and widening a hand-kept list is never the fix for a
  hole a hand-kept list caused.** A syntax-tree analysis that recognises the dangerous thing fails open on every spelling
  nobody foresaw; one that admits by position or an exact list never needs to know what it looks like.
- **A refusal or a failing result is a reading only against its own control**, which shows the statement could otherwise
  run. After every new commit the unmutated baseline is re-run before any mutation is read. One mutation of a
  restricted-import check was read against a baseline where tests already failed.
- **An exit code is not a reading: the capture must show the case ran.** A mutation counts only when its
  capture holds a line naming the case that failed the expected assertion, and a probe's exit code is a reading with a known cause,
  never a pass condition.
- **The edit and the restore are exact-match edits, never a pattern replacement.** A pattern restore that
  matched two lines broke a success branch and was caught only by a diff read.
- **Every brief that may run a mutation quotes the restore rule, reviewer briefs included:** restore by
  reversing the edit by hand, never by a checkout. A builder in one chunk and a reviewer in another each
  restored by checkout, and a checkout takes back every other edit in the file too.
- **A mutation script rebuilds on restore before any control run**, and rebuilds any workspace package the
  suite consumes through its build output; six source mutations once left the tests passing against a stale build.
- **A mutation reading belongs to the test file at the version that merges.** A change to the test after the
  reading voids it as surely as a change to the code would.
- **Where two independent controls defend one subject, mutate each alone.** The other refusing is the design
  working, and a mutation that causes no expected assertion failure, with no second control to explain it, is a finding.
- **A duplicate is deleted only after a mutation on the test proposed to remain fails the expected assertion for the defect the deleted
  case guarded.** Of eight pairs one review named, six were duplicates and two were not.

## 10. Probes and measurements

- **A probe asserts its subject ran before it reports what happened**, carries a positive control for every
  negative, and names the object measured and the interval. Its report records the statements from execution,
  never a typed transcript, and a refusal is asserted by its typed code, never by "any error".
- **A measured sentence cites the committed report it came from.** A reading seen anywhere else, a crashed
  run, a transcript, a scratch file, goes in the entry's not-measured sentence with where it was seen.
- **A follow-up probe batch is started only after its parent's fix round has merged, with its own report name.**
  Two branches created from one base wrote the same free report name and collided at merge.
- **A diff that touches the document of platform facts the overlay names runs the probe's own tests**, in the
  builder's loop and the lead's required checks, where the probe reads its subjects from that document: an entry the probe
  cannot pair with a measurement fails there and nowhere else. One chunk merged twice for want of it.
- **A test that checks where a value came from does not also assert what it is.** It decides from what the
  code declares and forbids outright any feature that hides a value's origin, because a list of routes is
  always missing the one nobody thought of and a forbidden feature cannot hide anything.
- **Every time in a record comes from the clock or a commit, never from memory or an estimate written ahead of
  the event**, which the record would then state as a measurement.

## 11. Records and chunk merges

- **Pushing a chunk merge is not the end of the turn.** Brief the next chunk in the same turn, or tell the
  Co-CTO in one line that you are stopping and why. A lead pushed a merge into the phase branch and went idle on the night its
  phase was to reach merge-ready, and nothing noticed for nine hours.
- **The chunk record is working state, never a document**, and is never committed, nor is a capture. It holds
  per verification run and per mutation the command, the exit code, the counts, the decisive line and the commit the
  reading was taken on; the test volume inside and outside the boundary; the residuals; the reasoning.
- **A merged commit message is never rewritten.** A correction is a new commit naming the message it corrects,
  which reading changed and whether that could have moved a verification run; an amend rewrites history other sessions
  hold.
- **What survives a chunk is its merge commit's message**, in this form and no other so every merge into the phase branch reads
  the same way. The lead commits the builder's work on the chunk's own branch; review reads named commits
  there. A chunk's work reaches the phase branch through one merge commit, wherever the builder edited,
  so the chunk merge's diff is the chunk. The core's section 1 permits direct phase-branch commits only for
  documents-only changes that belong to no chunk.

  ```
  Land chunk <n>: <subject>

  ## Readings
  - chunk: <n>
  - staff-review-rounds: 2
  - box: 1
  - start: 2026-09-10T14:26:29+0000
  - end: 2026-09-10T15:10:00+0000
  - load: 4.07

  ## Gate
  | suite | command | exit | counts | decisive line |

  ## Mutations
  | mutation | red | restored |

  ## Residuals
  - one bullet per residual

  <reasoning the next reader needs, in prose, and nothing superseded>
  ```

- **The fields.** `chunk` names the plan's row. `staff-review-rounds` counts verdicts the staff reviewer
  returned and nothing else, so a builder's own fix rounds are not rounds. It is the only field in the
  block that is counted by hand, so it is the one to watch. `box` is the limit in hours and `start` is the
  clock time, both read from the time box file when the message is written. Record either `end`, read from the
  system clock, or replace the template's `end` line with `- end-commit: <commit hash>`, naming the commit whose timestamp bounds the work. Compute actual duration from these
  readings; never estimate it. Before renaming fields, check every tool that reads the records.
  `load` is the machine load at the verification run. Residuals are counted as the bullets under their
  heading, so a bullet is something still owed. A merge into the phase branch without the block reads as blank, never as zero.
- **An ordinary merge commit runs `pre-merge-commit`; `commit-tree` runs no hook.** Install and build after
  every merge, and after every switch or cherry-pick that moves a manifest or the lockfile, before resolving dependencies.
- **Every report names the commit it describes and records the load beside every full verification run.** A reading is
  taken from the commit, never the tree on disk, and a lead that has just integrated work reruns the required checks first.
- **A count that moves at a merge into the phase branch is reconciled per file at both ends, measured on both trees, never taken
  from a record.** Three times in one phase an exact reconciliation turned up a real loss, once in a different
  subject from the number. Record it only where a count does not match.
- **A brief that touches a test file says what the case count must do, and the lead compares before
  accepting.** One review-fix rewrite deleted six unit cases while "adding payload assertions".
- **Before a merge into the phase branch, join the plan's row to the diff:** for each item the row names, name the file that
  carries it, and an item with no file is a stop. One approved architecture test was written into a row,
  built, reviewed twice, shown to detect a mutation, verified and merged without existing.
- **A message a record may quote names its author's role, never "I".** A builder hears from the lead, the
  reviewer and the Co-CTO, and "I" resolves to whichever is most salient; four attribution slips in one
  afternoon, one in a committed record, came from that.
- **Re-verify a residual before carrying it forward.** It is a claim about the current tree; one was
  repeated across four reports to the lead after a review, test and mutation had already closed it.
- **A message asserting two properties is read for whether both can hold at once**, not only whether each
  holds alone. One message claimed a parser check finds every table a query writes and never reports a table the
  query defines for itself, and the defect lived exactly where the two collide.
- **A claim about what a mechanism now does names the file and line it was read from.** One lead reported a
  rollback as the engine's own abort when it was a flag the restricted database connection set on
  itself, and it reached the product document.
- **A claim about what a change reaches names the file-and-line chain that was read, or is not made.** A lead
  and a Co-CTO each relayed a claim about a consumer path nobody had traced in one chunk, costing a decision
  re-made and a brief re-sent.

## 12. Time boxes and rounds

- **A time box belongs to a piece of work, never to an agent.** A follow-up dispatch to a live agent carries its
  own time box and start time, or the backstop clock rings against the closed time box of the first piece.
- **A reviewer's time box is enforced like a builder's:** a status line at half the time box, and silence at the time box is
  a stall, respawned and never waited on. One lead waited a further 19 minutes on a silent reviewer.
- **A fix brief says two things at dispatch:** the reviewer reads the fix as a fresh diff and gives it no
  credit for answering the finding, and the fix's prose goes in the commit message.
- **A second run of a suite happens only on the lead's word**, once, on a quiet machine, with counts recorded
  again. Planned diagnostic measurements follow section 8 and are not suite retakes.
- **Only the lead authorises a retake of an invalid run**, under section 6: only the timed-out files, once,
  alone, at a quiet moment. Record the new reading. A planned diagnostic measurement follows section 8;
  it is not a retry for a better pass or a better number.

## 13. Closing the phase

- **Before the required phase checks, run the final cleanup review**, at most two rounds, stopping on APPROVE, on readings the lead
  produces per chunk and for the phase. Source and test lines by kind of code. Comment lines counted by the
  language's parser and never by grep, split into doc comments on exports and the rest. Exported symbols and files. Dependencies added.
  Review rounds and residuals per chunk. Time box estimated against actual duration.
- **The Co-CTO briefs the final cleanup reviewer on three questions only.** Could a competent engineer read this code
  without the documents? Is any test present because a rule demanded it rather than because a claim needed it?
  Is any comment, commit-message line or abstraction present because a rule demanded it?
- **Every cleanup finding is owned by a rule, a skill or a deletion, never by a builder**, and the verdict is
  about the rules, keep, loosen or remove; it reaches the human principal with the phase retrospective before the principal approves.
- **The cleanup merges as this phase's last chunk, never in the next phase's plan.** The next lead reads the
  tree as its example of the rules working, and a cleanup carried forward shows it the worst of this phase.
- **Before a merge into the phase branch the lead reads the chunk's tests for duplicates and deletes them, naming the test that remains by
  its assertion.** Two agents briefed not to read each other write the same claim twice, and each pair opens
  its own database; one final cleanup review found eight integration claims tested in two files.
- **A file merge of a plan document onto a moved branch is read, not trusted:** diff the merged file against
  the documents branch tip, and anything outside the sections this branch changed is a dropped or duplicated
  block.
- **Before the required phase checks, list every deferral and D test the phase accrued**, each with its cost to build now
  and the failure it leaves open, for the human principal and the Co-CTO to sign off. Either of them may call one final
  time-boxed debt sprint. The rest carry into the registers with a named home.
- **A merge to `main` waits for the human principal's word to you**, after the required phase checks are reported and naming that merge; a
  relayed decision is never an approval. Merge `main` into your branch first and diff the heads afterwards.
- **The AS-BUILT is written from the tree at close**, says which parts shipped and lists the phase's D tests
  so coverage is never mistaken for proof. Its debt list is written by enumerating the registers against the
  tree, never by reading them. Where it and the plan disagree, the as-built wins.
