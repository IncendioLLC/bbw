#!/usr/bin/env node

import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const fixturePath = join(repositoryRoot, "tests", "e2e", "fixtures", "smoke.html");
const port = parsePort(process.argv);
const hostname = "127.0.0.1";

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://${hostname}:${port}`);

  if (url.pathname === "/healthz") {
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("ok");
    return;
  }

  if (url.pathname !== "/") {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("not found");
    return;
  }

  try {
    const fixture = await readFile(fixturePath);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": "text/html; charset=utf-8",
    });
    response.end(fixture);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(`fixture unavailable: ${error.message}`);
  }
});

server.listen(port, hostname, () => {
  process.stdout.write(`BBW Playwright smoke fixture listening at http://${hostname}:${port}\n`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}

function parsePort(arguments_) {
  const portFlag = arguments_.indexOf("--port");
  const value = portFlag === -1 ? "4173" : arguments_[portFlag + 1];
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65_535) {
    throw new Error(`Invalid --port value: ${value ?? "missing"}`);
  }

  return parsed;
}
