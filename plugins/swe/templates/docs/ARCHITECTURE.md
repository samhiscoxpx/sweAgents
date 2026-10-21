# Repository architecture

What lives where, which package may declare what, and why each kind of path is inside the security
boundary. The list of boundary files lives only in `<boundary-file>`; this document explains it and
never restates it.

## Packages and what each one owns

One line per package or top-level directory: its job and its public entry point.

## What each package may declare and import

Point at `<architecture-config-file>` for the allow-rules and say what each kind of rule protects.

## Why each kind of path is inside the boundary

For each of the six kinds in `CLAUDE.md` that occurs here, say which paths have it and why one mistake
there crosses a scope.

## What the lower layers refuse

For each property code outside the boundary relies on, name the boundary file and line that provides it.
