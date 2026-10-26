#!/usr/bin/env python3
"""The swe inbox in a terminal of its own.

Reads and answers the same items as the swe-inbox pane: one JSON file per
item in <main worktree>/.swe/inbox/. Each session's mod delivers an answer
to the session that asked, so this program only shows items and writes
answers. Standard library only.

    python3 inbox.py <inbox folder>
"""

from __future__ import annotations

import json
import os
import re
import select
import sys
import tempfile
import termios
import textwrap
import time
import tty
import unicodedata

POLL_S = 1.0
TITLE = "swe inbox"
# Names the running inbox, so /inbox terminal opens one window, not several.
PID_FILE = "terminal.pid"
ITEM_FILE = re.compile(r"^W(\d+)\.json$")


def load(folder: str) -> list[dict]:
    items = []
    try:
        names = os.listdir(folder)
    except FileNotFoundError:
        return []
    for name in names:
        if not ITEM_FILE.match(name):
            continue
        try:
            with open(os.path.join(folder, name), encoding="utf-8") as handle:
                items.append(json.load(handle))
        except (OSError, ValueError):
            # A file a session is writing now; the next poll reads it.
            continue
    return sorted(items, key=lambda item: int(item["id"][1:] or 0))


def write(folder: str, item: dict) -> None:
    # Write beside the file and rename, so a reader never sees half a file.
    handle, temporary = tempfile.mkstemp(dir=folder, prefix=".tmp-", suffix=".json")
    with os.fdopen(handle, "w", encoding="utf-8") as out:
        out.write(json.dumps(item, indent=2, ensure_ascii=False) + "\n")
    os.replace(temporary, os.path.join(folder, f"{item['id']}.json"))


def answer(folder: str, item_id: str, letter: str | None, note: str) -> str:
    """Answer an open decision; returns what happened, for the status line."""
    current = next((item for item in load(folder) if item["id"] == item_id), None)
    if current is None or current["status"] != "open":
        return f"{item_id} is no longer open."
    if current["kind"] == "approval":
        return f"{item_id} is an approval: give it in the session of {current['from']}."
    given: dict = {"at": int(time.time() * 1000), "sessionId": "terminal", "via": "terminal"}
    if letter is not None:
        given["letter"] = letter
    if note:
        given["text"] = note
    write(folder, {**current, "status": "answered", "answer": given})
    return f"Answered {item_id}{': ' + letter if letter else ''}. The asking session receives it within seconds."


def running_pid(folder: str) -> int | None:
    try:
        with open(os.path.join(folder, PID_FILE), encoding="utf-8") as handle:
            pid = int(handle.read().strip())
        os.kill(pid, 0)
    except (OSError, ValueError):
        return None
    return pid


def clock(ms: int) -> str:
    return time.strftime("%H:%M", time.localtime(ms / 1000))


# -- drawing -----------------------------------------------------------------
# Plain ANSI, the whole screen each frame. Not curses: the macOS system Python
# links an ncurses without wide-character support, which miscounts "›", "✓"
# and "─" and leaves stale text on screen.

RESET = "\x1b[0m"
BOLD = "\x1b[1m"
DIM = "\x1b[2m"
INVERSE = "\x1b[7m"
GREEN = "\x1b[32m"
YELLOW = "\x1b[33m"
ACCENT = "\x1b[35m"

Line = list  # of (text, style) pieces


def cells(text: str) -> int:
    return sum(
        0 if unicodedata.combining(char) else 2 if unicodedata.east_asian_width(char) in "WF" else 1
        for char in text
    )


def clip(text: str, room: int) -> str:
    used = 0
    for index, char in enumerate(text):
        used += cells(char)
        if used > room:
            return text[:index]
    return text


def paint(line: Line, columns: int, fill: str = "") -> str:
    out, used = [], 0
    for text, style in line:
        piece = clip(text, columns - used)
        if not piece:
            break
        out.append(f"{style}{piece}{RESET}")
        used += cells(piece)
    if fill and used < columns:
        out.append(f"{fill}{' ' * (columns - used)}{RESET}")
    return "".join(out) + "\x1b[K"


def wrapped(text: str, width: int, style: str = "", indent: str = "") -> list[Line]:
    lines = []
    for paragraph in text.split("\n"):
        for row in textwrap.wrap(paragraph, width, subsequent_indent=indent) or [""]:
            lines.append([(row, style)])
    return lines


