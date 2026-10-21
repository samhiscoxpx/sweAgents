import { randomBytes } from "node:crypto";
import {
  closeSync,
  mkdirSync,
  openSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
  writeSync,
} from "node:fs";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

export type MachineLock = {
  path: string;
  release: () => void;
};

export const MACHINE_LOCK_WAIT_MS = 30 * 60 * 1000;
export const MACHINE_LOCK_POLL_MS = 1_000;
export const MACHINE_LOCK_REPORT_MS = 60_000;
export const DEFAULT_MACHINE_LOCK_PATH = join(homedir(), ".claude", "machine-gate.lock");
export const DEFAULT_BUILD_LOCK_PATH = join(homedir(), ".claude", "machine-build.lock");
const UNWRITTEN_STALE_MS = 5_000;

// A holder records the locks it holds, path to pid, in an environment variable its child
// processes inherit. A process whose environment names a path held by a live pid that the lock
// file on disk still names goes ahead at once, so a commit hook that takes the build lock and
// runs a build script that also takes it does not wait on itself. A stale or hand-set entry
// matches no live holder in the file and grants nothing.
export const MACHINE_LOCK_HOLDERS_ENV = "SWE_MACHINE_LOCK_HOLDERS";

export type AcquireMachineLockOptions = {
  path: string;
  session: string;
  waitMs?: number;
  reportEveryMs?: number;
};

function errnoCode(error: unknown): string | undefined {
  if (error instanceof Error && "code" in error && typeof error.code === "string") {
    return error.code;
  }
  return undefined;
}

function tryCreate(path: string, session: string, pid: number): boolean {
  let fd: number;
  try {
    fd = openSync(path, "wx");
  } catch (error) {
    if (errnoCode(error) === "EEXIST") {
      return false;
    }
    throw error;
  }
  try {
    const line = `${JSON.stringify({ session, pid, at: new Date().toISOString() })}\n`;
    writeSync(fd, line);
  } finally {
    closeSync(fd);
  }
  return true;
}

type Holder =
  | { state: "missing" }
  | { state: "unwritten"; ageMs: number }
  | { state: "held"; session: string; pid: number; at: string };

function readHolder(path: string): Holder {
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch (error) {
    if (errnoCode(error) === "ENOENT") {
      return { state: "missing" };
    }
    throw error;
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return { state: "unwritten", ageMs: fileAgeMs(path) };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { state: "unwritten", ageMs: fileAgeMs(path) };
  }
  if (
    typeof parsed === "object" &&
    parsed !== null &&
    "session" in parsed &&
    "pid" in parsed &&
    "at" in parsed &&
    typeof (parsed as { session: unknown }).session === "string" &&
    typeof (parsed as { pid: unknown }).pid === "number" &&
    Number.isInteger((parsed as { pid: number }).pid) &&
    typeof (parsed as { at: unknown }).at === "string"
  ) {
    const held = parsed as { session: string; pid: number; at: string };
    return { state: "held", session: held.session, pid: held.pid, at: held.at };
  }
  return { state: "unwritten", ageMs: fileAgeMs(path) };
}

function fileAgeMs(path: string): number {
  try {
    return Date.now() - statSync(path).mtimeMs;
  } catch (error) {
    if (errnoCode(error) === "ENOENT") {
      return 0;
    }
    throw error;
  }
}

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
  } catch (error) {
    const code = errnoCode(error);
    if (code === "ESRCH") {
      return false;
    }
    if (code === "EPERM") {
      return true;
    }
    throw error;
  }
  return true;
}

function remove(path: string): void {
  try {
    rmSync(path);
  } catch (error) {
    if (errnoCode(error) === "ENOENT") {
      return;
    }
    throw error;
  }
}

function removeIfStillHeldBy(path: string, pid: number): void {
  const holder = readHolder(path);
  if (holder.state === "held" && holder.pid === pid) {
    remove(path);
  }
}

