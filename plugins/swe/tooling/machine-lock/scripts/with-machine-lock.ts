import { spawn } from "node:child_process";
import { acquireMachineLock, DEFAULT_MACHINE_LOCK_PATH } from "../tests/setup/machine-lock.ts";

const argv = process.argv.slice(2);
if (argv[0] !== "--session" || argv[1] === undefined || argv[1] === "") {
  throw new Error("usage: with-machine-lock.ts --session <name> <command> [args...]");
}
const session = argv[1];
const command = argv.slice(2);
if (command.length === 0) {
  throw new Error("usage: with-machine-lock.ts --session <name> <command> [args...]");
}
const [cmd, ...args] = command;

const lock = await acquireMachineLock({ path: DEFAULT_MACHINE_LOCK_PATH, session });
try {
  const exitCode = await new Promise<number>((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code, signal) => {
      if (code !== null) {
        resolve(code);
        return;
      }
      reject(new Error(`with-machine-lock: child exited via signal ${signal}`));
    });
  });
  process.exitCode = exitCode;
} finally {
  lock.release();
}
