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

    def test_a_half_written_file_is_skipped(self):
        with open(os.path.join(self.folder, "W3.json"), "w", encoding="utf-8") as handle:
            handle.write("{")
        self.assertEqual(len(inbox.load(self.folder)), 3)


if __name__ == "__main__":
    unittest.main()