function removeIfStillUnwritten(path: string): void {
  const holder = readHolder(path);
  if (holder.state === "unwritten" && holder.ageMs > UNWRITTEN_STALE_MS) {
    remove(path);
  }
}

function describe(holder: Holder): string {
  if (holder.state === "held") {
    return `session ${holder.session} pid ${holder.pid}`;
  }
  return holder.state;
}

function releaseHeldBy(path: string, pid: number): void {
  const holder = readHolder(path);
  if (holder.state !== "held" || holder.pid !== pid) {
    throw new Error(
      `machine lock ${path} was taken by pid ${pid} and now reads ${describe(holder)}; another process removed it`,
    );
  }
  rmSync(path);
  forgetHolder(path);
}

function readHolders(): Record<string, number> {
  const raw = process.env[MACHINE_LOCK_HOLDERS_ENV];
  if (raw === undefined || raw.length === 0) {
    return {};
  }
  const parsed: unknown = JSON.parse(raw);
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error(`${MACHINE_LOCK_HOLDERS_ENV} must be a JSON object of lock path to pid, got ${raw}`);
  }
  const holders: Record<string, number> = {};
  for (const [path, pid] of Object.entries(parsed)) {
    if (typeof pid === "number" && Number.isInteger(pid)) {
      holders[path] = pid;
    }
  }
  return holders;
}

function writeHolders(holders: Record<string, number>): void {
  if (Object.keys(holders).length === 0) {
    delete process.env[MACHINE_LOCK_HOLDERS_ENV];
    return;
  }
  process.env[MACHINE_LOCK_HOLDERS_ENV] = JSON.stringify(holders);
}

function recordHolder(path: string, pid: number): void {
  writeHolders({ ...readHolders(), [path]: pid });
}

function forgetHolder(path: string): void {
  const holders = readHolders();
  delete holders[path];
  writeHolders(holders);
}

function heldByAncestor(path: string): boolean {
  const pid = readHolders()[path];
  if (pid === undefined || pid === process.pid) {
    return false;
  }
  const holder = readHolder(path);
  return holder.state === "held" && holder.pid === pid && isAlive(pid);
}

// The queue is a sibling directory of tickets, one file per waiter, named so they sort in
// arrival order: a zero-padded timestamp, then the pid, then a random suffix that only breaks a
// same-millisecond tie. A waiter may attempt the exclusive create only when its own ticket is the
// lowest-sorted ticket whose pid is still alive; every waiter prunes dead tickets it finds ahead
// of it, using the same isAlive rule the lock file itself uses, so a holder that died mid-queue
// never blocks the ones behind it.
function queueDirFor(path: string): string {
  return `${path}.queue`;
}

function createTicket(queueDir: string, session: string, pid: number): string {
  mkdirSync(queueDir, { recursive: true });
  for (;;) {
    const ts = Date.now().toString().padStart(15, "0");
    const pidPart = String(pid).padStart(8, "0");
    const rand = randomBytes(4).toString("hex");
    const ticketPath = join(queueDir, `${ts}-${pidPart}-${rand}.json`);
    try {
      writeFileSync(ticketPath, `${JSON.stringify({ session, pid, at: new Date().toISOString() })}\n`, {
        flag: "wx",
      });
      return ticketPath;
    } catch (error) {
      if (errnoCode(error) === "EEXIST") {
        continue;
      }
      throw error;
    }
  }
}

function readTicket(ticketPath: string): { pid: number } | undefined {
  let text: string;
  try {
    text = readFileSync(ticketPath, "utf8");
  } catch (error) {
    if (errnoCode(error) === "ENOENT") {
      return undefined;
    }
    throw error;
  }
  try {
    const parsed = JSON.parse(text.trim()) as { pid: unknown };
    if (typeof parsed.pid === "number" && Number.isInteger(parsed.pid)) {
      return { pid: parsed.pid };
    }
  } catch {
    // fall through
  }
  return undefined;
}

