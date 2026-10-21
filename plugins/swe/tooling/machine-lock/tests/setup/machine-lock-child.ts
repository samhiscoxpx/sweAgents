import { appendFileSync } from "node:fs";
import { setTimeout as delay } from "node:timers/promises";
import { acquireMachineLock } from "./machine-lock.ts";

const [path, holdText, outPath] = process.argv.slice(2);
if (path === undefined || holdText === undefined || outPath === undefined) {
  throw new Error("usage: machine-lock-child.ts <path> <hold-ms> <out-path>");
}
const holdMs = Number.parseInt(holdText, 10);
if (!Number.isInteger(holdMs)) {
  throw new Error(`hold-ms must be an integer, got ${JSON.stringify(holdText)}`);
}

const lock = await acquireMachineLock({ path, session: `child-${process.pid}`, waitMs: 30_000 });
appendFileSync(outPath, `${JSON.stringify({ pid: process.pid, event: "enter", at: Date.now() })}\n`);
await delay(holdMs);
appendFileSync(outPath, `${JSON.stringify({ pid: process.pid, event: "leave", at: Date.now() })}\n`);
lock.release();
