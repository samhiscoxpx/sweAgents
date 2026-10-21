import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { afterEach, expect, it, vi } from "vitest";
import { acquireMachineLock, MACHINE_LOCK_HOLDERS_ENV, MACHINE_LOCK_POLL_MS } from "./machine-lock.ts";

const CHILD = join(import.meta.dirname, "machine-lock-child.ts");
const HOLD_MS = 200;

type Mark = { pid: number; event: string; at: number };

let lockDir: string | undefined;
let lockPath: string | undefined;

function newLockPath(): string {
  const dir = mkdtempSync(join(tmpdir(), "swe-machine-lock-test-"));
  const path = join(dir, `lock-${randomUUID()}.lock`);
  lockDir = dir;
  lockPath = path;
  return path;
}

afterEach(() => {
  delete process.env[MACHINE_LOCK_HOLDERS_ENV];
  if (lockPath !== undefined) {
    rmSync(lockPath, { force: true });
    lockPath = undefined;
  }
  if (lockDir !== undefined) {
    rmSync(lockDir, { recursive: true, force: true });
    lockDir = undefined;
  }
});

function runChild(path: string, outPath: string): Promise<{ code: number | null; stderr: string }> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      ["--experimental-strip-types", CHILD, path, String(HOLD_MS), outPath],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    let stderr = "";
    child.stderr.setEncoding("utf8");
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (code) => resolve({ code, stderr }));
  });
}

function escaped(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function readMarks(outPath: string): Mark[] {
  return readFileSync(outPath, "utf8")
    .split("\n")
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line) as Mark);
}

it("frees the lock on release, so the next acquire does not wait", async () => {
  const path = newLockPath();

  const first = await acquireMachineLock({ path, session: "test-session" });
  expect(existsSync(path)).toBe(true);
  first.release();
  expect(existsSync(path)).toBe(false);

  const startedAt = Date.now();
  const second = await acquireMachineLock({ path, session: "test-session" });
  const waited = Date.now() - startedAt;
  second.release();

  expect(waited).toBeLessThan(MACHINE_LOCK_POLL_MS);
});

it("writes nothing to stderr when the lock is free", async () => {
  const path = newLockPath();
  const write = vi.spyOn(process.stderr, "write");
  try {
    const lock = await acquireMachineLock({ path, session: "test-session" });
    lock.release();
    expect(write).not.toHaveBeenCalled();
  } finally {
    write.mockRestore();
  }
});

it("says on stderr what it waits behind, then that it took the lock", async () => {
  const path = newLockPath();
  const outPath = join(lockDir as string, "marks.ndjson");

  const held = await acquireMachineLock({ path, session: "holder" });
  const heldAt = (JSON.parse(readFileSync(path, "utf8").trim()) as { at: string }).at;
  delete process.env[MACHINE_LOCK_HOLDERS_ENV];
  const waiter = runChild(path, outPath);
  await delay(MACHINE_LOCK_POLL_MS * 2);
  held.release();
  const result = await waiter;

  expect(result.code, result.stderr).toBe(0);
  // Node versions before 22.18 also print an experimental-feature warning for the type-stripping flag.
  const lines = result.stderr
    .split("\n")
    .filter((line) => line.startsWith("waiting for machine lock") || line.startsWith("took machine lock"));
  expect(lines[0]).toMatch(
    new RegExp(
      `^waiting for machine lock ${escaped(path)}: held by session holder pid ${process.pid} since ${escaped(heldAt)}, 0 ahead in the queue, \\d+ s waited$`,
    ),
  );
  expect(lines.at(-1)).toMatch(new RegExp(`^took machine lock ${escaped(path)} for child-\\d+ after waiting \\d+ s$`));
});

it("repeats the waiting line each report interval while nothing changes", async () => {
  const path = newLockPath();
  const sleeper = spawn(process.execPath, ["-e", "setTimeout(() => {}, 30000)"], { stdio: "ignore" });
  const sleeperPid = sleeper.pid;
  if (sleeperPid === undefined) {
    throw new Error("spawned process reported no pid");
  }
  writeFileSync(path, `${JSON.stringify({ session: "sleeper", pid: sleeperPid, at: "2026-09-27T00:00:00.000Z" })}\n`);
  const write = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
  try {
    await expect(
      acquireMachineLock({ path, session: "test-session", waitMs: MACHINE_LOCK_POLL_MS * 3, reportEveryMs: 1 }),
    ).rejects.toThrow("did not free");
    const waiting = write.mock.calls
      .map((call) => String(call[0]))
      .filter((text) => text.startsWith("waiting for machine lock"));
    expect(waiting.length).toBeGreaterThanOrEqual(2);
    for (const text of waiting) {
      expect(text).toContain(`held by session sleeper pid ${sleeperPid} since 2026-09-27T00:00:00.000Z`);
    }
  } finally {
    write.mockRestore();
    sleeper.kill();
  }
});

