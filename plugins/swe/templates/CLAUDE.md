# CLAUDE.md

Working rules for this repository.

*Keep, adapt or delete:* keep; fill each blank.

**The shared working core holds every rule that is the same in every repository that vendors it,
and this file holds only what is ours.** The core is vendored to `.claude/rules/core.md` from the
`swe` plugin, pinned by the plugin `ref` in `.claude/settings.json`; re-copy it, and commit the
diff, when that pin changes. Read this file first, then the core. **A session invokes this
repository's own skills by their bare names and never the plugin's `swe:` skills directly:** the
repository's skill reads the shared core and adds what is ours, and going straight to the plugin
skips this overlay. The standalone
`swe:architecture-guardrails` skill has no overlay and is invoked directly. The human principal runs
`/swe:quick-start`.

**This project's slug is `<project-slug>`.** It prefixes session names, containers and other test
resources, and every environment variable carries `<environment-prefix>`. No name in this
repository carries another project's prefix. Each angle-bracketed blank in this file is filled from
the repository, as core section 2 requires; the index at the end lists them.

**What this is:** start with `<product-document>`. It states the product and the decisions
everything rests on. This file is how we work; that one is what we are building and why.

**The closed directories under core section 5 are `<closed-directories>`, with their git histories.**

## Definitions: what the core's terms name here

*Keep, adapt or delete:* keep every bullet; delete the security-boundary refinement only if no
caller here has data another caller must not reach.

- **The human principal is `<human-name>`.** Write that name wherever the core says "the human
  principal", and "you" in a message to them.
- **A phase's branch and documents** are `<phase-locations>`.
- **A chunk's record** lives in the worktree's `<chunk-scratch-directory>`, ignored and never
  committed; so is a capture.
- **The registers** are `<defect-register>` and `<deferred-feature-register>`, and their closed
  and landed entries move to `<finished-registers>`. An entry reads `- [phase N, date]
  description`; read each file's front matter. When an entry closes or lands, append a dated
  closing note and move the whole entry to its finished file, or to the closed heading where the
  register keeps one, rather than rewriting the original.
- **The hazards file** is `<hazards-file>`. **The testing policy** is `<testing-document>`.
- **The security boundary is the code where one mistake lets a caller read or change data outside
  its scope, or see that data in an error or refusal, and no lower layer refuses it at a file and
  line we can cite.** The test below decides whether a file is inside; the six kinds only name why.
  1. **Credentials:** code or configuration that holds or grants a credential of a deployment that
     anyone other than its developer uses, where the credential reaches data without a check or
     mints a caller's tokens; and the cloud permissions that grant one or let code run as an
     identity that holds one.
  2. **The caller:** code that verifies or mints a caller's token or handle, or chooses which one a
     call presents where another caller's, or one of different authority, is in reach.
  3. **Rules:** code that writes what a lower layer enforces, such as row policies and grants, and a
     rule or scope value stored on a row where no lower layer refuses a wrong one.
  4. **Confinement:** code that decides who may hold a credential or a database handle: the
     restricted-imports rules and their detectors.
  5. **Shared state:** code that holds or declares results, tokens or handles shared between callers.
  6. **Disclosure:** code that decides how much of an error or refusal reaches a caller.

  **It is not** code whose worst mistake a lower layer refuses on every path, the error path
  included, with that file and line cited; nor **secret handling**, keeping a secret out of logs and
  off the network, whose checks are a test that the secret never appears in a log line or a response
  and, for a key the process needs, a test that the process refuses to start without it (where a
  file also holds or grants a kind 1 credential, kind 1 wins); nor attribution, where an audit record
  naming the wrong actor is an ordinary defect. **The test for a file:** "If this file is wrong on any
  path, what crosses a scope, and which file and line refuses it?" If no such line exists, the file
  is inside. `<boundary-file>` lists the files inside, each naming its kind.

## Repository terms

*Keep, adapt or delete:* delete this section when the repository uses only the core's terms.

The terms this repository defines beyond core section 1 are: `<repository-terms>`.

## Sessions and models

*Keep, adapt or delete:* keep; change the default question prefix only if sessions already use
another scheme.

