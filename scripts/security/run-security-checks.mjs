#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const scanner = resolve(import.meta.dirname, "scan-repository.mjs");

function run(command, arguments_) {
  const result = spawnSync(command, arguments_, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: "inherit",
  });
  if (result.error) {
    return { error: result.error, status: null };
  }
  return { error: null, status: result.status };
}

for (const mode of ["--secrets", "--prohibited"]) {
  const result = run(process.execPath, [scanner, mode]);
  if (result.error || result.status !== 0) {
    process.exit(result.status ?? 2);
  }
}

let audit = run("pnpm", ["audit", "--audit-level", "high"]);
if (audit.error?.code === "ENOENT") {
  audit = run("npx", ["--yes", "pnpm@12.6.0", "audit", "--audit-level", "high"]);
}
if (audit.error) {
  console.error(`Dependency audit could not run: ${audit.error.message}`);
  process.exit(2);
}
process.exit(audit.status ?? 2);
