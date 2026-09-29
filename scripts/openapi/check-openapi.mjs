import { readFileSync } from "node:fs";
import { document } from "./generate-openapi.mjs";

const outputPath = new URL("../../apps/api/openapi.json", import.meta.url);
const generated = JSON.parse(readFileSync(outputPath, "utf8"));
if (JSON.stringify(generated) !== JSON.stringify(document)) {
  throw new Error("OpenAPI output is stale; run pnpm openapi:generate");
}
if (generated.openapi !== "3.1.0" || !generated.info?.title || !generated.info?.version) {
  throw new Error("OpenAPI document metadata is invalid");
}
for (const path of ["/healthz", "/readyz"]) {
  if (!generated.paths?.[path]?.get?.responses?.["200"])
    throw new Error(`Missing GET ${path} response`);
}
console.log("OpenAPI document is deterministic and valid.");
