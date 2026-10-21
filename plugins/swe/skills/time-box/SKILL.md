---
name: time-box
description: Shared core of the time box, which keeps a piece of work inside its time box and makes it stop and raise when it is not. Invoked by the repository's own time-box skill; do not invoke directly.
user-invocable: false
---

# Time box, shared core

If you reached this skill by invoking `swe:time-box` yourself, stop and invoke the repository's
`time-box` skill instead; it invokes this one and holds the repository's own rules.

This is the shared core; the repository's own skill of the same bare name holds its overlay and was read
before this.

Every piece of work has a time box: wall-clock hours from the plan, or an estimate stated before work starts.
The estimate may be wrong. The time box is a signal to report delay and decide what happens next, not a
target or a reason to cut corners. Never overrun silently.

## 1. Doing the work

- **Start by writing the time box file.** The time box file is one file in your scratch directory, written once at
  start, holding `box: <hours>` and `start: <clock time>`. Obtain the start from the system clock, never
  guess it. For example, replace `<hours>` and `<scratch>` in
  `printf 'box: %s\nstart: %s\n' '<hours>' "$(date '+%FT%T%z')" > <scratch>/box-start`.
  Say both readings in your first message. Never write "now"; write what the clock printed.
- **Nobody reports an elapsed figure.** An agent says where it is in words that carry no precision: early
  in the time box, near the time box, over the time box. The two readings that matter have side effects, and someone else
  checks them: the time box file's content, and git's author dates on the work's commits. A lead reads a
  builder's transcript timestamps and its commits, never its claim. A record quotes git's bound. A reading
  with no side effect cannot be made trustworthy by rules about how to write it down, so it is not written
  down. Agents asked to report elapsed time made the figure up, from tool-call counts, from an earlier
  message, or from an estimate that drifted upward, and some wrote it in the exact format the rule asked
  for.
- **At half the time box, send one line upward with `SendMessage`, without being asked:** what is done, the current commit, and
  what is in the way.
- **Quote any measured figure from command output already in context, never from expectation.** This
  covers a clock reading, a suite duration, a count and a tree hash. Read it in the same tool call as the
  message that reports it. A hash or a count in a message is evidence only while nobody rewrites it, so do
  not amend and restamp a message that carries one. Put a later edit somewhere else, because a restamped
  hash is worthless even when the new value is right.
- **"Near the time box" and "at the time box" are read, never judged.** An agent says either only after it reads
  its time box file and the clock, and the message quotes both readings. Work remaining is not a clock: an agent
  that judges the time box from the work it sees ahead can stop a few minutes into a two-hour time box.
- **At the time box, stop.** Do not start another attempt. Report the state, what is blocking, what you would
  do next, and what an extension would buy. The person you report to decides: extend once with a reason,
  change the approach, or defer the piece. A second extension goes one level higher.
- **Some things are a stop before the time box.** A run whose every failure is a timeout is invalid, not an assertion failure.
  Report it; the lead may retake only the timed-out files, once, alone, at a quiet moment. A second invalid run
  on the retake means the suite produces unreliable results: stop and report. Other signs of a suite producing unreliable results, such as
  an otherwise valid run far over its usual time, a test environment refusal or a build past its timeout, also require a stop.
  Record the reading and load. Never retry for a better pass or a better number, or loop. Two consecutive attempts at the
  same fix that fail the same way are also a stop: the next attempt is a conversation, not a retry.

## 2. Watching the work

Whoever starts a piece of work keeps the backstop clock, because the agent doing the work is the one least
likely to notice the time. Set the clock against the piece worth hearing about. For a chunk that is the
chunk, not its builder's time box, because a chunk outlives its builder by review rounds and fix commits. Cancel
a clock when the piece it watched is finished, or it fires after the merge into the phase branch and costs a check for nothing.

- **A session**, a lead or a Co-CTO, sets a scheduled check at the time box for each piece it starts, with
  `CronCreate` and one fire. When it fires, read the agent's transcript timestamps, not its claim. If the
  agent is still running past the time box, tell it to stop and report. If it reported done, the actual duration you relay
  is the one the timestamps give; the agent's own words about pacing are not a number.
- **A background sub-agent has no clock that rings.** It has only the time box file, the habit above and the
  session's check. Its brief states the time box and says that a stop at the time box is expected.
- **A teammate may set its own check as well.** The session's check stays, because it costs nothing and
  it is the one that was measured.
- **Record the time box, start and either end time or the commit whose time bounds the work** in the chunk
  record and merge commit's readings block. Read the time box and start from the time box file; read an end time
  from the system clock or use the named commit's timestamp. Compute actual duration from those readings, never
  estimate it. Check every record-reading tool before renaming fields.
- **A time box that overran twice on the same kind of work is a plan defect.** File it against the plan; do not
  re-estimate quietly in place.
