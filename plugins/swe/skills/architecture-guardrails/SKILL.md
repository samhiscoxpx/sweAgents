---
name: architecture-guardrails
description: How to design and enforce package boundaries so that coding agents cannot tangle a codebase - one public entry point per package, each dangerous dependency restricted to one package, one architecture config file of allowlists, architecture tests that parse the code and fail closed, and fixture repositories that prove each test can fail. Use when starting a repository, adding a package, or adding an architecture rule. Carries a TypeScript and pnpm recipe and a Python and uv recipe.
---

# Architecture guardrails

## The problem this skill solves

A coding agent takes the shortest route that compiles. If a module's internals can be imported, the
agent imports them. If the database client can be imported anywhere, queries spread through the
codebase. A rule written in a document does not stop this, because an agent under pressure does not
re-read the document; it reads the code it can reach.

So this skill does not ask agents to follow architecture rules. It makes the build refuse the forbidden
imports, and it adds tests that prove the refusals still work. An agent that tries a forbidden route
gets a build error and takes the permitted route instead.

## What to do

Apply each of these rules in every repository that uses this skill.

1. **Make the package the unit of architecture.** Each package declares its dependencies in its own
   manifest (`package.json`, `pyproject.toml`). A package may import only what its manifest declares.
2. **Give each package exactly one public entry point.** Other packages import only that entry point.
   Every other file in the package is internal, and an import of an internal file must fail the build.
   Agents can still read internal files, because they are in the same tree; the build makes using them
   impossible.
3. **Never give a package a second entry point. Split it into two packages instead.** When a package
   holds a dangerous dependency and also holds harmless values that many packages need (error classes,
   shared types), move the harmless values to a separate package that does not declare the dangerous
   dependency. Any package may import the separate package. A second entry point would need an extra
   rule saying who may use which entry point, and every extra rule is one more thing to get wrong.
4. **Restrict each dangerous dependency to one package.** Examples: the database client, the query
   builder, the environment variables, the function that reveals a secret value. Only the owning package
   imports it. Other packages call the owning package's functions. No function outside the owning package
   takes a connection or handle as a parameter.
5. **Prefer removing an import path to adding a runtime check.** A runtime check protects only the cases
   its author thought of; every other case passes. An import the build refuses has no other cases.
6. **Keep every allowlist in one architecture config file at the repository root.** The file lists, for
   each restricted import, the files allowed to use it, with a reason per entry. Use allowlists, not
   denylists: a denylist permits everything not written on it, so a new file or package is permitted by
   default. An allowlist refuses everything not written on it. A change to the file needs the human
   lead's approval. Never keep an allowlist anywhere else, for example as a constant in a test file,
   because it then changes without that approval.
7. **Derive the set of files and packages to check from the repository's structure.** Read the workspace
   definition, the manifests and the source tree. Never keep a hand-written list of files to check: a
   file added later is not on it, so it is never checked. Comparing a hand-written expectation against
   the derived set is fine, because any difference fails the test.
8. **Write architecture tests that parse the code.** Use the language's own parser or compiler API,
   never a text search: an import split across lines, or a dynamic import, does not match a text
   pattern, and the test passes without checking it.
9. **Make every architecture test fail closed.** A file that will not parse is an error. A guarded
   symbol (for example the `Secret` class) that no longer exists is an error. A glob in the config file
   that matches no file is an error. A test that finds nothing to check must fail, not pass.
10. **Prove that each test can fail.** For each rule, a test builds a small fixture repository in a
    temporary directory, adds one forbidden import to it, and asserts that the architecture test reports
    that import, with the rule, the file and the form. Also delete the guarded code once, run the test,
    see it fail, and restore the code.
11. **Run the checks on every commit and every merge.** The `pre-commit` hook runs lint, typecheck and
    build. Git does not run `pre-commit` for a merge commit, so a `pre-merge-commit` hook runs the same
    checks. The architecture tests run before work merges into its branch and again in `pre-push`. Never
    use `--no-verify`.
