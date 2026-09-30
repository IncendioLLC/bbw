export type WorkerState = "idle" | "running" | "stopping" | "stopped";

export interface WorkerJob<T> {
  readonly id: string;
  readonly run: () => Promise<T>;
}

export interface WorkerLogger {
  info(event: string, fields?: Record<string, unknown>): void;
  error(event: string, fields?: Record<string, unknown>): void;
}

export interface WorkerHealth {
  readonly service: "worker";
  readonly status: "ok" | "stopping" | "stopped";
  readonly state: WorkerState;
}

export interface QueueMessage {
  readonly body?: string;
  readonly receiptHandle?: string;
  readonly messageId?: string;
}

export interface QueueClient {
  receive(): Promise<QueueMessage[]>;
  delete(receiptHandle: string): Promise<void>;
}

export class SqsWorker {
  private draining = false;
  private readonly inFlight = new Set<Promise<void>>();

  public constructor(
    private readonly client: QueueClient,
    private readonly runtime = new WorkerRuntime(),
    private readonly processMessage: (message: QueueMessage) => Promise<void> = async () => undefined,
  ) {}

  public async runOnce(): Promise<number> {
    if (this.draining) return 0;
    const messages = await this.client.receive();
    for (const message of messages) {
      if (!message.receiptHandle) continue;
      let operation!: Promise<void>;
      operation = this.runtime
        .run({
          id: message.messageId ?? "sqs-message",
          run: async () => {
            await this.processMessage(message);
            await this.client.delete(message.receiptHandle!);
          },
        })
        .finally(() => this.inFlight.delete(operation));
      this.inFlight.add(operation);
    }
    await Promise.all([...this.inFlight]);
    return messages.length;
  }

  public async drain(): Promise<void> {
    this.draining = true;
    await Promise.all([...this.inFlight]);
    await this.runtime.shutdown();
  }
}

const jsonLogger: WorkerLogger = {
  info(event, fields = {}) {
    console.log(JSON.stringify({ level: "info", event, ...fields }));
  },
  error(event, fields = {}) {
    console.error(JSON.stringify({ level: "error", event, ...fields }));
  },
};

export class WorkerRuntime {
  private currentState: WorkerState = "idle";
  private readonly logger: WorkerLogger;

  public constructor(logger: WorkerLogger = jsonLogger) {
    this.logger = logger;
  }

  public get state(): WorkerState {
    return this.currentState;
  }

  public health(): WorkerHealth {
    return {
      service: "worker",
      status:
        this.currentState === "stopping"
          ? "stopping"
          : this.currentState === "stopped"
            ? "stopped"
            : "ok",
      state: this.currentState,
    };
  }

  public async run<T>(job: WorkerJob<T>): Promise<T> {
    if (this.currentState === "stopping" || this.currentState === "stopped") {
      throw new Error("worker is shutting down");
    }
    this.currentState = "running";
    this.logger.info("job.started", { jobId: job.id });
    try {
      const result = await job.run();
      this.logger.info("job.succeeded", { jobId: job.id });
      this.currentState = "idle";
      return result;
    } catch (error) {
      this.currentState = "idle";
      this.logger.error("job.failed", {
        jobId: job.id,
        error: error instanceof Error ? error.message : "unknown error",
      });
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    if (this.currentState === "stopped") return;
    this.currentState = "stopping";
    this.logger.info("worker.stopping");
    this.currentState = "stopped";
    this.logger.info("worker.stopped");
  }
}

export function installShutdownHandlers(runtime: WorkerRuntime): () => void {
  const onSignal = () => void runtime.shutdown();
  process.once("SIGTERM", onSignal);
  process.once("SIGINT", onSignal);
  return () => {
    process.off("SIGTERM", onSignal);
    process.off("SIGINT", onSignal);
  };
}

export async function runSyntheticJob(shouldFail = false): Promise<void> {
  const runtime = new WorkerRuntime();
  const removeHandlers = installShutdownHandlers(runtime);
  try {
    await runtime.run({
      id: shouldFail ? "synthetic-failure" : "synthetic-success",
      run: async () => {
        if (shouldFail) throw new Error("synthetic job failure");
      },
    });
  } finally {
    removeHandlers();
    await runtime.shutdown();
  }
}

if (process.argv[1]?.endsWith("index.ts") || process.argv[1]?.endsWith("index.js")) {
  if (process.env.JOB_QUEUE_URL) {
    void (async () => {
      const { DeleteMessageCommand, ReceiveMessageCommand, SQSClient } = await import(
        "@aws-sdk/client-sqs"
      );
      const client = new SQSClient({});
      const worker = new SqsWorker(
        {
          async receive() {
            const result = await client.send(
              new ReceiveMessageCommand({
                QueueUrl: process.env.JOB_QUEUE_URL,
                MaxNumberOfMessages: 10,
                WaitTimeSeconds: 20,
                VisibilityTimeout: 60,
              }),
            );
            return (result.Messages ?? []).map((message) => ({
              ...(message.Body === undefined ? {} : { body: message.Body }),
              ...(message.MessageId === undefined ? {} : { messageId: message.MessageId }),
              ...(message.ReceiptHandle === undefined
                ? {}
                : { receiptHandle: message.ReceiptHandle }),
            }));
          },
          async delete(receiptHandle) {
            await client.send(
              new DeleteMessageCommand({ QueueUrl: process.env.JOB_QUEUE_URL, ReceiptHandle: receiptHandle }),
            );
          },
        },
        new WorkerRuntime(),
        async (message) => {
          if (message.body) {
            try {
              const payload = JSON.parse(message.body) as { fail?: boolean };
              if (payload.fail === true) {
                throw new Error("requested test failure");
              }
            } catch (error) {
              if (error instanceof SyntaxError) return;
              throw error;
            }
          }
        },
      );
      installShutdownHandlers({ shutdown: () => worker.drain() } as WorkerRuntime);
      while (true) await worker.runOnce();
    })().catch((error) => {
      console.error(JSON.stringify({ level: "error", event: "worker.start_failed", error: String(error) }));
      process.exitCode = 1;
    });
  } else {
    void runSyntheticJob(process.argv.includes("--fail")).catch(() => (process.exitCode = 1));
  }
}
