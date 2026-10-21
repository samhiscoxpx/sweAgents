---
name: quick-start
disable-model-invocation: true
description: Set a repository up to use this plugin for the first time - read the repository, ask the human principal only what it cannot read, show the filled CLAUDE.md and every file to be created, and write them on approval. A standalone skill with no overlay, invoked as swe:quick-start. Use when the human principal asks to set up, install or start using the swe rules in a repository.
---

# Quick start

Set a repository up from the plugin's template: a filled `CLAUDE.md`, the vendored core, the overlay
stubs, the starters and the settings. This skill has no overlay, because it runs before the overlay
exists. It reads first, asks second, shows everything third and writes last.

**Never commit, push or overwrite an existing file without asking.** An existing file is changed only
after the human principal has seen the change as a diff and approved it: a merge for every file except
the vendored core, which is re-copied whole (section 2).

## 1. Find the plugin's own files

Every file this skill copies comes from one directory, the plugin's installed copy
`~/.claude/plugins/cache/swe/swe/<version>/`, called the plugin root below.

- **Take `<version>` from the pin**, the `ref` of the `swe` marketplace in the repository's
  `.claude/settings.json`, without its leading `v`. Where no pin exists yet, take it from the plugin
  root this skill was loaded from, the directory two levels above this skill's base directory.
- **Check the plugin root before copying anything.** The plugin root must exist, the `version` in its
  `.claude-plugin/plugin.json` must equal `<version>`, and it must hold `templates/CLAUDE.md`. That
  root's `rules/core.md` is the core you copy.
- **When the pin is older than the version this skill was loaded from, or the chosen root has no
  `templates/CLAUDE.md`, ask with `AskUserQuestion`:** A, bump the pin to the loaded version and re-copy
  the core from the loaded root, shown as a diff (recommended); B, stop. Never continue on a root
  without templates.
- **When the chosen root does not exist or its version differs from `<version>` for any other reason,**
  ask the human principal to install or update the plugin to that version, and stop until it is done.
- **The plugin root holds everything else:** `templates/CLAUDE.md`, the stubs under
  `templates/skills/`, the starters under `templates/docs/`, the hooks under `templates/hooks/`,
  `templates/scripts/setup.sh`, `templates/architecture.json`, `templates/settings.json` and the
  machine lock under `tooling/machine-lock/`. Paths below are from the plugin root.
- **The marketplace source for the pin** is the `swe` entry's `source` in
  `~/.claude/plugins/known_marketplaces.json`, the marketplace the human principal installed from. The
  pin keeps `"source": "github"` and that entry's `owner/repository`.
- **Check that the tag exists before writing the pin:** `git ls-remote --tags
  https://github.com/<owner/repository>.git v<version>`. On no output, ask with `AskUserQuestion`: A,
  stop until the tag is published (recommended); B, pin a tag the command lists, named in the tool's
  free-text "Other" answer.
- **Read `templates/CLAUDE.md` in full, including its "Blanks to fill" table.** The table is the list of
  blanks; each row says what fills it, the pattern it follows, whether "none" is allowed and which
  starter it uses.

## 2. Read the repository and derive every value you can

Derive before you ask. For each blank in the table, record the value, the file and line it came from,
and whether it was **read** (stated in the repository) or **inferred** (a recommendation). Never ask
for a value you read; offer an inferred one as the recommended option.

- **Git:** `git rev-parse --show-toplevel`. If the directory is not a git repository, ask whether to
  run `git init`, and stop until it is one.
- **Identity:** the repository's directory and remote names, for the slug and the environment prefix;
  an existing environment-variable prefix in an example environment file; the default branch; and
  `git config user.name`, offered as the inferred `<human-name>`.
- **Commands:** the manifests, lockfiles, task runners and continuous-integration files. The install
  that follows the lockfile; lint, typecheck and build; each test suite, its command and its directory;
  any marker that selects boundary tests; the dependency audit for that package manager.