- **Each role's model:** the Co-CTO runs on `<co-cto-model>`, a lead on `<lead-model>`, a plan
  author on `<plan-author-model>`, a staff reviewer on `<reviewer-model>` and a builder on
  `<builder-model>`; `<strongest-model>` runs only with the human principal's advance approval per
  spawn. Sessions and agents are named `<session-patterns>`. **Every report a lead sends the Co-CTO
  names its model in the first line**, because a session name carries no model; the Co-CTO
  compares it with the intended model and tells the human principal at once on a mismatch.
- **Each other project on this machine has its own Co-CTO, the only address:**
  `<other-project-coordinators>`. A fact a lead or a sub-agent needs from another project is read
  from its published package, a memo in `<reference-directory>`, or the Co-CTO.
- **A session's question numbers take their prefix by `<question-prefix-policy>`.** By default
  it is three capital letters no other session uses, taken from the session's name and stated in
  its first message to the human principal; the Co-CTO's is `CTO`. An open number keeps its old
  prefix until answered. A one-letter prefix runs out, and two sessions then give one number to two
  questions.
- **A question to the human principal, and the options a plan or a review weighs, start from the
  target design: what we would build if we built it today with the platform's own features, then
  how far the current code is from that design, then the options that close the gap, each
  priced.** Options built only from the current code offer the best patch on what exists, and the
  proper fix then reaches the human principal only when they ask for it. Where the current code
  already is the target, the target line says so in one sentence.

## Development workflow

*Keep, adapt or delete:* keep the rules; adapt the review limits and the debt-sprint start to the
human principal's working pattern.

The core's phase loop (section 1) runs here with these values. **Outstanding PRD documents reach
`main` through `merge-to-trunk` before the phase branch is created.** Reviews run
`/staff-engineer-review`; the IMPL review's limit on ordinary rows is `<impl-review-cap-policy>`;
**a chunk review takes at most two rounds**, like a PRD review. The build runs
`/launch-builder-team-slim`, chunk by chunk, test first. **The final cleanup review merges as the
phase's last chunk and never in the next plan**, so each new lead meets the best patterns yet.

**Every fixture carries a time box set by the plan's author.** **At the phase end the lead files
every item of accrued debt in a register first, and then the human principal and the Co-CTO sign
that filed debt off before the merge**, with one time-boxed debt sprint on offer. **A phase that
reaches merge-ready N hours before `<working-day-start>` runs that sprint at once, without waiting
for the sign-off, when the lead prices it under N hours:** the essential and cheap items, then the
required phase checks again; the human principal and the Co-CTO sign off the debt that remains in
the morning. Otherwise the sprint waits for the sign-off. Plan authoring is in `phase-plan`,
building and the capture procedure are in `phase-lead`, and the policy for writing tests is in
`<testing-document>`.

- **An edge case is recorded, not solved, unless it is likely or a security hole.** Solving every
  one in advance costs more than it returns. A case unlikely in ordinary use that opens no path to
  data outside the caller's scope is filed in a register with how it arises and a possible fix, and
  the chunk moves on; it is picked up again only if it occurs in production. A likely case, a
  security hole, and any defect that fires on ordinary use or destroys data on the normal path are
  fixed before the chunk merges.
- **When the human principal names a bug or a feature request, the session that hears it files it
  at once**, in a register, in a commit made in the same turn, before any other work and never into
  a queue for a later documents merge, in their words, with what they saw and where. A request held
  for later is forgotten.
- **The work board, where the repository keeps one, is `<work-board>`, and the Co-CTO keeps it
  current.** The Co-CTO updates a card in the same turn a phase or chore changes state, from the
  tree and never from memory, with its date and its estimates. Each lead tells the Co-CTO such a
  change in one line when it happens. A card's estimate is guidance for the human principal, not a
  box.
- **A security hole is reported to the human principal however it was found, even when already
  fixed:** the one exception to the core's rule that the principal hears decisions, not solved
  problems. A security hole is a path by which a caller is authenticated as someone else, is
  allowed an operation it should be refused, or receives a row, a count or an error from outside its
  scope; a disclosure the product document makes by design is not one. The finder files it in
  `<defect-register>` at once and reports it by `<security-hole-escalation>`; by default the Co-CTO
  hears within the hour and the human principal the same day. A fix with one clear form goes ahead
  and takes the boundary tests. A hole with no clear fix, or in a dependency's own boundary, waits
  for the human principal's ruling, and nothing is built on the affected form until then.
