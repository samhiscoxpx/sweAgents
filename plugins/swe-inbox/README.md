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
  the pick, or alone. A note can have several lines: type a new line as in the prompt box. Answered and withdrawn items fold below (`0` unfolds them); each one opens
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

## In a terminal of its own

`/inbox terminal` opens the same inbox in a terminal window of its own, so it can sit on another
screen. Inside tmux it opens a split; otherwise a new window of Ghostty (1.3 or later, through its
AppleScript), iTerm2, Terminal.app or WezTerm, whichever runs the session. Where none of these
applies, the command copies the line to run. One inbox terminal runs at a time: while one is open,
the command says so and opens no other. The first launch through AppleScript asks macOS to let
Claude Code control the terminal. The program is `tui/inbox.py`: Python 3, standard library only.

```
python3 plugins/swe-inbox/tui/inbox.py <main worktree>/.swe/inbox
```

↑↓ pick an item and Enter reads it: ↑↓ then scroll the message, and Esc goes back to the list.
a-h answer the item. `n` writes a note; Ctrl+J or Alt+Enter starts a new line in it, a pasted note
keeps its lines, and Enter keeps it. Once kept, a letter sends it with that pick and `s` sends it
alone. `0` shows answered and withdrawn items, which open read-only. `q` quits. It beeps when an
item arrives. An answer given there reaches the session that asked, as from the pane. An approval
cannot be given there: the terminal is not the session that acts.

It draws with plain ANSI escape codes, not curses: the macOS system Python links an ncurses
without wide-character support, which corrupts a screen holding characters such as "✓".

## Where the items live

One JSON file per item in `.swe/inbox/` under the repository's main working tree, so every
worktree's session reads the same inbox. The mod writes `.swe/.gitignore` (`*`), so git ignores the
folder. Each session reads the folder every three seconds.

A session picks its inbox folder when it starts, or when the mod reloads, from the repository its
project root is in. A session that moves to another project mid-way uses that project's inbox from
its next reload.

The file system has no exclusive create. A session reads each new file back and takes the next
W-number if another session wrote over it. Two sessions that file in the same few milliseconds can
still lose one item. Filing goes through the Co-CTO in the usual flow, so this is rare.

## Develop

```
claude plugin validate plugins/swe-inbox
claude plugin test plugins/swe-inbox
python3 -m unittest discover -s plugins/swe-inbox/tui
claude --plugin-dir plugins/swe-inbox
```
