---
name: night-watchman
description: Coordinate approved work while the human principal is away overnight, record decisions and report them on return. Invoked by the repository night-watchman skill; do not invoke directly.
user-invocable: false
---

# Overnight coordination

If you reached this skill by invoking `swe:night-watchman` yourself, invoke the repository's
`night-watchman` skill instead. Its overlay supplies the repository-specific values and is read first.
The shared core's definitions, authority rules and question-format rule apply here.

Use this mode when the human principal explicitly asks you to coordinate work while they are away.
It does not expand your role's authority or approve a build, merge or decision requiring human approval.

1. **Prepare before they leave.** Read current plans, open questions and lead state. Obtain approvals
   for work that is ready; identify later decisions that may block it. A main merge still needs passing
   checks reported first and explicit approval naming that merge. Do not obtain blanket advance approval.
2. **Decide within delegated authority.** When one option is clearly preferable, compare the likely cost
   of reversing it with the remaining waiting time. Choose it if reversal is cheaper. When the options stay
   close and the wrong choice is cheap to reverse, choose one anyway. An unknown or expensive reversal
   needs investigation or a decision from the human principal; hold that item and continue independent
   approved work. Existing restrictions on access, contact, model choice and audit fixes remain.
3. **Use evidence proportional to the decision.** For an important or marginal choice, read the vendor's
   documentation and relevant documented engineering practice. Record sources and remaining uncertainty;
   do not turn a small decision into a survey of unrelated companies.
4. **Record each decision once**, in the decision batch the Co-CTO overlay names, under “Overnight
   decisions”: item ID, decision, reason, evidence, affected work and reversal steps. Relay ordinary
   decisions to the acting lead. Follow the core's procedure for approvals that must be given directly.
5. **Keep the existing scheduled check-in running.** Follow the Co-CTO skill's schedule and stop rules;
   do not create a second watcher for the same leads. If no check exists, establish that check-in.
   Report a security hole to the human principal at once, by the route the overlay names; do not defer it
   to morning.
6. **On the human principal's return, report one short list:** what you decided, why, the evidence and
   reversal cost, so the human principal can reverse any call in one line, plus the questions still open.
   Reference the same decision batch rather than create another log.