- **A mutation is a deliberate, temporary break in the code a test guards, run to watch the test
  fail and restored in the same step; the test commands are on the harness's permission
  allow-list, so no prompt interrupts a mutation and the reading is the lead's own.** A mutation is
  never committed to a branch that is pushed, merged or kept, and the chunk merge message quotes it.
  A run on another machine from a snapshot of the working tree takes its mutation, or a probe's
  timing control, uncommitted, and neither enters a committed test file.
- **Breaking the code means deleting the guarded clause or making it answer the right shape with
  the wrong content, and a test is not shown able to fail until it has met the second.** A deletion
  shows the check notices an absence and says nothing about whether it notices a lie. Where a
  deletion would not compile, or the fault would be code added rather than removed, the substitution
  is the only mutation available, and "no mutation is possible here" is then a statement about the
  method and not about the code.
- **An upgrade of a pinned dependency inside or beneath the security boundary is a chunk,** never a
  lockfile bump in passing, such as the database client and the query builder. Its required chunk
  checks carry every boundary test and every adversarial input, and it merges only when they pass.
- **A migration leaves the previously deployed revision working once a deployment holds data we
  keep.** While every deployment is disposable, a narrowing change may ship in one migration, and
  the plan says every deployment is still disposable. Once a deployment holds kept data, a
  narrowing change ships as two deployments: add and backfill, then remove once nothing reads the
  old shape, because a runner that commits each file on its own and fails at file *n* leaves files
  1 to *n-1* applied under a revision still serving. **A migration that cannot be written
  compatibly says so in its own words and takes an agreed stop**, a decision and not an author's
  choice.
- **The `merge-to-trunk` skill holds the merge recipe and the checks each kind of merge takes;** a
  phase merge takes the required phase checks whatever its diff holds, and the merge message names
  the checks that ran.

## The security boundary, and everything else: the diff decides, not judgment

*Keep, adapt or delete:* keep; adapt the growth rule if nothing lies beneath the boundary.

**The boundary file core section 7 asks for is `<boundary-file>`**, and the architecture suite that
guards those paths, `<architecture-suite>`, is inside with them. `<repository-document>` says why
each kind of path is listed, and no document restates the list. **A change to the list needs the
human principal's word.** It grows only for a decision that cannot live in
`<data-access-packages>`, and the change names the lower layer's file and line that does not
already refuse the failure. **Where a decision belongs inside a dependency's own boundary, the
session raises it with the Co-CTO and builds nothing around it**; only the Co-CTO takes it to the
owner, with the human principal's approval. **A phase's PRD names the new path its first end-to-end
integration chunk carries a caller along.**

## A blanket catch destroys the evidence its own answer rests on

*Keep, adapt or delete:* keep when `<engine>`'s refusals name the broken rule and never the
constraint; delete otherwise, since core section 8 then covers it.

**Where a refusal names the rule (a foreign-key or a unique violation) and never the constraint,
core section 8's constraint-name rule holds by a different reading.** A catch narrows on the rule
plus the schema: it may give a rule a specific meaning only when every constraint of that kind the
statement can trip, as the migrations declare them and each cited by file and line, carries that
one meaning. Where they could mean different things, it gives the generic refusal for that
statement and writes a log line carrying the raw refusal.

## Data security: remove the capability, don't add a guard

*Keep, adapt or delete:* keep the scope rule always; adapt the first two paragraphs to the engine
and the packages that hold its handle.

Where the engine has no row-level security, `<data-access-packages>` is the entire boundary, and
any control that fails open fails silently. **Code lives in a package that holds the database
handle only if it must itself build or hold that handle**; a workflow that needs the data calls the
package from outside, and every line inside it is boundary code by path.

**Confinement boundaries are directories and workspaces, enforced by explicit, auditable allow-rules
in `<architecture-config-file>`**, with the subject set derived from structure as core section 8
requires. As an exception to core section 8, where a disagreement between a hand-kept list and the
derived set can only fail closed, a comment says so and no second check is built.