it("writes session, pid and time into the file", async () => {
  const path = newLockPath();

  const before = Date.now();
  const lock = await acquireMachineLock({ path, session: "test-session" });
  const parsed = JSON.parse(readFileSync(lock.path, "utf8").trim()) as {
    session: string;
    pid: number;
    at: string;
  };

  expect(parsed.session).toBe("test-session");
  expect(parsed.pid).toBe(process.pid);
  const atMs = Date.parse(parsed.at);
  expect(atMs).toBeGreaterThanOrEqual(before);
  expect(atMs).toBeLessThanOrEqual(Date.now());

  lock.release();
});

it("removes a dead holder's file and lets the next taker in", async () => {
  const path = newLockPath();

  const dead = spawn(process.execPath, ["-e", "process.exit(0)"], { stdio: "ignore" });
  const deadPid = dead.pid;
  if (deadPid === undefined) {
    throw new Error("spawned process reported no pid");
  }
  await new Promise((resolve) => dead.on("close", resolve));

  writeFileSync(
    path,
    `${JSON.stringify({ session: "stale-holder", pid: deadPid, at: new Date().toISOString() })}\n`,
    "utf8",
  );

  const startedAt = Date.now();
  const lock = await acquireMachineLock({ path, session: "test-session" });
  const waited = Date.now() - startedAt;

  expect(waited).toBeLessThan(MACHINE_LOCK_POLL_MS);
  const parsed = JSON.parse(readFileSync(path, "utf8").trim()) as { pid: number };
  expect(parsed.pid).toBe(process.pid);

  lock.release();
});

it("throws naming the path, the holder and the bound when the wait elapses", async () => {
  const path = newLockPath();
  writeFileSync(
    path,
    `${JSON.stringify({ session: "held-by-test", pid: process.pid, at: new Date().toISOString() })}\n`,
    "utf8",
  );

  await expect(acquireMachineLock({ path, session: "test-session", waitMs: 0 })).rejects.toThrow(
    `machine lock ${path} is held by session held-by-test pid ${process.pid} and did not free within 0 ms`,
  );

  rmSync(path, { force: true });
});

it("serialises two processes that take the same lock", async () => {
  const path = newLockPath();
  const outDir = lockDir as string;
  const outPath = join(outDir, "marks.ndjson");

  const results = await Promise.all([runChild(path, outPath), runChild(path, outPath)]);
  for (const result of results) {
    expect(result.code, result.stderr).toBe(0);
  }

  const marks = readMarks(outPath);
  expect(marks).toHaveLength(4);

  const pids = [...new Set(marks.map((mark) => mark.pid))];
  expect(pids).toHaveLength(2);

  const sections = pids
    .map((pid) => {
      const enter = marks.find((mark) => mark.pid === pid && mark.event === "enter");
      const leave = marks.find((mark) => mark.pid === pid && mark.event === "leave");
      if (enter === undefined || leave === undefined) {
        throw new Error(`process ${pid} wrote ${marks.filter((m) => m.pid === pid).length} marks, not two`);
      }
      return { pid, enter: enter.at, leave: leave.at };
    })
    .sort((a, b) => a.enter - b.enter);

  expect(sections[1].enter).toBeGreaterThanOrEqual(sections[0].leave);
});

it("does not let a later waiter jump a still-queued earlier ticket", async () => {
  const path = newLockPath();
  const queueDir = `${path}.queue`;

  const first = await acquireMachineLock({ path, session: "first" });

  // Plants a ticket for a still-alive process (this test runner) named to sort before anything
  // the real call below creates, standing in for a waiter that arrived first and has not yet
  // given up.
  mkdirSync(queueDir, { recursive: true });
  const earlierTicketPath = join(queueDir, "000000000000000-00000001-earlier.json");
  writeFileSync(
    earlierTicketPath,
    `${JSON.stringify({ session: "earlier", pid: process.pid, at: new Date().toISOString() })}\n`,
    "utf8",
  );

  let acquired = false;
  const waiter = acquireMachineLock({ path, session: "later", waitMs: 5_000 }).then((lock) => {
    acquired = true;
    return lock;
  });

  first.release();
  await delay(MACHINE_LOCK_POLL_MS + 200); // longer than one poll cycle with the lock free

  expect(acquired).toBe(false);
  expect(existsSync(path)).toBe(false); // free, but "later" must not take it out of turn

  rmSync(earlierTicketPath, { force: true }); // the earlier waiter leaves
  const lock = await waiter;
  expect(acquired).toBe(true);
  lock.release();
});

