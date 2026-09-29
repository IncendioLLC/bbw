import { describe, expect, it } from "vitest";

import {
  EnvironmentValidationError,
  parseAdminEnv,
  parseApiEnv,
  parseInfraEnv,
  parseWebEnv,
  parseWorkerEnv,
} from "../src/environment.js";

describe("deployable environment schemas", () => {
  it.each([
    [
      "web",
      parseWebEnv,
      {
        NODE_ENV: "production",
        NEXT_PUBLIC_API_BASE_URL: "https://api.example.com",
      },
    ],
    [
      "admin",
      parseAdminEnv,
      {
        NODE_ENV: "production",
        NEXT_PUBLIC_API_BASE_URL: "https://api.example.com",
      },
    ],
    [
      "api",
      parseApiEnv,
      {
        NODE_ENV: "development",
        PORT: "3001",
        DATABASE_URL: "postgresql://bbw:password@localhost:5432/bbw",
      },
    ],
    [
      "worker",
      parseWorkerEnv,
      {
        NODE_ENV: "test",
        DATABASE_URL: "postgresql://bbw:password@localhost:5432/bbw",
        JOB_QUEUE_URL: "https://sqs.us-east-1.amazonaws.com/123456789012/jobs",
      },
    ],
    [
      "infra",
      parseInfraEnv,
      {
        DEPLOYMENT_STAGE: "nonproduction",
        AWS_ACCOUNT_ID: "123456789012",
        AWS_REGION: "us-east-1",
      },
    ],
  ] as const)("parses a valid %s environment", (_name, parse, source) => {
    const expected = _name === "api" ? { ...source, PORT: Number(source.PORT) } : source;
    expect(parse(source)).toEqual(expected);
  });

  it("reports missing variables without echoing input", () => {
    expect(() => parseApiEnv({ NODE_ENV: "test", PORT: "3001" })).toThrow(
      new EnvironmentValidationError("api", [{ variable: "DATABASE_URL", reason: "missing" }]),
    );
  });

  it.each([
    [
      "web URL",
      () =>
        parseWebEnv({
          NODE_ENV: "production",
          NEXT_PUBLIC_API_BASE_URL: "not-a-url",
        }),
    ],
    [
      "admin URL",
      () =>
        parseAdminEnv({
          NODE_ENV: "production",
          NEXT_PUBLIC_API_BASE_URL: "ftp://example.com",
        }),
    ],
    [
      "API port",
      () =>
        parseApiEnv({
          NODE_ENV: "production",
          PORT: "70000",
          DATABASE_URL: "postgresql://localhost/bbw",
        }),
    ],
    [
      "worker queue URL",
      () =>
        parseWorkerEnv({
          NODE_ENV: "production",
          DATABASE_URL: "postgresql://localhost/bbw",
          JOB_QUEUE_URL: "http://localhost/queue",
        }),
    ],
    [
      "infra account ID",
      () =>
        parseInfraEnv({
          DEPLOYMENT_STAGE: "production",
          AWS_ACCOUNT_ID: "123",
          AWS_REGION: "us-east-1",
        }),
    ],
  ])("rejects a malformed %s", (_name, parse) => {
    expect(parse).toThrow(EnvironmentValidationError);
  });

  it("redacts secret values from errors and serialized errors", () => {
    const secret = "super-secret-database-value";

    try {
      parseApiEnv({
        NODE_ENV: "production",
        PORT: "3001",
        DATABASE_URL: secret,
      });
      expect.unreachable("Expected environment validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(EnvironmentValidationError);
      expect(String(error)).not.toContain(secret);
      expect(JSON.stringify(error)).not.toContain(secret);
      expect(error).toMatchObject({
        deployable: "api",
        issues: [{ variable: "DATABASE_URL", reason: "invalid" }],
      });
    }
  });
});