**Never accept scope from the caller. A request names its subject, the record or container it acts
on, and authorization checks that the caller may act on that subject; every value that follows from
the subject is derived on the server from it and never read from the request.** That covers the
subject's owner, namespace and version, and any rule or scope value stored on a row. It holds even
where the caller could read the value, and for reads as well as writes. The server always uses the
value it derived. A caller may send what it expects, such as the version a draft was opened
against, only as a precondition: the server compares it with the derived value, refuses a mismatch,
and never uses the caller's value, so a deleted comparison still writes the derived value and fails
closed. Any other field on a wire shape
that carries such a value is removed.

## Agent worktree discipline: what the core's rules name here

*Keep, adapt or delete:* keep; fill each value.

- **The workspace install** is `<workspace-install-command>`.
- **The hooks path** is restored to `<hooks-directory>` by `<hooks-restore-command>`, which every
  agent runs before its first edit, and the lead after every spawn and before every recorded
  verification run. **There are two hooks and the proof is both**, `git hook run pre-commit` and
  `git hook run pre-merge-commit`: git runs the
  second for a merge and skips the first. The second execs the first, so there is one set of
  required commit checks and two entry points into it.
- **A test environment** is launched by a lead through `<test-environment-setup>` and taken down
  when done; a builder borrows it through `<test-connection-settings>`. Where no suite needs a test
  environment, both read "none" and the rules about the test environment and its lock do not apply.
- **Quoting paths:** to a human, the path from the main checkout's root; anywhere git resolves it,
  the repo-relative path you already have.

## The data-access rules

*Keep, adapt or delete:* adapt to the engine and packages; delete a numbered rule only when the
structure it governs does not exist here, and the row-level-security paragraph when no engine here
has row-level security.

These are the rules core section 8 hangs here. An unscoped query that reached `<engine>` by another
road would not throw or log; it would return plausible rows and pass review. **These rules keep
every road to the engine running through the scoped handle:**

1. **Only `<data-access-packages>` builds or holds the database handle.**
2. **Consumers import a package's public entry point only.**
3. **Business methods never take a connection or handle as a parameter;** the package holding the
   handle closes over it.
4. **A package that needs the query builder's types imports the types only, through a package that
   re-exports them and nothing else;** the package holding the handle passes it the real builder.
5. **We author the row-security library's protected-table registry, where it has one,** as schema
   metadata, changed in the same change as the migration it describes.

The rules this engine and package structure add are: `<data-access-rules>`.

**Where the engine has row-level security, one package opens one connection per request, presents
the caller's token once and owns the commit; no other package holds a client or a token, so none
can keep a connection past its request or reuse it for another caller.** A package's SQL is literal
statements in one file, run by name through the handle, and an architecture test holds that no
statement text lives elsewhere in the package. **A row policy's USING clause works out the
caller's scope once per statement and tests each row against it, in the form
`scope_column IN (SELECT scope_helper(...))`, and never passes the row's own column to a SECURITY
DEFINER function;** a WITH CHECK clause runs once for each row written, so it may pass the written
row's columns to a helper. A plan that adds or changes a policy measures one list statement over
that table as the application role under a signed token, and quotes the plan and the time.

## The API contract

*Keep, adapt or delete:* keep when the API contract is to be translated to a language-neutral
schema; delete otherwise.

**Every wire shape in the API contract is one a schema tool can express:** objects, arrays, strings,
numbers, booleans and null; optional fields; unions of literals; unions of object shapes told apart
by a literal field; maps from string keys; and generic shapes whose parameter is only a slot. No
wire shape is a conditional type, a function type or a generic that computes a shape; a type
computed from a route table for convenience is not a wire shape. The package may also hold pure
parsers of those shapes that perform no I/O. A reviewer refuses any other, because each one makes
the translation a rewrite, not a conversion.

## One principle worth keeping in front of you

*Keep, adapt or delete:* keep.

> **If the mitigation for a data-loss or data-leak path is a sentence about how users behave, it
> is not mitigated.**

## Documents and records: where repository knowledge lives

*Keep, adapt or delete:* keep every row; point rows at one document's sections where one document
serves several, and never copy facts between rows.

