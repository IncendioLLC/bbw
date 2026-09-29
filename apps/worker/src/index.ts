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
  void runSyntheticJob(process.argv.includes("--fail")).catch(() => (process.exitCode = 1));
}
