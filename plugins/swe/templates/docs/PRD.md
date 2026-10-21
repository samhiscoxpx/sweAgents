# Product requirements

What we build and why. Every session starts here; `CLAUDE.md` says how we work, this document says
what we are building.

## What this is

Two or three sentences: the product, who uses it and the problem it solves.

## Who uses it

Each kind of user or calling system, and what each one must be able to do.

## Decisions everything rests on

Numbered, one per line, each with its date and who decided it. A change to one needs the human
principal's word.

## Architecture

The components, the paths a request takes between them, and where the security boundary sits.

## Platform facts

One entry per fact about the engine, driver, cloud or toolchain:
`- **<fact name>** [verified | reasoned | inherited] <the statement>. Probe: <path, or none yet>.
Source: <the vendor document or the repository that measured it>.` Core section 9 governs these
entries: no chunk builds on a fact until a probe has run it here and its entry says verified.