12. **Additional ordinary-code mechanisms require an observed failure.** The commit names that failure,
    adds the fixture test and adds the config entry. Boundary controls and their required tests
    need no prior incident. The initial setup prescribed below is also permitted without a prior incident.

## Example layout

```
repo/
  architecture.json            # every allowlist; changes need the human lead's approval
  pnpm-workspace.yaml          # packages: ["apps/*", "packages/*"]
  apps/
    web/                       # imports only the packages its manifest declares
  packages/
    db/                        # the only package that imports the database client
      package.json             # exports: { ".": ... } and nothing else
      src/index.ts             # the public entry point
      src/queries.ts           # internal: an import from outside fails the build
    errors/                    # harmless shared values, split out of db; any package may import it
    orders/                    # calls db's functions; never holds a connection
  scripts/hooks/
    pre-commit                 # lint, typecheck, build
    pre-merge-commit           # runs pre-commit
    pre-push                   # architecture tests
  tests/architecture/
    detectors/                 # parse the code with the TypeScript compiler API
    restricted-imports.test.ts # one case on the real repository, fixture cases per rule
    fixture-repository.ts      # builds a throwaway workspace in a temporary directory
```

## The recipe in a TypeScript and pnpm workspace

**Declared dependencies.** A package reaches another only by declaring it as `"@scope/x": "workspace:*"`.
pnpm's default `node_modules` layout does not resolve an undeclared package, so an undeclared import
fails the build.

**One entry point.** Each `package.json` publishes one subpath:
`"exports": { ".": { "types": "./dist/index.d.ts", "default": "./dist/index.js" } }`. An import of
`@scope/db/src/queries` cannot be resolved by Node or by TypeScript with `NodeNext` resolution. An
architecture test refuses any manifest with a second subpath or without a root entry. Consumers import
the built `dist/` output, so the hook runs lint, then typecheck, then build, and the tests read what the
build writes.

**`architecture.json`.** Its sections, each entry with a reason:

| section | what it decides |
|---|---|
| sensitive paths | the files where one mistake exposes data, and why |
| declared dependencies | what each package may declare, compared in full against every `package.json` |
| restricted imports | for each dangerous dependency, the globs of files allowed to import or call it |
| entry-point construction | which packages the server builds only in its entry file, and which its route handlers may import |
| client runtime | what a front-end app may import at run time, and the directive each kind of file must start with |
| JavaScript files | the only `.js` files allowed, so no code bypasses the type checker |
| credential exemptions | each line that looks like a credential and is not, quoted exactly, with its reason |

**The architecture tests.** In `tests/architecture/`:

- Each detector builds a `ts.Program` and analyzes its syntax tree. It resolves each import, static or
  dynamic (`import("x")`), to a workspace package or a dependency, and checks it against the manifest
  and `architecture.json`.
- The files to analyze come from the workspace globs plus `scripts/` and `tests/`. A source file outside
  them is an error, and so is a `.js` file not in the JavaScript files section.
- Each failure to decide has its own error class (unparseable file, missing guarded symbol, empty glob)
  and its own fixture test.
- A rule that the linter can express goes in the lint config, with its list derived from the platform.
  Example: "a pure package imports no Node built-in" is ESLint's `no-restricted-imports` plus a
  `no-restricted-syntax` selector for `import()`, both built from `node:module`'s `builtinModules`.

**Typical restricted imports:**
- the database client and the query builder: the data-access package only;
- `process.env`: named entry files only, which read configuration once and pass it down;
- SQL text: one file per package, as literal statements run by name;
- the function that reveals a secret value: named files only.

## The recipe in Python with uv

**Python refuses no import by itself.** One virtual environment makes every installed package
importable from every file, and every submodule importable by its dotted path. So in Python the
architecture tests do all the enforcement, and they must exist from the first commit.

**Example layout:**

