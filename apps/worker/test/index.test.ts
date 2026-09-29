import { describe, expect, it } from "vitest";

import { WorkerRuntime, installShutdownHandlers } from "../src/index.js";

describe("worker runtime", () => {
  it("runs a synthetic job and reports health", async () => {
    const events: string[] = [];
    const runtime = new WorkerRuntime({
      info: (event) => events.push(event),
      error: (event) => events.push(event),
    });

    await expect(runtime.run({ id: "job-success", run: async () => "done" })).resolves.toBe("done");
    expect(runtime.health()).toMatchObject({ service: "worker", status: "ok", state: "idle" });
    expect(events).toEqual(["job.started", "job.succeeded"]);
  });

  it("records failure and allows graceful shutdown", async () => {
    const runtime = new WorkerRuntime({ info: () => undefined, error: () => undefined });
    await expect(
      runtime.run({
        id: "job-failure",
        run: async () => {
          throw new Error("failed");
        },
      }),
    ).rejects.toThrow("failed");
    await runtime.shutdown();
    expect(runtime.health()).toMatchObject({
      service: "worker",
      status: "stopped",
      state: "stopped",
    });
    await expect(runtime.run({ id: "after-stop", run: async () => undefined })).rejects.toThrow(
      "shutting down",
    );
  });

  it("handles SIGTERM with a graceful stop", async () => {
    const runtime = new WorkerRuntime({ info: () => undefined, error: () => undefined });
    const removeHandlers = installShutdownHandlers(runtime);
    process.emit("SIGTERM");
    await new Promise((resolve) => setImmediate(resolve));
    removeHandlers();
    expect(runtime.health()).toMatchObject({ status: "stopped", state: "stopped" });
  });
});
