---
name: cto-handover
description: Shared core for writing a handover document when a Co-CTO or a lead retires from a role, a map of about two pages that a successor can act on without prior context. Invoked by the repository's own cto-handover skill; do not invoke directly.
user-invocable: false
---

# Handover, shared core

If you reached this skill by invoking `swe:cto-handover` yourself, stop and invoke the repository's
`cto-handover` skill instead; it invokes this one and holds the repository's own rules.

This is the shared core; the repository's own skill of the same bare name holds its overlay and was read
before this.

Write one markdown document of about two pages, for a successor who arrives with no context. It is the
handover document the overlay names, written as a file in the repository and never as an Artifact. It is a
map, not a diary.

## 1. What the handover must meet

- **Clear and actionable:** a newcomer reads it and knows what the project is, where it stands and what to
  do next.
- **Open questions are expected.** Frame them as the successor's agenda.
- **No contradictions**, inside the document or against the tree.

## 2. What it covers

1. **What the project is.** The founding constraint comes first: what the security boundary is and what
   happens when it fails. Then the package layout, which code is boundary code, and the rule that governs
   the rest.
2. **The work so far.** Each phase, what it delivered and its merge commit; the patterns everything rests
   on; what is released and to whom.
3. **How we work.** The session model and the rules that cost most when missed: merge approval, who pushes
   `main`, git hygiene, messages to another project's sessions, closed directories, and where each kind of
   fact lives.
4. **Where we are now.** The exact, verified state: the commits, what is pushed and what is not, what is
   kept and what is withdrawn, and what is in flight, such as reviewers and containers. Check every claim
   against the tree.
5. **The open design.** The decisions that are genuinely unfinished, framed as the successor's agenda to
   settle, and grouped as one problem where they are one. This is the most valuable section. Do not soften
   it into false confidence.
6. **Next steps**, in order, each naming the decision or the document it produces.

## 3. Disciplines

- **Put any required fact that exists only in memory into the handover before deleting that memory.**
  The successor must be able to find it. Reference the repository's documents by path.
- **No regrets.** Leave out the mistakes you made and the history of a confusion you cleared. The successor
  inherits the map, not the muddle.
- **Name what stands and what unfinished work the successor must take over.** For withdrawn or in-flight work, say exactly which
  parts survive and which must be redone. Never write "most of it stands".
- **Verify against the tree, and trust a document only where it is current.** "Trust the tree" is safe
  advice only if the documents it points to are current. If one carries stale wording, say so and point at
  the settled design, or the reader goes wrong on the exact detail you flagged.
- **Keep open questions apart from contradictions.** The first are the agenda; the second are defects.

## 4. Process

1. Draft the six sections, and verify the state against the tree: the commits, what is pushed, what is kept
   and what is withdrawn.
2. Have a reviewer read it without prior context, as a newcomer, and also check it against the tree for contradictions. Use
   the standing reviewer or spawn one through the `staff-engineer-review` skill. Ask it to separate the
   contradictions and hedges that must be fixed from the open questions that may stay.
3. Fix every contradiction and hedge, and leave the open questions. Ship when a newcomer could act on it.