```
repo/
  architecture.toml            # every allowlist; changes need the human lead's approval
  pyproject.toml               # [tool.uv.workspace] members = ["packages/*", "apps/*"]
  packages/
    storage/
      pyproject.toml           # the only package that declares sqlalchemy
      src/storage/__init__.py  # the public entry point, with __all__
      src/storage/_queries.py  # internal: leading underscore, refused from outside
    storage_errors/            # harmless shared values, split out of storage
    orders/                    # calls storage's functions; never holds a session
  apps/api/src/api/entry.py    # the only file that reads os.environ
  scripts/hooks/               # pre-commit, pre-merge-commit, pre-push
  tests/architecture/          # ast-based tests and their fixture repositories
```

**Tooling.**
- A uv workspace. Each package's `pyproject.toml` declares its dependencies, workspace members included
  (`[tool.uv.sources] storage = { workspace = true }`). Install with `uv sync --frozen`.
- `src/` layout in each package, so no file imports a package by accident from the current directory.
- pyright in strict mode, or `mypy --strict`, over every package in the hook. Each package ships
  `py.typed`.
- ruff with `banned-api` for single-name bans. `banned-api` is a denylist, so it is an extra layer only;
  the architecture tests are the rule.

**One entry point.** A package's entry point is its `__init__.py` with an explicit `__all__`. Every other
module name starts with an underscore. Outside the package, an import must name the package root
(`import storage`, `from storage import save_order`), never a submodule, and the name must be in
`__all__`. A test helper is its own package too (`storage_testing`).

**`architecture.toml`.** `sensitive_paths` with reasons; `restricted_imports`, for example
`sqlalchemy = ["packages/storage/**"]` and `os.environ = ["apps/*/src/*/entry.py"]`; and the declared
dependency allowlist per package.

**The architecture tests.** A pytest suite in `tests/architecture/` on the standard `ast` module. It
analyzes every `.py` file under the workspace members, `scripts/` and `tests/`, derived from the uv globs,
and errors on a `.py` file outside them. It resolves each import to a workspace package or an installed
distribution (`importlib.metadata.packages_distributions()`) and checks four things:
1. **Declared:** the importing package's `pyproject.toml` declares the target.
2. **Entry point:** the import names the package root and a name in its `__all__`.
3. **Restricted:** each restricted import is used only from its allowed globs.
4. **No bypass:** `importlib.import_module`, `__import__`, `exec`, `eval` and changes to `sys.path`
   are refused outside allowed files.

It fails closed: a `SyntaxError` fails the run, every guarded symbol must exist, every glob must match a
file. Its fixture repositories are small uv workspaces written into `tmp_path`, with one case per rule and
per import form: `import a.b`, `from a import b`, `from a.b import c`, a relative import that leaves its
package, and `importlib`.

**Restricted dependencies in Python terms.**
- One package builds the database engine or session and exports business functions, never the session.
- The entry file reads `os.environ` into a frozen dataclass or a settings object and passes it down.
- A secret is a wrapper type whose `__repr__` and `__str__` hide the value; its one revealing method is a
  restricted import.
- The API contract is one package of models that imports only the standard library and its model library.

**Existing tools.** `import-linter` and `tach` each enforce part of this and are a fast start. By default
neither fails on an unparseable file or a missing guarded symbol, and neither ships fixture tests that
prove a contract still fires. Add both. A contract that matches nothing reports the same passing result as
a contract that holds.

## Starting a repository

1. Create the workspace with one package and its single entry point.
2. Create the architecture config file with empty sections and a header line saying that changes need
   the human lead's approval.
3. Write the first architecture tests: declared dependencies, and one entry point per package. Give
   each rule one case on the real repository and one fixture case.
4. Install the hooks from a setup script (`git config core.hooksPath scripts/hooks`), and prove each one
   with `git hook run <name>`.
5. Restrict the database client before a second package wants it.

## Signs the guardrails are eroding

- An allowlist kept outside the architecture config file, for example as a constant in a test file.
- A package with a second entry point.
- An architecture test that searches text, or that skips a file it cannot parse.
- A failing check fixed by adding an entry to an allowlist, without asking why the new file needs the
  dependency.
- A rule with no fixture test, or a fixture test nobody has seen fail.