it("does not let a dead ticket ahead of a live waiter block it", async () => {
  const path = newLockPath();
  const queueDir = `${path}.queue`;

  const first = await acquireMachineLock({ path, session: "first" });

  const dead = spawn(process.execPath, ["-e", "process.exit(0)"], { stdio: "ignore" });
  const deadPid = dead.pid;
  if (deadPid === undefined) {
    throw new Error("spawned process reported no pid");
  }
  await new Promise((resolve) => dead.on("close", resolve));

  mkdirSync(queueDir, { recursive: true });
  // Named to sort before any real ticket's timestamp, so it would starve the live waiter if the
  // queue did not prune it.
  const deadTicketPath = join(queueDir, "000000000000000-00000001-dead.json");
  writeFileSync(
    deadTicketPath,
    `${JSON.stringify({ session: "dead", pid: deadPid, at: new Date().toISOString() })}\n`,
    "utf8",
  );

  const waiter = acquireMachineLock({ path, session: "live" });
  await delay(20);
  expect(existsSync(deadTicketPath)).toBe(false);

  first.release();
  const lock = await waiter;
  lock.release();
});

it("leaves no ticket behind when the wait times out", async () => {
  const path = newLockPath();
  const queueDir = `${path}.queue`;
  writeFileSync(
    path,
    `${JSON.stringify({ session: "held-by-test", pid: process.pid, at: new Date().toISOString() })}\n`,
    "utf8",
  );

  await expect(acquireMachineLock({ path, session: "impatient", waitMs: 0 })).rejects.toThrow();

  const remaining = existsSync(queueDir) ? readdirSync(queueDir) : [];
  expect(remaining).toHaveLength(0);

  rmSync(path, { force: true });
});

it("lets a child of the holder go ahead, and leaves the holder's lock in place", async () => {
  const path = newLockPath();
  const outPath = join(lockDir as string, "marks.ndjson");

  const held = await acquireMachineLock({ path, session: "parent" });
  const startedAt = Date.now();
  const result = await runChild(path, outPath);
  const took = Date.now() - startedAt;

  expect(result.code, result.stderr).toBe(0);
  expect(took).toBeLessThan(HOLD_MS + 3 * MACHINE_LOCK_POLL_MS);
  const parsed = JSON.parse(readFileSync(path, "utf8").trim()) as { pid: number };
  expect(parsed.pid).toBe(process.pid);

  held.release();
  expect(existsSync(path)).toBe(false);
});

it("grants nothing to a holders entry the lock file does not bear out", async () => {
  const path = newLockPath();
  const dead = spawn(process.execPath, ["-e", "process.exit(0)"], { stdio: "ignore" });
  const deadPid = dead.pid;
  if (deadPid === undefined) {
    throw new Error("spawned process reported no pid");
  }
  await new Promise((resolve) => dead.on("close", resolve));

  writeFileSync(
    path,
    `${JSON.stringify({ session: "held-by-test", pid: process.pid, at: new Date().toISOString() })}\n`,
    "utf8",
  );
  process.env[MACHINE_LOCK_HOLDERS_ENV] = JSON.stringify({ [path]: deadPid });

  await expect(acquireMachineLock({ path, session: "stale-entry", waitMs: 0 })).rejects.toThrow(
    `machine lock ${path} is held by session held-by-test pid ${process.pid}`,
  );

  rmSync(path, { force: true });
});

it("does not let holding one lock skip another", async () => {
  const path = newLockPath();
  const otherPath = join(lockDir as string, `other-${randomUUID()}.lock`);

  const held = await acquireMachineLock({ path, session: "holder" });
  writeFileSync(
    otherPath,
    `${JSON.stringify({ session: "other-holder", pid: process.pid, at: new Date().toISOString() })}\n`,
    "utf8",
  );

  await expect(acquireMachineLock({ path: otherPath, session: "holder", waitMs: 0 })).rejects.toThrow(
    `machine lock ${otherPath} is held by session other-holder pid ${process.pid}`,
  );

  rmSync(otherPath, { force: true });
  held.release();
});