| fact | home |
|---|---|
| what we build and why | `<product-document>` |
| platform facts with their tags, and the probe that runs them | `<platform-facts-document>` |
| a phase's requirements, plan, and what shipped (the AS-BUILT wins) | `<phase-locations>` |
| what lives where, which package may declare what, the boundary by path | `<repository-document>` |
| what an attacker reaches, what stops them, what is left over | `<threat-document>`; where it is none, the Co-CTO checks the tree and files the absence once |
| a chunk's verification runs, mutations and readings | the chunk merge message; during the phase also `<chunk-scratch-directory>` |
| engine quirks, tool blind spots, shared-machine effects, with no fix to make | `<hazards-file>`, dated sightings |
| an open defect or deferred feature | `<defect-register>` / `<deferred-feature-register>` |
| a closed defect or landed feature, with its dated closing note | `<finished-registers>` |
| the state and forecast of every phase and chore | `<work-board>`, or none |
| the policy for writing a test at all, and the grades | `<testing-document>` |
| questions and decisions waiting on the human principal, overnight ones included | `<decision-batch-file>` |
| the successor's map when a role is handed over | `<handover-document>` |
| additions to the shared brief or merge-record format | `<brief-record-template>` |
| what a consumer of a package meets: names, errors, the public API | that package's `README.md`, read before changing an export |
| what a user of the interface meets: layout, states, interaction | the interface design document, where there is one; it is not a package's consumer document |
| the rules that are the same in every repository | `.claude/rules/core.md`, vendored |
| the reason a rule exists | the commit that added it; rules here stand alone |
| why a line of code is strange, under core section 10 | a comment |
| a decision the human principal gave in conversation; a fact about this machine | shared memory, tagged |

## Conventions

*Keep, adapt or delete:* keep; fill each command, and name every suite the full run holds.

- **Test suites, fastest first:** unit, `<unit-suite>`, which opens no database; integration,
  `<integration-suite>`, which needs the test environment and takes its port lock through
  `<locked-test-entry-point>`; architecture, `<architecture-suite>`. `<boundary-tests>` selects the
  boundary tests. Where no suite needs the test environment, `<integration-suite>` and
  `<locked-test-entry-point>` read "none".
- **The required commit checks are `<commit-check-commands>`**, run by both hooks. **The required
  phase checks run `<full-suite-command>`**, and this bullet names every suite that command runs. A
  suite the test runner's projects exclude is named here and joins the required checks of every
  phase and of every chunk whose diff reaches its files. A suite that needs the test environment
  and runs long joins the phase checks and only the chunk checks that name it.
- **A reading taken above load `<load-threshold>` is unreliable.** **A dependency pin change runs
  `<dependency-audit-command>`.** **Independently written tests reach the branch by
  `<independent-test-integration>`**, one of the two mechanisms in `phase-lead`.

## Blanks to fill

*Keep, adapt or delete:* delete. When you fill this file by hand, delete this whole section, every
"Keep, adapt or delete" line and the opening's sentence about filling blanks once every blank is
filled; the `swe:quick-start` skill does this as its last step.

The examples describe one invented repository, Larkspur, so they agree with each other; replace every value with your own.
A row that names a starter is filled by copying that file, named from the plugin's root, to the
path the blank's value names and filling the blanks inside it; the `swe:quick-start` skill does this.

