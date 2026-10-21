# Testing policy

The policy for writing any test at all. A builder and a reviewer read it in full before their first
test or review. The core holds the shared policy and this file does not restate it: core section 1
defines the K, C and D tags, and core section 7 says what boundary code and ordinary code each require.
Each section below is a heading for what this repository adds; the line under it says what the section
must decide, and a section with nothing to add says "nothing".

## Test tags: what this repository adds

Any rule this repository adds to choosing K, C or D (core section 1).

## Test levels: what this repository adds

Name each level, its command in `CLAUDE.md` and what it may open. A test runs at the lowest level that
can check its claim.

## Boundary code: what this repository adds

For code inside `<boundary-file>` (core section 7): which suite holds the boundary tests and how they
are selected, and any form of adversarial input this repository's checks must always meet.

## Ordinary code: what this repository adds

For code outside it (core section 7): what counts as one outcome. An ordinary test needs a mutation
when a reviewer suspects a vacuous assertion, as `launch-builder-team-slim` says; say here how the
reviewer records the suspicion and the mutation's reading.

## A dependency's own promise

Name each dependency whose promise the boundary rests on and the one sanity suite that checks it (core
section 9).

## Case count and file budget

Set a target time or count per case at each level and a budget per test file, and say how a run
records them. Say what a file over its budget must carry: a K justification or a fix.

## Grading a test

A reviewer grades every test it reads with one of four remedies and cites this section.

- **keep:** right level, states a rule, asserts fields rather than text, inside its budget, no duplicate.
- **fix:** one of those wrong and cheap to correct in place.
- **move:** wrong level, or over budget without a K justification; rewrite it at the right level.
- **delete:** describes one bug, duplicates a test that remains, or passes with the code removed; name
  the remaining test by its assertion.
