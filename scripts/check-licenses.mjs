#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const policyPath = join(repositoryRoot, "config", "license-policy.json");
const policy = readJson(policyPath);
const allowed = new Set(policy.allowedLicenses ?? []);
const allowedExceptions = new Set(policy.allowedExceptions ?? []);

if (allowed.size === 0) {
  fail(`No allowed licenses are configured in ${relative(repositoryRoot, policyPath)}.`);
}

const fixtureFlag = process.argv.indexOf("--fixture");
const packages =
  fixtureFlag === -1 ? discoverInstalledDependencies() : readFixture(process.argv[fixtureFlag + 1]);

const violations = [];
for (const dependency of packages.sort(comparePackages)) {
  if (!dependency.license) {
    violations.push(`${dependency.name}@${dependency.version}: missing license metadata`);
    continue;
  }

  try {
    if (!evaluateSpdx(dependency.license, allowed, allowedExceptions)) {
      violations.push(
        `${dependency.name}@${dependency.version}: ${JSON.stringify(dependency.license)} is not allowed`,
      );
    }
  } catch (error) {
    violations.push(`${dependency.name}@${dependency.version}: ${error.message}`);
  }
}

if (violations.length > 0) {
  console.error("Dependency license check failed:");
  for (const violation of violations) console.error(`- ${violation}`);
  process.exit(1);
}

console.log(`Dependency license check passed (${packages.length} packages checked).`);

function discoverInstalledDependencies() {
  const manifests = [join(repositoryRoot, "package.json")];
  for (const group of ["apps", "packages"]) {
    const groupPath = join(repositoryRoot, group);
    if (!existsSync(groupPath)) continue;
    for (const name of readDirectoryNames(groupPath)) {
      const manifest = join(groupPath, name, "package.json");
      if (existsSync(manifest)) manifests.push(manifest);
    }
  }
  const infraManifest = join(repositoryRoot, "infra", "package.json");
  if (existsSync(infraManifest)) manifests.push(infraManifest);

  const workspaceManifests = new Set(manifests.map((path) => realpathSync(path)));
  const visited = new Set();
  const found = [];
  const queue = [];
  for (const manifestPath of manifests) {
    const manifest = readJson(manifestPath);
    enqueueDependencies(queue, manifest, dirname(manifestPath), true);
  }

  while (queue.length > 0) {
    const request = queue.shift();
    const manifestPath = resolveDependencyManifest(request.name, request.fromDirectory);
    if (!manifestPath) {
      if (request.optional) continue;
      fail(
        `Cannot inspect ${request.name}; install workspace dependencies before running the license check.`,
      );
    }

    const canonicalPath = realpathSync(manifestPath);
    if (visited.has(canonicalPath)) continue;
    visited.add(canonicalPath);
    const manifest = readJson(canonicalPath);
    if (!workspaceManifests.has(canonicalPath)) {
      found.push({
        name: manifest.name ?? request.name,
        version: manifest.version ?? "unknown",
        license: normalizeLicense(manifest.license),
      });
    }
    enqueueDependencies(queue, manifest, dirname(canonicalPath), false);
  }

  return found;
}

function enqueueDependencies(queue, manifest, fromDirectory, includeDevelopment) {
  const fields = includeDevelopment ? ["dependencies", "devDependencies"] : ["dependencies"];
  for (const field of fields) {
    for (const name of Object.keys(manifest[field] ?? {})) {
      queue.push({ name, fromDirectory, optional: false });
    }
  }
  for (const name of Object.keys(manifest.optionalDependencies ?? {})) {
    queue.push({ name, fromDirectory, optional: true });
  }
}

function resolveDependencyManifest(name, fromDirectory) {
  let cursor = fromDirectory;
  while (cursor.startsWith(repositoryRoot + sep) || cursor === repositoryRoot) {
    const candidates = [join(cursor, "node_modules", name, "package.json")];
    if (cursor.endsWith(`${sep}node_modules`)) {
      candidates.unshift(join(cursor, name, "package.json"));
    }
    for (const candidate of candidates) {
      if (existsSync(candidate)) return candidate;
    }
    if (cursor === repositoryRoot) break;
    cursor = dirname(cursor);
  }
  return undefined;
}

function readFixture(inputPath) {
  if (!inputPath) fail("--fixture requires a JSON file path.");
  let fixture;
  if (inputPath === "-") {
    try {
      fixture = JSON.parse(readFileSync(0, "utf8"));
    } catch (error) {
      fail(`Cannot read fixture JSON from stdin: ${error.message}`);
    }
  } else {
    fixture = readJson(resolve(inputPath));
  }
  if (!Array.isArray(fixture.packages)) {
    fail("License fixture must contain a packages array.");
  }
  return fixture.packages.map((dependency) => ({
    name: dependency.name ?? "unnamed-fixture-package",
    version: dependency.version ?? "0.0.0",
    license: normalizeLicense(dependency.license),
  }));
}

function normalizeLicense(value) {
  if (typeof value === "string") return value.trim();
  if (value && typeof value.type === "string") return value.type.trim();
  return undefined;
}

function evaluateSpdx(expression, allowedLicenses, allowedLicenseExceptions) {
  const tokens = expression.match(/\(|\)|AND|OR|WITH|[^\s()]+/g) ?? [];
  let position = 0;

  function parseOr() {
    let value = parseAnd();
    while (tokens[position] === "OR") {
      position += 1;
      const right = parseAnd();
      value = value || right;
    }
    return value;
  }

  function parseAnd() {
    let value = parsePrimary();
    while (tokens[position] === "AND") {
      position += 1;
      const right = parsePrimary();
      value = value && right;
    }
    return value;
  }

  function parsePrimary() {
    if (tokens[position] === "(") {
      position += 1;
      const value = parseOr();
      if (tokens[position] !== ")") {
        throw new Error(`invalid SPDX expression ${JSON.stringify(expression)}`);
      }
      position += 1;
      return value;
    }
    const identifier = tokens[position];
    if (!identifier || ["AND", "OR", "WITH", ")"].includes(identifier)) {
      throw new Error(`invalid SPDX expression ${JSON.stringify(expression)}`);
    }
    position += 1;
    const value = allowedLicenses.has(identifier);
    if (tokens[position] === "WITH") {
      position += 1;
      const exception = tokens[position];
      if (!exception || ["AND", "OR", "WITH", "(", ")"].includes(exception)) {
        throw new Error(`invalid SPDX exception in ${JSON.stringify(expression)}`);
      }
      position += 1;
      return value && allowedLicenseExceptions.has(exception);
    }
    return value;
  }

  if (tokens.length === 0) throw new Error("empty license value");
  const result = parseOr();
  if (position !== tokens.length)
    throw new Error(`invalid SPDX expression ${JSON.stringify(expression)}`);
  return result;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    fail(`Cannot read JSON from ${path}: ${error.message}`);
  }
}

function readDirectoryNames(path) {
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

function comparePackages(left, right) {
  return `${left.name}@${left.version}`.localeCompare(`${right.name}@${right.version}`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