- **Hooks:** `git config core.hooksPath`, any tracked hooks directory and any setup script.
- **Test environment:** container, compose or database configuration, and whether any suite needs a
  running server. If none does, the test-environment blanks are "none".
- **Documents:** for each blank with a starter, look for an existing document that already serves it,
  such as a requirements document, a security document or an issue list. An existing one is offered
  as the value; the starter is the alternative.
- **Existing setup:** `CLAUDE.md`, `.claude/settings.json`, `.claude/skills/` and `.gitignore`. Each
  one that exists is merged into, never replaced. An existing `.claude/rules/core.md` is the
  exception: it is replaced by a re-copy of the plugin root's `rules/core.md`, shown as a diff and
  approved, never merged into, because section 6 requires the two to be identical.
- **Machine:** the core count, for the load threshold.

## 3. Ask only for the rest

- **Ask with `AskUserQuestion`, at most four questions per call.** Number each question once with the
  prefix `QS` (`QS1`, `QS2`, ...) and keep the numbers and option letters if a question is asked again.
- **The tool allows about four options per question.** Where a question already has four options and
  the table allows "none", ask "none" in a later question. An answer the options do not cover, such as
  "everything except these files", goes in the tool's free-text "Other" answer.
- **Every question has lettered options.** The derived or recommended value is option A, marked
  recommended, then the alternatives the table's pattern allows, then "none" where the table allows it.
  Put the context in the question: what the blank controls, and where the recommendation came from.
- **Ask in this order, so no question rests on a guessed answer:** the human principal's name, the slug
  and the closed directories; the models for each role; the working pattern (working-day start, the
  IMPL review cap, the work board, the security-hole route); any command or suite you could not read;
  each template section whose "keep, adapt or delete" line turns on a fact you could not read, such as
  whether the API contract is to be translated to a language-neutral schema; one question per
  document blank where both an existing document and a starter are possible; then every blank still
  open, in the table's order.
- **In a repository with no lint, typecheck or build yet, offer `git diff --cached --check` as option
  A for the commit checks.** It is a real check that git ships, so the hooks run and pass on a clean
  commit. Record the blank as "not built yet; the hooks run `git diff --cached --check` until then", and
  list the real checks as remaining.
- **A blank whose subject is not built yet is filled with "not built yet",** and the first phase's plan
  names the chunk that builds it. The architecture suite, the boundary tests and the locked test entry
  point are often in this state.
- **Ask whether other projects run test suites on this machine.** If they do, offer to copy the machine
  lock from `tooling/machine-lock/` to the same relative paths under the repository's root
  (`tests/setup/` and `scripts/`); it is written for a TypeScript test runner. Wiring it into the test setup stays with the human principal.

## 4. Show everything, then wait

- **Show the filled `CLAUDE.md` as it will stand after section 6's last step,** with the setup
  scaffolding removed: the whole file when none exists, or a diff against the existing file
  when one does. A merge keeps every line the repository already has and adds the template's
  sections; a conflict between the two is a question, never a silent choice.
- **List every file to be created or changed, with its source:**
  - `CLAUDE.md`;
  - `.claude/rules/core.md`, copied from the plugin root's `rules/core.md`;
  - `.claude/skills/<name>/SKILL.md`, one per stub in `templates/skills/`;
  - each starter, at the path its blank names, with the blanks inside it filled;
  - the two hooks, in the hooks directory, and `templates/scripts/setup.sh` at the hooks-restore
    command's path;
  - the boundary file, from `templates/architecture.json`;
  - `.claude/settings.json`, from `templates/settings.json`: the marketplace with the source found in
    section 1 (`<owner/repository>`) pinned to `v<version>`, the plugin enabled, the compaction hook,
    and the test commands on `permissions.allow`;
  - `.gitignore`: the chunk scratch directory, which also holds the captures;
  - git configuration: `core.hooksPath`, set by the setup script, and
    `receive.denyCurrentBranch updateInstead`, which `merge-to-trunk` needs.
