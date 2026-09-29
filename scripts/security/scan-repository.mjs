#!/usr/bin/env node

import { readFile, readdir, stat } from "node:fs/promises";
import { execFile } from "node:child_process";
import { basename, relative, resolve, sep } from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const repositoryRoot = resolve(import.meta.dirname, "../..");
const ignoredDirectories = new Set([
  ".git",
  ".next",
  ".turbo",
  ".vinext",
  ".wrangler",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "outputs",
  "work",
]);
const maximumScannedFileBytes = 2 * 1024 * 1024;
const execFileAsync = promisify(execFile);

const secretRules = [
  {
    name: "AWS access key ID",
    // Split signatures keep this scanner from flagging its own rule definitions.
    pattern: new RegExp(`A(?:KI|SI)A[${"A-Z0-9"}]{16}`, "g"),
  },
  {
    name: "private key",
    pattern: new RegExp(`-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE ${"KEY"}-----`, "g"),
  },
  {
    name: "GitHub token",
    pattern: new RegExp(`gh(?:p|o|u|s|r)_[${"A-Za-z0-9"}]{36,255}`, "g"),
  },
  {
    name: "OpenAI API key",
    pattern: new RegExp(`sk-${"(?:proj-|svcacct-)?"}[${"A-Za-z0-9_-"}]{32,}`, "g"),
  },
  {
    name: "Slack token",
    pattern: new RegExp(`xox(?:b|p|a|r|s)-[${"A-Za-z0-9-"}]{20,}`, "g"),
  },
  {
    name: "Stripe live secret key",
    pattern: new RegExp(`sk_${"live_"}[${"A-Za-z0-9"}]{20,}`, "g"),
  },
];

const prohibitedExactNames = new Set([
  ".ds_store",
  ".env",
  "credentials.json",
  "id_dsa",
  "id_ed25519",
  "id_rsa",
  "service-account.json",
]);
const prohibitedExtensions = [
  ".db",
  ".jks",
  ".key",
  ".keystore",
  ".p12",
  ".pem",
  ".pfx",
  ".sqlite",
  ".sqlite3",
];
const permittedEnvironmentTemplates = new Set([".env.example", ".env.sample", ".env.template"]);

function parseArguments(arguments_) {
  const options = {
    scanProhibitedFiles: true,
    scanSecrets: true,
    target: repositoryRoot,
  };

  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--secrets") {
      options.scanProhibitedFiles = false;
    } else if (argument === "--prohibited") {
      options.scanSecrets = false;
    } else if (argument === "--path") {
      const candidate = arguments_[index + 1];
      if (!candidate) {
        throw new Error("--path requires a file or directory");
      }
      options.target = resolve(process.cwd(), candidate);
      index += 1;
    } else if (argument === "--help") {
      console.log(
        "Usage: node scripts/security/scan-repository.mjs [--secrets|--prohibited] [--path PATH]",
      );
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${argument}`);
    }
  }

  return options;
}

async function collectFiles(target) {
  const targetStat = await stat(target);
  if (targetStat.isFile()) {
    return [target];
  }

  const files = [];
  for (const entry of await readdir(target, { withFileTypes: true })) {
    if (entry.isSymbolicLink()) {
      continue;
    }
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const entryPath = resolve(target, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectFiles(entryPath)));
    } else if (entry.isFile()) {
      files.push(entryPath);
    }
  }
  return files;
}

async function collectRepositoryFiles() {
  const { stdout } = await execFileAsync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { cwd: repositoryRoot, encoding: "buffer", maxBuffer: 16 * 1024 * 1024 },
  );
  return stdout
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    .map((filePath) => resolve(repositoryRoot, filePath));
}

function displayPath(filePath) {
  const repoRelativePath = relative(repositoryRoot, filePath);
  return repoRelativePath.startsWith(`..${sep}`) ? filePath : repoRelativePath;
}

function isProhibitedFile(filePath) {
  const name = basename(filePath);
  const lowerName = name.toLowerCase();

  if (permittedEnvironmentTemplates.has(lowerName)) {
    return false;
  }
  if (prohibitedExactNames.has(lowerName) || lowerName.startsWith(".env.")) {
    return true;
  }
  return prohibitedExtensions.some((extension) => lowerName.endsWith(extension));
}

async function scanFileForSecrets(filePath) {
  const fileStat = await stat(filePath);
  if (fileStat.size > maximumScannedFileBytes) {
    return [];
  }

  const buffer = await readFile(filePath);
  if (buffer.includes(0)) {
    return [];
  }

  const content = buffer.toString("utf8");
  const findings = [];
  for (const rule of secretRules) {
    rule.pattern.lastIndex = 0;
    for (const match of content.matchAll(rule.pattern)) {
      const lineNumber = content.slice(0, match.index).split("\n").length;
      findings.push(`${displayPath(filePath)}:${lineNumber}: ${rule.name}`);
    }
  }
  return findings;
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  // The default scan models what can enter source control. Explicit --path scans
  // every file in that target, which is useful for testing and incident checks.
  const files =
    options.target === repositoryRoot
      ? await collectRepositoryFiles()
      : await collectFiles(options.target);
  const findings = [];

  for (const filePath of files.sort()) {
    if (options.scanProhibitedFiles && isProhibitedFile(filePath)) {
      findings.push(`${displayPath(filePath)}: prohibited file`);
    }
    if (options.scanSecrets) {
      findings.push(...(await scanFileForSecrets(filePath)));
    }
  }

  if (findings.length > 0) {
    console.error("Security scan failed:");
    for (const finding of findings) {
      console.error(`- ${finding}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Security scan passed (${files.length} files checked; secrets=${options.scanSecrets}; prohibited-files=${options.scanProhibitedFiles}).`,
  );
}

main().catch((error) => {
  console.error(`Security scan could not run: ${error.message}`);
  process.exitCode = 2;
});
