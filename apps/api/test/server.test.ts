import { afterEach, describe, expect, it } from "vitest";

import { buildApi } from "../src/server.js";

const apps = new Set<Awaited<ReturnType<typeof buildApi>>>();

afterEach(async () => {
  await Promise.all([...apps].map((app) => app.close()));
  apps.clear();
});

describe("API service", () => {
  it("serves health and readiness with request correlation", async () => {
    const app = buildApi();
    apps.add(app);
    const health = await app.inject({
      method: "GET",
      url: "/healthz",
      headers: { "x-request-id": "corr-health" },
    });
    expect(health.statusCode).toBe(200);
    expect(health.json()).toEqual({ service: "api", status: "ok" });
    expect(health.headers["x-request-id"]).toBe("corr-health");
    const ready = await app.inject({ method: "GET", url: "/readyz" });
    expect(ready.statusCode).toBe(200);
    expect(ready.json()).toEqual({ service: "api", status: "ready" });
  });

  it("closes cleanly on shutdown", async () => {
    const app = buildApi();
    apps.add(app);
    await app.ready();
    await app.close();
    expect(app.server.listening).toBe(false);
    apps.delete(app);
  });
});
