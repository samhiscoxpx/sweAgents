---
name: walk-through
description: Present existing open decisions with self-contained context and options, then record and relay answers. Invoked by the repository walk-through skill; do not invoke directly.
user-invocable: false
---

# Walk through open decisions

If you reached this skill by invoking `swe:walk-through` yourself, invoke the repository's
`walk-through` skill instead. Its overlay supplies the repository-specific values and is read first.
The shared core's definitions, authority rules and question-format rule apply here.

Use this skill when the human principal explicitly asks to resolve the open questions now.

1. **Collect existing open questions** from the current “Waiting on” list, the decision batch and
   questions asked since. Deduplicate by identity; keep IDs, order and option letters. Do not invent
   new questions for this list. Retire only items answered or withdrawn.
2. **Make each question self-contained.** Explain what the subject is, what happened, why a decision
   is needed and what is blocked. Name who raised it, the finding or event, and when. Do not assume
   the earlier explanation is visible. Use the core's writing standard, use no euphemism and explain
   unfamiliar terms.
3. **Explain each option's benefit, cost and risk.** Name time, code, review effort, quota or later
   work where relevant. For a risk, say what can go wrong and how bad that is. Mark a recommendation
   with `[REC]` and say why; keep its existing letter and position.
   If no option is better, say so. Name unknowns, their effect and what evidence would settle them.
4. **Present questions under the core's question-format rule.** Put the context in the question and
   consequences in option descriptions. Put stable IDs and option letters in tool-visible labels so
   each answer maps to the existing record. Ask at most four questions per call, within the tool's
   supported limit. Process the answers, then continue with the next batch until no questions remain
   or the human principal stops. Do not ask dependent questions on guessed answers.
5. **Process answers before acting.** Restate each decision with its ID. An ambiguous or partial
   answer, a question or a request for detail leaves that item open: explain or clarify, then wait.
   Relay ordinary decisions to the session that acts. Identify approvals that the core, or the overlay,
   requires the human principal to give directly in the acting session; the relay does not supply
   those approvals.
6. **Record decisions in their authoritative home**, including the decision batch where applicable.
   Shared memory may hold a durable decision fact, never a role instruction or plan. Finish with the
   remaining “Waiting on” list, preserving identities and option letters.
