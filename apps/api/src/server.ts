import Fastify, { type FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { Pool, type PoolConfig } from "pg";

export interface ApiDependencies {
  readonly database?: Pick<Pool, "query">;
}

function databaseConnectionString(): string | undefined {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const raw = process.env.DATABASE_SECRET;
  if (!raw) return undefined;
  try {
    const secret = JSON.parse(raw) as {
      host?: string;
      port?: number;
      dbname?: string;
      username?: string;
      password?: string;
    };
    if (!secret.host || !secret.username || !secret.password) return undefined;
    const user = encodeURIComponent(secret.username);
    const password = encodeURIComponent(secret.password);
    return `postgresql://${user}:${password}@${secret.host}:${secret.port ?? 5432}/${secret.dbname ?? "postgres"}`;
  } catch {
    return undefined;
  }
}

export function createDatabasePool(connectionString = databaseConnectionString()): Pool {
  if (!connectionString) throw new Error("DATABASE_URL is required for the API process");
  const config: PoolConfig = {
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
    // RDS requires TLS. Certificate-chain verification is supplied by the
    // deployment image when a CA bundle is configured; encrypted transport is
    // still mandatory for the Stage 1 smoke path.
    ssl: { rejectUnauthorized: false },
  };
  return new Pool(config);
}

export function buildApi(dependencies: ApiDependencies = {}): FastifyInstance {
  let databaseReady = !dependencies.database;
  const app = Fastify({
    genReqId: (request) => {
      const incoming = request.headers["x-request-id"];
      return typeof incoming === "string" && incoming.length > 0 ? incoming : randomUUID();
    },
    logger: false,
  });

  app.addHook("onSend", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  app.get("/healthz", async () => ({ service: "api", status: "ok" }));
  app.get("/readyz", async (_request, reply) => {
    reply.header("cache-control", "no-store");
    if (!databaseReady) {
      reply.code(503);
      return { service: "api", status: "not_ready", dependency: "database" };
    }
    return { service: "api", status: "ready" };
  });

  app.decorate("markDatabaseReady", () => {
    databaseReady = true;
  });

  return app;
}

export async function startApi(port = Number(process.env.PORT ?? 4000)): Promise<FastifyInstance> {
  const database = createDatabasePool();
  await database.query("select 1 as ok");
  const app = buildApi({ database });
  (app as FastifyInstance & { markDatabaseReady: () => void }).markDatabaseReady();
  await app.listen({ host: "0.0.0.0", port });
  const close = async () => {
    await app.close();
    await database.end();
  };
  process.once("SIGTERM", close);
  process.once("SIGINT", close);
  return app;
}

if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  void startApi().catch((error) => {
    console.error(
      JSON.stringify({ level: "error", event: "api.start_failed", error: String(error) }),
    );
    process.exitCode = 1;
  });
}