| Blank | Section | What fills it | Pattern | Example |
|---|---|---|---|---|
| `<project-slug>` | Opening | the short project name | lower case, two to four letters; starts every session, container and test-resource name | `lsp` |
| `<environment-prefix>` | Opening | the prefix on every environment variable | `<project-slug>` in capitals plus `_`; agrees with `<project-slug>` | `LSP_` |
| `<product-document>` | Opening | the product's requirements document; starter `templates/docs/PRD.md` | one file at the top of `docs/` | `docs/PRD.md` |
| `<closed-directories>` | Opening | directories no session opens | paths outside the repository, or "none" | `../larkspur-v1` |
| `<human-name>` | Definitions | the human principal's name | free | Dana |
| `<phase-locations>` | Definitions | a phase's branch and its three documents | branch `phase/` plus number and slug; one directory per phase holds its documents | `phase/3-tax-rates`; `docs/phase3/{PRD,IMPL,AS-BUILT}.md` |
| `<chunk-scratch-directory>` | Definitions | the ignored directory for chunk records and captures | a dot-directory at the worktree root, listed in `.gitignore` | `.scratch/` |
| `<defect-register>` | Definitions | the file of open defects; starter `templates/docs/bugs.md` | one file per register in `docs/` | `docs/bugs.md` |
| `<deferred-feature-register>` | Definitions | the file of open deferred features; starter `templates/docs/features.md` | beside `<defect-register>`, in the same entry form | `docs/features.md` |
| `<finished-registers>` | Definitions | the files or headings closed and landed entries move to; starters `templates/docs/bugs-closed.md`, `templates/docs/features-landed.md`; the quick-start writes the defect half into the `<defect-register>` starter and the feature half into the `<deferred-feature-register>` starter | each open register's name plus `-closed` or `-landed`, beside it; agrees with `<defect-register>` and `<deferred-feature-register>` | `docs/bugs-closed.md`, `docs/features-landed.md` |
| `<hazards-file>` | Definitions | the file of dated engine and tool sightings; starter `templates/docs/hazards.md` | in `docs/`, beside the registers | `docs/hazards.md` |
| `<testing-document>` | Definitions | the policy for writing tests; starter `templates/docs/TESTING.md` | policy documents in `docs/` take upper-case names | `docs/TESTING.md` |
| `<boundary-file>` | Definitions | the machine-readable list of boundary files and their kinds; starter `templates/architecture.json` | the same file as `<architecture-config-file>` | `architecture.json`, key `sensitivePaths` |
| `<repository-terms>` | Repository terms | terms beyond core section 1 | each defined once, here; "none" deletes the section | **invoice run**: one scheduled batch of invoices |
| `<co-cto-model>` | Sessions and models | the Co-CTO's model | same tier as `<lead-model>`, `<plan-author-model>` and `<reviewer-model>` | a high-tier model |
| `<lead-model>` | Sessions and models | a lead's model | same tier as `<co-cto-model>` | a high-tier model |
| `<plan-author-model>` | Sessions and models | a plan author's model | same tier as `<co-cto-model>` | a high-tier model |
| `<reviewer-model>` | Sessions and models | a staff reviewer's model | same tier as `<co-cto-model>` | a high-tier model |
| `<builder-model>` | Sessions and models | a builder's model | one tier below `<lead-model>` | a mid-tier model |
| `<strongest-model>` | Sessions and models | the model that needs advance approval | above every role's tier | the strongest available model |
| `<session-patterns>` | Sessions and models | session and agent names | each starts with `<project-slug>`; an agent's name ends in its model tier | `lsp-CTO`, `lsp-phase-3-tax-rates`, `lsp-builder-tax-calc-midtier` |
| `<other-project-coordinators>` | Sessions and models | each other project's Co-CTO session | that project's slug plus `-CTO`, as in `<session-patterns>`; or "none" | `tsl-CTO` (Thistle) |
| `<reference-directory>` | Sessions and models | the directory of memos from other projects, or "none" | one top-level directory; "none" when `<other-project-coordinators>` is "none" | `reference/` |
| `<question-prefix-policy>` | Sessions and models | how a session's question numbers get a prefix | free; the default is three letters from the session name | the default: `lsp-phase-3-tax-rates` asks `TAX1`, `TAX2` |
| `<impl-review-cap-policy>` | Development workflow | the round limit on ordinary IMPL rows | a round count the author states in the briefing | two rounds |
| `<working-day-start>` | Development workflow | a clock time and a time zone | free | 08:00 Europe/Dublin |
| `<work-board>` | Development workflow | the file and branch that hold the work board, or "none" | a file on a branch that never merges, or "none" | none |
| `<security-hole-escalation>` | Development workflow | the route and timing of a security-hole report | names sessions from `<session-patterns>` and `<human-name>` | the default: `lsp-CTO` within the hour, Dana the same day |
| `<architecture-suite>` | The security boundary | the command that runs the architecture tests | one `make` target per suite, one test directory per suite | `make test-architecture` (`tests/architecture/`) |
| `<repository-document>` | The security boundary | what lives where, and why each boundary path is listed; starter `templates/docs/ARCHITECTURE.md` | an upper-case document in `docs/` | `docs/ARCHITECTURE.md` |
| `<data-access-packages>` | The security boundary | the packages that hold the database handle | one package named for its job; its paths are in `<boundary-file>` | `src/larkspur/db/` |
| `<engine>` | A blanket catch | the database engine | agrees with `<test-environment-setup>` and the row-level-security paragraph | PostgreSQL |
| `<architecture-config-file>` | Data security | the file of confinement allow-rules; starter `templates/architecture.json` | the same file as `<boundary-file>` | `architecture.json`, key `restrictedImports` |
| `<workspace-install-command>` | Agent worktree discipline | the install that follows the lockfile | the package manager's frozen install | `uv sync --frozen` |
| `<hooks-directory>` | Agent worktree discipline | the tracked hooks directory; starters `templates/hooks/pre-commit`, `templates/hooks/pre-merge-commit` | a dot-directory at the repository root | `.githooks` |
| `<hooks-restore-command>` | Agent worktree discipline | the command that sets the hooks path back; starter `templates/scripts/setup.sh` | one script in `scripts/` | `scripts/setup.sh` |
| `<test-environment-setup>` | Agent worktree discipline | how a lead starts and stops the test database, or "none" when no suite needs one | a `make` target pair; the container name starts with `<project-slug>` | `make db-up`, `make db-down`; container `lsp-phase-3-tax-rates-db` |
| `<test-connection-settings>` | Agent worktree discipline | how a builder reaches its lead's database, or "none" with `<test-environment-setup>` | variables that carry `<environment-prefix>`, in the lead's `.env` | `LSP_DB_HOST`, `LSP_DB_PORT` |
| `<data-access-rules>` | The data-access rules | rules this engine and package structure add | numbered after the five; or "none" | none |
| `<platform-facts-document>` | Documents and records | platform facts with their tags and probes; starter: the "Platform facts" section of `templates/docs/PRD.md` | a section of `<product-document>` or its own file | `docs/PRD.md`, section "Platform facts" |
| `<threat-document>` | Documents and records | the threat model, or "none"; starter `templates/docs/THREATS.md` | an upper-case document in `docs/`, or "none" | `docs/THREATS.md` |
| `<decision-batch-file>` | Documents and records | the running batch of questions for the human principal; starter `templates/docs/decisions.md` | in `docs/`, beside the registers | `docs/decisions.md` |
| `<handover-document>` | Documents and records | the successor's map at a handover | an upper-case document in `docs/` | `docs/HANDOVER.md` |
| `<brief-record-template>` | Documents and records | additions to the brief or merge-record format | an upper-case document in `docs/`, or "none" | `docs/RECORDS.md` |
| `<unit-suite>` | Conventions | the unit-test command | the same pattern as `<architecture-suite>` | `make test-unit` (`tests/unit/`) |
| `<integration-suite>` | Conventions | the integration-test command, or "none" | the same pattern as `<architecture-suite>`; runs through `<locked-test-entry-point>` | `make test-integration` (`tests/integration/`) |
| `<locked-test-entry-point>` | Conventions | the wrapper that takes the port lock, or "none" when no suite needs the test environment | one script in `scripts/`, beside `<hooks-restore-command>` | `scripts/locked-test.sh` |
| `<boundary-tests>` | Conventions | how the boundary tests are selected | a test-runner marker | `pytest -m boundary` |
| `<commit-check-commands>` | Conventions | the lint, typecheck and build that both hooks run | one `make` target | `make check` (ruff, mypy, wheel build) |
| `<full-suite-command>` | Conventions | the command for the full suite | one `make` target that runs every suite target | `make test` (unit, integration, architecture) |
| `<load-threshold>` | Conventions | the load above which a reading is unreliable | about the machine's core count | 8 |
| `<dependency-audit-command>` | Conventions | the dependency audit | run through the same package manager as `<workspace-install-command>` | `uv run pip-audit` |
| `<independent-test-integration>` | Conventions | one of the two mechanisms in `phase-lead` | free | cherry-pick the contract commit onto the writer's branch |
