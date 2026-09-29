import { writeFileSync } from "node:fs";

export const document = {
  openapi: "3.1.0",
  info: { title: "BBW Platform API", version: "0.0.0" },
  paths: {
    "/healthz": {
      get: { operationId: "health", responses: { 200: { description: "Service is healthy" } } },
    },
    "/readyz": {
      get: { operationId: "readiness", responses: { 200: { description: "Service is ready" } } },
    },
  },
};

if (process.argv.includes("--write")) {
  writeFileSync(
    new URL("../../apps/api/openapi.json", import.meta.url),
    `${JSON.stringify(document, null, 2)}\n`,
  );
} else if (process.argv.includes("--json")) {
  process.stdout.write(`${JSON.stringify(document, null, 2)}\n`);
}
