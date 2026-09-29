import { z } from "zod";

export type EnvironmentSource = Readonly<Record<string, string | undefined>>;
export type Deployable = "admin" | "api" | "infra" | "web" | "worker";

export interface EnvironmentIssue {
  readonly variable: string;
  readonly reason: "invalid" | "missing";
}

/**
 * An intentionally sanitized configuration error.
 *
 * It retains variable names and failure categories, but never the source values
 * or the original Zod error. This makes the error safe for startup logs.
 */
export class EnvironmentValidationError extends Error {
  readonly deployable: Deployable;
  readonly issues: readonly EnvironmentIssue[];

  constructor(deployable: Deployable, issues: readonly EnvironmentIssue[]) {
    const detail = issues.map(({ variable, reason }) => `${variable} is ${reason}`).join("; ");

    super(`Invalid ${deployable} environment: ${detail}`);
    this.name = "EnvironmentValidationError";
    this.deployable = deployable;
    this.issues = issues;
  }
}

const nodeEnvironment = z.enum(["development", "test", "production"]);
const httpUrl = z.url({ protocol: /^https?$/ });
const postgresUrl = z.url({ protocol: /^postgres(?:ql)?$/ });
const awsRegion = z.string().regex(/^[a-z]{2}(?:-gov)?-[a-z]+-\d$/);
const accountId = z.string().regex(/^\d{12}$/);

export const webEnvSchema = z.object({
  NODE_ENV: nodeEnvironment,
  NEXT_PUBLIC_API_BASE_URL: httpUrl,
});

export const adminEnvSchema = z.object({
  NODE_ENV: nodeEnvironment,
  NEXT_PUBLIC_API_BASE_URL: httpUrl,
});

export const apiEnvSchema = z.object({
  NODE_ENV: nodeEnvironment,
  PORT: z.coerce.number().int().min(1).max(65_535),
  DATABASE_URL: postgresUrl,
});

export const workerEnvSchema = z.object({
  NODE_ENV: nodeEnvironment,
  DATABASE_URL: postgresUrl,
  JOB_QUEUE_URL: z.url({ protocol: /^https$/ }),
});

export const infraEnvSchema = z.object({
  DEPLOYMENT_STAGE: z.enum(["management", "nonproduction", "production"]),
  AWS_ACCOUNT_ID: accountId,
  AWS_REGION: awsRegion,
});

export type WebEnv = z.infer<typeof webEnvSchema>;
export type AdminEnv = z.infer<typeof adminEnvSchema>;
export type ApiEnv = z.infer<typeof apiEnvSchema>;
export type WorkerEnv = z.infer<typeof workerEnvSchema>;
export type InfraEnv = z.infer<typeof infraEnvSchema>;

function sanitizeIssues(error: z.ZodError, source: EnvironmentSource): readonly EnvironmentIssue[] {
  const issues = new Map<string, EnvironmentIssue>();

  for (const issue of error.issues) {
    const variable = issue.path.map(String).join(".") || "environment";
    const rootVariable = variable.split(".", 1)[0] ?? variable;
    issues.set(variable, {
      variable,
      reason: source[rootVariable] === undefined ? "missing" : "invalid",
    });
  }

  return [...issues.values()];
}

export function parseEnvironment<TSchema extends z.ZodType>(
  deployable: Deployable,
  schema: TSchema,
  source: EnvironmentSource,
): z.output<TSchema> {
  const result = schema.safeParse(source);

  if (!result.success) {
    throw new EnvironmentValidationError(deployable, sanitizeIssues(result.error, source));
  }

  return result.data;
}

export const parseWebEnv = (source: EnvironmentSource): WebEnv =>
  parseEnvironment("web", webEnvSchema, source);

export const parseAdminEnv = (source: EnvironmentSource): AdminEnv =>
  parseEnvironment("admin", adminEnvSchema, source);

export const parseApiEnv = (source: EnvironmentSource): ApiEnv =>
  parseEnvironment("api", apiEnvSchema, source);

export const parseWorkerEnv = (source: EnvironmentSource): WorkerEnv =>
  parseEnvironment("worker", workerEnvSchema, source);

export const parseInfraEnv = (source: EnvironmentSource): InfraEnv =>
  parseEnvironment("infra", infraEnvSchema, source);
