import { describe, expect, it } from "vitest";

import { SqsWorker, WorkerRuntime, installShutdownHandlers, type QueueClient } from "../src/index.js";

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

  it("deletes successfully processed SQS messages", async () => {
    const deleted: string[] = [];
    const client: QueueClient = {
      async receive() {
        return [{ messageId: "m1", receiptHandle: "r1", body: "{}" }];
      },
      async delete(receiptHandle) {
        deleted.push(receiptHandle);
      },
    };
    const worker = new SqsWorker(client, new WorkerRuntime({ info: () => undefined, error: () => undefined }));
    await expect(worker.runOnce()).resolves.toBe(1);
    expect(deleted).toEqual(["r1"]);
    await worker.drain();
  });

  it("leaves failed messages for SQS redelivery", async () => {
    let deleted = false;
    const client: QueueClient = {
      async receive() {
        return [{ messageId: "m2", receiptHandle: "r2", body: "{}" }];
      },
      async delete() {
        deleted = true;
      },
    };
    const worker = new SqsWorker(
      client,
      new WorkerRuntime({ info: () => undefined, error: () => undefined }),
      async () => {
        throw new Error("temporary failure");
      },
    );
    await expect(worker.runOnce()).rejects.toThrow("temporary failure");
    expect(deleted).toBe(false);
    await worker.drain();
  });
});