- **Mark each existing file "merge" and show its diff; mark an existing `.claude/rules/core.md`
  "replace" and show its diff.** Mark each new file "create".
- **Ask for approval with `AskUserQuestion`:** A, write everything listed (recommended); B, change a
  value first, which returns to section 3 for that value and then shows this list again; C, stop. To
  write everything except some files, the human principal names them in the "Other" answer. The
  approval covers the listed files only.

## 5. Write

- **Write on a branch, never on the default branch.** Before the first write, cut `setup/swe` from the
  default branch with `git switch -c setup/swe`; if `git status --short` shows changes, ask first
  whether to carry them onto the branch or stop. This keeps core section 5's "never work on main" from
  the first setup commit, before the rules that name the branch workflow exist.
- **Write only what was approved.** Create new files; apply the approved merge to existing ones, and
  replace an existing `.claude/rules/core.md` with the approved re-copy.
- **Fill only the blanks the table lists**, and in `settings.json` its `<owner/repository>` and
  `<version>`. Other angle-bracket text, such as `<where found>` or `<date>` in a starter and `<name>`
  in the compaction hook, is an entry format and stays.
- **Fill `<finished-registers>` by halves.** In the defect register's starter it becomes the defect
  half, such as `docs/bugs-closed.md`; in the feature register's starter, the feature half, such as
  `docs/features-landed.md`. Where the chosen finished form is a heading rather than a file, add a
  `## Closed` heading to the defect register and a `## Landed` heading to the feature register, write
  those headings as the two halves, and copy neither finished-file starter.
- **Apply each section's "keep, adapt or delete" line** as the answers decide. Leave the lines
  themselves, the "Blanks to fill" section and the opening's setup sentence in place: the check in
  section 6 searches against the table, and its last step removes them.
- **In the pre-commit hook, replace `<commit-check-commands>` with the commands alone, one command per
  line**, in the order lint, typecheck, build, without any description. The hook runs them with
  `sh -e`, so the first failing line fails the hook. If a command contains a single quote, ask how to
  write it.
- **Make both hooks and the setup script executable, then run the setup script.**

## 6. Check, and report what remains

- **Every blank is filled or reads "none":** search `CLAUDE.md`, outside its "Blanks to fill" table,
  and every copied starter, hook and script for each blank name in the table; any hit is a gap. A "none" is allowed only where the table's row allows it.
- **The hooks run:** `git hook run pre-commit` and `git hook run pre-merge-commit`, each exiting 0, with
  the capture showing the hook's `pre-commit: running` line and the commit checks' output. A failure in
  the repository's own code is reported, not fixed.
- **The vendored core matches the pin:** `diff` between `.claude/rules/core.md` and the plugin root's
  `rules/core.md` prints nothing, and the `ref` in `.claude/settings.json` is `v<version>`.
- **Each stub's front matter parses with a YAML parser, and its name matches its directory.**
- **Last, once every check above passes, remove the setup scaffolding from `CLAUDE.md`.** Remove the
  whole "Blanks to fill" section, every "*Keep, adapt or delete:*" line, and the opening's setup
  sentence that points at the blanks and their index; keep every rule sentence around it. The result
  must equal the file approved in section 4; if it differs, show the difference as a follow-up diff
  and write it only on approval. Then check again: no blank name from the table remains in
  `CLAUDE.md`, no "Keep, adapt or delete" line remains, and a markdown parser reads the file without
  error, with the template's headings in order less "Blanks to fill" and any section the answers
  deleted.
- **Report to the human principal:** the files written, the check results with their commands and exit
  codes, and what remains for them: each "not built yet" value, the machine-lock wiring if chosen, the
  first phase through `phase-plan`, and the commit. Offer the commit on `setup/swe` as a question and
  stage files by name, then offer the merge of `setup/swe` into the default branch as a separate
  question. End with a "Waiting on" section.
