#!/usr/bin/env python3
"""The swe inbox in a terminal of its own.

Reads and answers the same items as the swe-inbox pane: one JSON file per
item in <main worktree>/.swe/inbox/. Each session's mod delivers an answer
to the session that asked, so this program only shows items and writes
answers. Standard library only.

    python3 inbox.py <inbox folder>
"""

from __future__ import annotations

import curses
import json
import locale
import os
import re
import sys
import tempfile
import textwrap
import time

POLL_MS = 1000
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


class Inbox:
    def __init__(self, screen, folder: str) -> None:
        self.screen = screen
        self.folder = folder
        self.items: list[dict] = []
        self.selected: str | None = None
        self.is_showing_closed = False
        self.note = ""
        self.status = "Ready."
        self.scroll = 0
        self.seen: set[str] | None = None

    # -- data ---------------------------------------------------------------

    def refresh(self) -> None:
        self.items = load(self.folder)
        ids = {item["id"] for item in self.items}
        if self.seen is not None:
            arrived = [i for i in self.items if i["id"] not in self.seen and i["status"] == "open"]
            if arrived:
                curses.beep()
                self.status = "New: " + ", ".join(f"{i['id']} from {i['from']}" for i in arrived)
        self.seen = ids

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
        return found

    def move(self, step: int) -> None:
        rows = self.rows()
        if not rows:
            return
        ids = [item["id"] for item in rows]
        index = ids.index(self.selected) if self.selected in ids else 0
        self.selected = ids[max(0, min(len(ids) - 1, index + step))]
        self.scroll = 0

    # -- drawing ------------------------------------------------------------

    def put(self, y: int, x: int, text: str, attr: int = 0) -> None:
        height, width = self.screen.getmaxyx()
        if 0 <= y < height and x < width:
            try:
                self.screen.addnstr(y, x, text, max(0, width - x - 1), attr)
            except curses.error:
                pass

    def draw(self) -> None:
        screen = self.screen
        screen.erase()
        height, width = screen.getmaxyx()
        open_count = sum(1 for item in self.items if item["status"] == "open")
        closed_count = len(self.items) - open_count
        accent = curses.color_pair(1) | curses.A_BOLD

        self.put(0, 0, f" swe inbox · {open_count} waiting on you · {closed_count} answered or withdrawn ".ljust(width), curses.A_REVERSE)
        y = 2
        rows = self.rows()
        current = self.current()
        list_height = max(3, min(len(rows) + 2, height // 3))
        if not [item for item in rows if item["status"] == "open"]:
            self.put(y, 2, "Nothing is waiting on you.", curses.A_DIM)
            y += 1
        for item in rows:
            if y >= 2 + list_height - 1:
                break
            is_current = current is not None and item["id"] == current["id"]
            marker = "›" if is_current else " "
            if item["status"] == "open":
                tag = item["kind"]
                tag_attr = curses.color_pair(3) if item["kind"] == "approval" else curses.A_DIM
            elif item["status"] == "answered":
                tag = f"✓ {item.get('answer', {}).get('letter', 'note')}"
                tag_attr = curses.color_pair(2)
            else:
                tag, tag_attr = "withdrawn", curses.color_pair(3)
            base = curses.A_REVERSE if is_current else 0
            self.put(y, 1, f"{marker} {item['id']:<4}", base | (curses.A_BOLD if is_current else 0))
            self.put(y, 9, f"{tag:<9}", tag_attr | base)
            self.put(y, 19, f"{item['title']}", base)
            meta = f" {item['from']} {clock(item['createdAt'])} "
            self.put(y, max(19, width - len(meta) - 1), meta, curses.A_DIM | base)
            y += 1
        toggle = "▾" if self.is_showing_closed else "▸"
        self.put(y, 2, f"{toggle} Answered or withdrawn ({closed_count})  [0]", curses.A_DIM)
        y += 1
        self.put(y, 0, "─" * (width - 1), curses.A_DIM)
        y += 1

        detail_top = y
        lines = self.detail_lines(current, width - 4) if current else []
        room = height - detail_top - 3
        self.scroll = max(0, min(self.scroll, max(0, len(lines) - room)))
        for offset, (text, attr) in enumerate(lines[self.scroll:self.scroll + room]):
            self.put(detail_top + offset, 2, text, attr)

        self.put(height - 3, 0, "─" * (width - 1), curses.A_DIM)
        if self.note:
            self.put(height - 2, 1, f"Note: {self.note}", accent)
        else:
            self.put(height - 2, 1, self.status, curses.A_DIM)
        keys = " ↑↓ item · a-h answer · n note · s send note · 0 answered · PgUp/PgDn scroll · q quit "
        self.put(height - 1, 0, keys.ljust(width), curses.A_REVERSE)
        screen.refresh()

    def detail_lines(self, item: dict, width: int) -> list[tuple[str, int]]:
        width = max(20, width)
        lines: list[tuple[str, int]] = [
            (f"{item['id']} · {item['title']}", curses.A_BOLD),
            (f"{item['kind']} · from {item['from']} · {clock(item['createdAt'])} · {item['status']}", curses.A_DIM),
            ("", 0),
        ]
        for paragraph in item["context"].split("\n"):
            lines += [(line, 0) for line in (textwrap.wrap(paragraph, width) or [""])]
        lines.append(("", 0))
        given = item.get("answer") or {}
        is_open = item["status"] == "open"
        for option in item["options"]:
            picked = given.get("letter") == option["letter"]
            head = f"{option['letter'].lower()}  " if is_open else ("✓  " if picked else "   ")
            text = f"{head}{option['letter']}{' [REC]' if option.get('isRec') else ''} {option['text']}"
            if option.get("cost"):
                text += f" ({option['cost']})"
            attr = curses.color_pair(2) | curses.A_BOLD if picked else (0 if is_open else curses.A_DIM)
            wrapped = textwrap.wrap(text, width, subsequent_indent="      ") or [text]
            lines += [(line, attr) for line in wrapped]
        lines.append(("", 0))
        if is_open and item["kind"] == "approval":
            lines.append((f"Answer this in the session of {item['from']}: an approval must be", curses.color_pair(3)))
            lines.append(("your own word in the session that acts.", curses.color_pair(3)))
        if given:
            where = {"terminal": "in the inbox terminal", "pane": "in an inbox pane", "prompt": "in a chat"}.get(given.get("via"), "")
            delivered = "delivered" if item.get("deliveredAt") else "not yet delivered"
            pick = f": {given['letter']}" if given.get("letter") else ", with no option"
            lines.append((f"Answered {clock(given['at'])} {where}{pick} · {delivered}", curses.color_pair(2)))
            if given.get("text"):
                label = "You typed" if given.get("via") == "prompt" else "Your note"
                lines += [(line, 0) for line in textwrap.wrap(f"{label}: {given['text']}", width)]
        if item["status"] == "withdrawn":
            lines.append((f"Withdrawn: {item.get('withdrawnReason') or 'no reason given'}", curses.color_pair(3)))
        return lines

    # -- input --------------------------------------------------------------

    def read_note(self) -> None:
        curses.curs_set(1)
        height, width = self.screen.getmaxyx()
        text = self.note
        while True:
            self.put(height - 2, 0, " " * (width - 1))
            self.put(height - 2, 1, f"Note (Enter keeps, Esc drops): {text}", curses.color_pair(1) | curses.A_BOLD)
            self.screen.refresh()
            key = self.screen.get_wch()
            if key in ("\n", "\r", curses.KEY_ENTER):
                self.note = text.strip()
                self.status = "Note kept: press a letter to send it with a pick, or s to send it alone."
                break
            if key == "\x1b":
                self.status = "Note dropped."
                self.note = ""
                break
            if key in (curses.KEY_BACKSPACE, "\x7f", "\b"):
                text = text[:-1]
            elif isinstance(key, str) and key.isprintable():
                text += key
        curses.curs_set(0)

    def run(self) -> None:
        curses.curs_set(0)
        self.screen.timeout(POLL_MS)
        self.screen.keypad(True)
        self.refresh()
        while True:
            self.draw()
            try:
                key = self.screen.get_wch()
            except curses.error:
                self.refresh()
                continue
            current = self.current()
            if key in ("q", "Q"):
                return
            if key in (curses.KEY_DOWN, "j"):
                self.move(1)
            elif key in (curses.KEY_UP, "k"):
                self.move(-1)
            elif key == curses.KEY_NPAGE or key == " ":
                self.scroll += 5
            elif key == curses.KEY_PPAGE:
                self.scroll = max(0, self.scroll - 5)
            elif key == "0":
                self.is_showing_closed = not self.is_showing_closed
            elif key == "n" and current is not None and current["status"] == "open":
                self.read_note()
            elif key == "s" and current is not None and self.note:
                self.status = answer(self.folder, current["id"], None, self.note)
                self.note = ""
            elif isinstance(key, str) and len(key) == 1 and "a" <= key <= "h" and current is not None:
                letters = [option["letter"] for option in current["options"]]
                if current["status"] != "open":
                    self.status = f"{current['id']} is {current['status']}."
                elif key.upper() in letters:
                    self.status = answer(self.folder, current["id"], key.upper(), self.note)
                    self.note = ""
            elif key == curses.KEY_RESIZE:
                pass
            self.refresh()


def main(screen, folder: str) -> None:
    curses.use_default_colors()
    curses.init_pair(1, curses.COLOR_MAGENTA, -1)
    curses.init_pair(2, curses.COLOR_GREEN, -1)
    curses.init_pair(3, curses.COLOR_YELLOW, -1)
    Inbox(screen, folder).run()


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
    sys.stdout.write(f"\x1b]0;{TITLE}\x07")
    sys.stdout.flush()
    locale.setlocale(locale.LC_ALL, "")
    os.environ.setdefault("ESCDELAY", "25")
    try:
        curses.wrapper(main, folder)
    finally:
        if running_pid(folder) == os.getpid():
            os.remove(pid_path)
