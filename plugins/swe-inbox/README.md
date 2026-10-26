# swe-inbox

An inbox for the questions and decisions that `swe` sessions put to the human principal. The
questions stay in a pane beside the chat, so the principal does not scroll back through the
transcript to find a "Waiting on" list.

It is optional and changes no rule of the `swe` core. It is a Claude Code mod: a plugin with a
hooks module, which needs a Claude Code build with function hooks.

## Install

```
/plugin install swe-inbox@swe
```

Install it in every session of the repository: the Co-CTO and each lead.

## What it does

- **Agents file each question with a tool.** `mcp__swe-inbox__ask` takes the kind, a one-line
  title, self-contained context, who raises it, and the options with their cost and `[REC]`. It
  gives the item the next W-number and returns it. The chat keeps its lettered prose and uses that
  number. `revise` adds an option, moves `[REC]`, changes the context or withdraws an item, and
  keeps every letter and number. `list` serves the status update and the walk-through.
- **The principal answers in the pane.** `/inbox` opens it; `/inbox` again, or Esc while the pane
  has the keyboard, closes it. Digits pick an item and letters pick an option; a note can go with
  the pick, or alone. Answered and withdrawn items fold below (`0` unfolds them); each one opens
  read-only, with the option picked, the note, and when and where it was answered.
- **The answer goes back to the session that asked.** It arrives there as a prompt that starts
  "Inbox answer", so a lead acts on a decision the principal gave in the Co-CTO's pane.
- **Typing `W7: B` in the chat answers W7 too.** The chat and the inbox stay in step.
- **Approvals stay in the acting session.** A merge approval or a change requiring human approval
  (kind `approval`) is never answered for another session. In the session that raised it, picking
  an option fills the prompt with `W7: A`, and the principal sends it, so the approval is their own
  word in that session, as the core requires.
- **A status line shows the open count** (`Inbox: 2 open, 1 approval · /inbox`), and a toast
  announces each new item. The pane opens by itself when a new item arrives and the terminal is
  wide enough to dock it.

The `ask` tool's description tells agents to file questions this way. The mod also adds the same
text to the system prompt, where no managed plugin passes that hook by.

## Where the items live

One JSON file per item in `.swe/inbox/` under the repository's main working tree, so every
worktree's session reads the same inbox. The mod writes `.swe/.gitignore` (`*`), so git ignores the
folder. Each session reads the folder every three seconds.

The file system has no exclusive create. A session reads each new file back and takes the next
W-number if another session wrote over it. Two sessions that file in the same few milliseconds can
still lose one item. Filing goes through the Co-CTO in the usual flow, so this is rare.

## Develop

```
claude plugin validate plugins/swe-inbox
claude plugin test plugins/swe-inbox
claude --plugin-dir plugins/swe-inbox
```
