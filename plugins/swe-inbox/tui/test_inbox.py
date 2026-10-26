"""Tests for the standalone inbox: python3 -m unittest discover -s plugins/swe-inbox/tui"""

import json
import os
import tempfile
import unittest

import inbox


def item(item_id, kind="decision", session="session-lead"):
    return {
        "id": item_id,
        "kind": kind,
        "title": "Cache layer?",
        "context": "Phase 3 needs a cache.",
        "options": [{"letter": "A", "text": "In-memory", "isRec": True}, {"letter": "B", "text": "Redis"}],
        "from": "lead phase 3",
        "sessionId": session,
        "createdAt": 0,
        "status": "open",
    }


class AnswerTest(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.mkdtemp()
        for one in (item("W1"), item("W2", kind="approval"), item("W10")):
            inbox.write(self.folder, one)

    def stored(self, item_id):
        with open(os.path.join(self.folder, f"{item_id}.json"), encoding="utf-8") as handle:
            return json.load(handle)

    def test_items_load_in_number_order(self):
        self.assertEqual([one["id"] for one in inbox.load(self.folder)], ["W1", "W2", "W10"])

    def test_a_decision_is_answered_with_its_note(self):
        inbox.answer(self.folder, "W1", "B", "Redis is in staging")
        stored = self.stored("W1")
        self.assertEqual(stored["status"], "answered")
        self.assertEqual(stored["answer"]["letter"], "B")
        self.assertEqual(stored["answer"]["text"], "Redis is in staging")
        self.assertEqual(stored["answer"]["via"], "terminal")
        self.assertNotIn("deliveredAt", stored)

    def test_an_approval_is_refused(self):
        message = inbox.answer(self.folder, "W2", "A", "")
        self.assertIn("session of lead phase 3", message)
        self.assertEqual(self.stored("W2")["status"], "open")

    def test_an_answered_item_is_not_answered_again(self):
        inbox.answer(self.folder, "W1", "A", "")
        self.assertIn("no longer open", inbox.answer(self.folder, "W1", "B", ""))
        self.assertEqual(self.stored("W1")["answer"]["letter"], "A")

    def test_control_characters_are_not_drawn(self):
        drawn = inbox.paint([("title\x1b]52;c;aGk=\x07 \x9b2J", "")], 80)
        self.assertNotIn("\x9b", drawn)
        self.assertEqual(drawn.count("\x1b"), 2)  # the RESET after the text and the closing erase
        self.assertIn("\ufffd]52;c;aGk=\ufffd", drawn)

    def test_a_half_written_file_is_skipped(self):
        with open(os.path.join(self.folder, "W3.json"), "w", encoding="utf-8") as handle:
            handle.write("{")
        self.assertEqual(len(inbox.load(self.folder)), 3)


class NoteTest(unittest.TestCase):
    def setUp(self):
        self.folder = tempfile.mkdtemp()
        inbox.write(self.folder, item("W1"))
        self.inbox = inbox.Inbox(self.folder)
        self.inbox.refresh()

    def type_note(self, *keys):
        for key in ("n",) + keys + ("enter",):
            self.inbox.handle(key)

    def test_a_note_keeps_its_new_lines(self):
        self.type_note("o", "n", "e", "newline", inbox.Paste("two\nthree"))
        self.assertEqual(self.inbox.note, "one\ntwo\nthree")
        self.inbox.handle("s")
        with open(os.path.join(self.folder, "W1.json"), encoding="utf-8") as handle:
            self.assertEqual(json.load(handle)["answer"]["text"], "one\ntwo\nthree")

    def test_a_note_draws_one_row_per_line(self):
        self.inbox.handle("n")
        self.inbox.handle(inbox.Paste("one\ntwo"))
        drawn = self.inbox.frame(80, 30)
        self.assertTrue(any("Note: " in row and "one" in row for row in drawn))
        self.assertTrue(any("two" in row and "Note" not in row for row in drawn))
        self.assertFalse(any("\ufffd" in row for row in drawn))

    def test_a_paste_turns_carriage_returns_into_new_lines(self):
        read, write = os.pipe()
        os.write(write, b"\x1b[200~one\rtwo\x1b]52;c;aGk=\x07\r\nthree\x1b[201~")
        self.assertEqual(inbox.read_key(read, 0.1), "one\ntwo]52;c;aGk=\nthree")
        os.write(write, b"\x1b\r")
        self.assertEqual(inbox.read_key(read, 0.1), "newline")
        os.write(write, b"\n")
        self.assertEqual(inbox.read_key(read, 0.1), "newline")
        os.write(write, b"\r")
        self.assertEqual(inbox.read_key(read, 0.1), "enter")


if __name__ == "__main__":
    unittest.main()