function liveTicketNames(queueDir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(queueDir);
  } catch (error) {
    if (errnoCode(error) === "ENOENT") {
      return [];
    }
    throw error;
  }
  const live: string[] = [];
  for (const name of entries.sort()) {
    const ticketPath = join(queueDir, name);
    const ticket = readTicket(ticketPath);
    if (ticket === undefined) {
      continue;
    }
    if (!isAlive(ticket.pid)) {
      remove(ticketPath);
      continue;
    }
    live.push(name);
  }
  return live;
}

// The number of live tickets sorted ahead of this one; zero means this waiter is next.
function ticketsAhead(queueDir: string, ticketPath: string): number {
  const live = liveTicketNames(queueDir);
  const index = live.indexOf(basename(ticketPath));
  return index === -1 ? live.length : index;
}

// A wait on this lock prints nothing from the command it guards, so a queued commit hook looks
// hung, and one agent killed every session's test runs by name over a silent wait. The waiter says
// on stderr what it waits behind, again whenever that changes and at least once per report
// interval, and once more when it takes the lock after a wait.
function waitingState(path: string, holder: Holder, ahead: number): string {
  const state =
    holder.state === "held" ? `held by ${describe(holder)} since ${holder.at}` : `lock file ${describe(holder)}`;
  return `waiting for machine lock ${path}: ${state}, ${ahead} ahead in the queue`;
}

export async function acquireMachineLock(options: AcquireMachineLockOptions): Promise<MachineLock> {
  const { path, session } = options;
  const waitMs = options.waitMs ?? MACHINE_LOCK_WAIT_MS;
  const reportEveryMs = options.reportEveryMs ?? MACHINE_LOCK_REPORT_MS;
  const pid = process.pid;
  if (heldByAncestor(path)) {
    return { path, release: () => {} };
  }
  const deadline = Date.now() + waitMs;
  const queueDir = queueDirFor(path);
  const ticketPath = createTicket(queueDir, session, pid);
  const cleanupTicketOnExit = (): void => remove(ticketPath);
  process.once("exit", cleanupTicketOnExit);
  const startedAt = Date.now();
  let lastReported: string | undefined;
  let lastReportedAt = 0;
  try {
    for (;;) {
      const ahead = ticketsAhead(queueDir, ticketPath);
      const lowest = ahead === 0;
      if (lowest && tryCreate(path, session, pid)) {
        remove(ticketPath);
        recordHolder(path, pid);
        if (lastReported !== undefined) {
          const waitedS = Math.round((Date.now() - startedAt) / 1000);
          process.stderr.write(`took machine lock ${path} for ${session} after waiting ${waitedS} s\n`);
        }
        return { path, release: () => releaseHeldBy(path, pid) };
      }
      const holder = readHolder(path);
      if (Date.now() >= deadline) {
        remove(ticketPath);
        throw new Error(
          `machine lock ${path} is held by ${describe(holder)} and did not free within ${waitMs} ms`,
        );
      }
      if (holder.state === "held" && !isAlive(holder.pid)) {
        removeIfStillHeldBy(path, holder.pid);
        continue;
      }
      if (holder.state === "unwritten" && holder.ageMs > UNWRITTEN_STALE_MS) {
        removeIfStillUnwritten(path);
        continue;
      }
      if (lowest && holder.state === "missing") {
        continue;
      }
      const state = waitingState(path, holder, ahead);
      const now = Date.now();
      if (state !== lastReported || now - lastReportedAt >= reportEveryMs) {
        const waitedS = Math.round((now - startedAt) / 1000);
        process.stderr.write(`${state}, ${waitedS} s waited\n`);
        lastReported = state;
        lastReportedAt = now;
      }
      await delay(MACHINE_LOCK_POLL_MS);
    }
  } finally {
    process.off("exit", cleanupTicketOnExit);
  }
}