# -- keys --------------------------------------------------------------------

ESCAPES = {b"[A": "up", b"[B": "down", b"[C": "right", b"[D": "left", b"OA": "up", b"OB": "down", b"OC": "right", b"OD": "left"}


def read_key(fd: int, timeout: float) -> str | None:
    if not select.select([fd], [], [], timeout)[0]:
        return None
    first = os.read(fd, 1)
    if first == b"\x1b":
        if not select.select([fd], [], [], 0.03)[0]:
            return "esc"
        return ESCAPES.get(os.read(fd, 8)[:2], "")
    if first in (b"\r", b"\n"):
        return "enter"
    if first in (b"\x7f", b"\x08"):
        return "backspace"
    if first in (b"\x03", b"\x04"):
        return "quit"
    extra = 3 if first[0] >= 0xF0 else 2 if first[0] >= 0xE0 else 1 if first[0] >= 0xC0 else 0
    data = first + (os.read(fd, extra) if extra else b"")
    return data.decode("utf-8", "replace")


# -- the inbox ---------------------------------------------------------------


class Inbox:
    def __init__(self, folder: str) -> None:
        self.folder = folder
        self.items: list[dict] = []
        self.selected: str | None = None
        self.is_showing_closed = False
        # "list" picks an item, "message" reads it, "note" types a note.
        self.focus = "list"
        self.back = "list"
        self.note = ""
        self.draft = ""
        self.status = ""
        self.scroll = 0
        self.list_top = 0
        self.seen: set[str] | None = None

    def refresh(self) -> None:
        self.items = load(self.folder)
        if self.seen is not None:
            arrived = [i for i in self.items if i["id"] not in self.seen and i["status"] == "open"]
            if arrived:
                sys.stdout.write("\a")
                self.status = "New: " + ", ".join(f"{i['id']} from {i['from']}" for i in arrived)
        self.seen = {item["id"] for item in self.items}

    def rows(self) -> list[dict]:
        open_items = [item for item in self.items if item["status"] == "open"]
        closed = [item for item in self.items if item["status"] != "open"]
        return open_items + (list(reversed(closed)) if self.is_showing_closed else [])

    def current(self) -> dict | None:
        rows = self.rows()
        found = next((item for item in rows if item["id"] == self.selected), None)
        if found is None and rows:
            found = rows[0]
            self.selected = found["id"]
            self.scroll = 0
        return found

    def move(self, step: int) -> None:
        ids = [item["id"] for item in self.rows()]
        if not ids:
            return
        index = ids.index(self.selected) if self.selected in ids else 0
        self.selected = ids[max(0, min(len(ids) - 1, index + step))]
        self.scroll = 0

    # -- frame --------------------------------------------------------------

    def frame(self, columns: int, height: int) -> list[str]:
        rows = self.rows()
        current = self.current()
        open_count = sum(1 for item in self.items if item["status"] == "open")
        closed_count = len(self.items) - open_count
        out = [paint([(f" {TITLE} · {open_count} waiting on you · {closed_count} answered or withdrawn", INVERSE)], columns, INVERSE), ""]

        room = max(3, min(len(rows), height // 3))
        index = next((i for i, item in enumerate(rows) if current and item["id"] == current["id"]), 0)
        self.list_top = min(max(self.list_top, index - room + 1), index)
        shown = rows[self.list_top:self.list_top + room]
        if not any(item["status"] == "open" for item in self.items):
            out.append(paint([("  Nothing is waiting on you.", DIM)], columns))
        for item in shown:
            out.append(paint(self.row(item, current, columns), columns, INVERSE if self.is_row_lit(item, current) else ""))
        while len(out) < 2 + room + (0 if any(i["status"] == "open" for i in self.items) else 1):
            out.append("\x1b[K")
        more = f" · {len(rows) - self.list_top - len(shown)} more below" if self.list_top + len(shown) < len(rows) else ""
        toggle = "▾" if self.is_showing_closed else "▸"
        out.append(paint([(f"  {toggle} Answered or withdrawn ({closed_count}) · 0{more}", DIM)], columns))

        if current is None:
            reading = [("", "")]
        elif self.focus == "message":
            reading = [(f" ▌Reading {current['id']} · ↑↓ scroll · Esc back to the list", INVERSE + ACCENT + BOLD)]
        else:
            reading = [(f"── {current['id']} · Enter to read and scroll ", DIM)]
        out.append(paint(reading, columns, INVERSE + ACCENT if self.focus == "message" else ""))

        body = self.detail(current, columns - 4) if current else []
        body_room = max(1, height - len(out) - 3)
        self.scroll = max(0, min(self.scroll, max(0, len(body) - body_room)))
        visible = body[self.scroll:self.scroll + body_room]
        for line in visible:
            out.append(paint([("  ", "")] + line, columns))
        while len(out) < height - 3:
            out.append("\x1b[K")
        below = len(body) - self.scroll - len(visible)
        out.append(paint([("─" * (columns - 14), DIM), (f" {below} more ↓" if below > 0 else "", ACCENT)], columns))
        out.append(paint(self.status_line(), columns))
        out.append(paint([(self.keys(), INVERSE)], columns - 1, INVERSE))
        return out[:height]

    def is_row_lit(self, item: dict, current: dict | None) -> bool:
        return self.focus == "list" and current is not None and item["id"] == current["id"]

    def row(self, item: dict, current: dict | None, columns: int) -> Line:
        is_current = current is not None and item["id"] == current["id"]
        lit = INVERSE if self.is_row_lit(item, current) else ""
        if item["status"] == "open":
            tag, tag_style = item["kind"], (YELLOW if item["kind"] == "approval" else DIM)
        elif item["status"] == "answered":
            tag, tag_style = f"✓ {(item.get('answer') or {}).get('letter', 'note')}", GREEN
        else:
            tag, tag_style = "withdrawn", YELLOW
        meta = f" {item['from']} {clock(item['createdAt'])} "
        title_room = max(10, columns - 21 - cells(meta))
        title = clip(item["title"], title_room).ljust(title_room)
        marker = "›" if is_current else " "
        mark_style = (ACCENT + BOLD) if is_current and self.focus != "list" else ""
        return [
            (f" {marker} ", lit + mark_style),
            (f"{item['id']:<5}", lit + (BOLD if is_current else "")),
            (f"{tag:<10}", lit + tag_style),
            (title, lit),
            (meta, lit + DIM),
        ]

    def detail(self, item: dict, width: int) -> list[Line]:
        width = max(20, width)
        is_open = item["status"] == "open"
        given = item.get("answer") or {}
        lines: list[Line] = [
            [(f"{item['id']} · {item['title']}", BOLD)],
            [(f"{item['kind']} · from {item['from']} · {clock(item['createdAt'])} · {item['status']}", DIM)],
            [],
        ]
        lines += wrapped(item["context"], width)
        lines.append([])
        offer = is_open and item["kind"] == "decision"
        for option in item["options"]:
            picked = given.get("letter") == option["letter"]
            head = f"{option['letter'].lower()}  " if offer else ("✓  " if picked else "   ")
            text = f"{head}{option['letter']}{' [REC]' if option.get('isRec') else ''} {option['text']}"
            if option.get("cost"):
                text += f" ({option['cost']})"
            style = GREEN + BOLD if picked else (ACCENT if offer and self.note else "" if offer else DIM)
            lines += wrapped(text, width, style, indent="      ")
        lines.append([])
        if is_open and item["kind"] == "approval":
            lines += wrapped(
                f"An approval: answer it in the session of {item['from']} by typing {item['id']}: <letter> there. "
                "It must be your own word in the session that acts, so it cannot be given here.",
                width,
                YELLOW,
            )
        if given:
            where = {"terminal": "in the inbox terminal", "pane": "in an inbox pane", "prompt": "in a chat"}.get(given.get("via"), "")
            delivered = "delivered" if item.get("deliveredAt") else "not yet delivered"
            pick = f": {given['letter']}" if given.get("letter") else ", with no option"
            lines.append([(f"Answered {clock(given['at'])} {where}{pick} · {delivered}", GREEN)])
            if given.get("text"):
                label = "You typed" if given.get("via") == "prompt" else "Your note"
                lines += wrapped(f"{label}: {given['text']}", width)
        if item["status"] == "withdrawn":
            lines += wrapped(f"Withdrawn: {item.get('withdrawnReason') or 'no reason given'}", width, YELLOW)
        return lines

    def status_line(self) -> Line:
        if self.focus == "note":
            return [(" Note: ", ACCENT + BOLD), (self.draft, ""), ("▏", ACCENT)]
        if self.note:
            return [(" Note kept: ", ACCENT + BOLD), (self.note, ""), ("  ·  a-h send with a pick · s send note alone · Esc drop", ACCENT)]
        return [(f" {self.status}", DIM)]

    def keys(self) -> str:
        if self.focus == "note":
            return " Type your note · Enter keep · Esc drop"
        if self.focus == "message":
            return " ↑↓ scroll · Esc back · a-h answer · n note · q quit"
        return " ↑↓ select · Enter read · a-h answer · n note · 0 answered · q quit"

    # -- input --------------------------------------------------------------

    def handle(self, key: str) -> bool:
        """Applies one key; returns False to quit."""
        current = self.current()
        if self.focus == "note":
            if key == "enter":
                self.note, self.focus = self.draft.strip(), self.back
            elif key == "esc":
                self.focus, self.status = self.back, "Note dropped."
            elif key == "backspace":
                self.draft = self.draft[:-1]
            elif key == "quit":
                return False
            elif len(key) == 1 and key.isprintable():
                self.draft += key
            return True

        if key in ("q", "Q", "quit"):
            return False
        if key == "esc" and self.note:
            self.note, self.status = "", "Note dropped."
        elif self.focus == "message":
            if key in ("up", "k"):
                self.scroll = max(0, self.scroll - 1)
            elif key in ("down", "j", " "):
                self.scroll += 1
            elif key in ("esc", "enter", "left"):
                self.focus = "list"
        elif key in ("up", "k"):
            self.move(-1)
        elif key in ("down", "j"):
            self.move(1)
        elif key in ("enter", "right") and current is not None:
            self.focus, self.scroll = "message", 0
        elif key == "0":
            self.is_showing_closed = not self.is_showing_closed

        if key == "n" and current is not None and current["status"] == "open" and current["kind"] == "decision":
            self.back, self.focus, self.draft = self.focus, "note", self.note
        elif key == "s" and current is not None and self.note:
            self.status = answer(self.folder, current["id"], None, self.note)
            self.note = ""
        elif len(key) == 1 and "a" <= key <= "h" and current is not None:
            if current["status"] != "open":
                self.status = f"{current['id']} is {current['status']}."
            elif key.upper() in [option["letter"] for option in current["options"]]:
                self.status = answer(self.folder, current["id"], key.upper(), self.note)
                if not self.status.startswith(current["id"]):
                    self.note = ""
        self.refresh()
        return True

    def run(self) -> None:
        fd = sys.stdin.fileno()
        saved = termios.tcgetattr(fd)
        sys.stdout.write(f"\x1b]0;{TITLE}\x07\x1b[?1049h\x1b[?25l")
        try:
            tty.setraw(fd)
            self.refresh()
            last_read = time.monotonic()
            while True:
                size = os.get_terminal_size(sys.stdout.fileno())
                sys.stdout.write("\x1b[H" + "\r\n".join(self.frame(size.columns, size.lines)) + "\x1b[J")
                sys.stdout.flush()
                key = read_key(fd, 0.25)
                if key is not None and not self.handle(key):
                    return
                if time.monotonic() - last_read >= POLL_S:
                    self.refresh()
                    last_read = time.monotonic()
        finally:
            termios.tcsetattr(fd, termios.TCSADRAIN, saved)
            sys.stdout.write("\x1b[?25h\x1b[?1049l")
            sys.stdout.flush()


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit("usage: inbox.py <inbox folder>")
    folder = sys.argv[1]
    os.makedirs(folder, exist_ok=True)
    other = running_pid(folder)
    if other is not None and other != os.getpid():
        sys.exit(f"The inbox already runs in another terminal (process {other}).")
    pid_path = os.path.join(folder, PID_FILE)
    with open(pid_path, "w", encoding="utf-8") as handle:
        handle.write(f"{os.getpid()}\n")
    try:
        Inbox(folder).run()
    finally:
        if running_pid(folder) == os.getpid():
            os.remove(pid_path)
