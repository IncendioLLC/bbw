import Fastify, { type FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";

export function buildApi(): FastifyInstance {
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
    return { service: "api", status: "ready" };
  });

  return app;
}

export async function startApi(port = Number(process.env.PORT ?? 4000)): Promise<FastifyInstance> {
  const app = buildApi();
  await app.listen({ host: "127.0.0.1", port });
  const close = async () => app.close();
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
