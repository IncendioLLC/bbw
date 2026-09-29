import { z } from "zod";

const accountId = z.string().regex(/^\d{12}$/);
const roleName = z.string().regex(/^[A-Za-z0-9+=,.@_-]{1,64}$/);

export const bootstrapConfigSchema = z.object({
  stage1AccountId: accountId,
  deploymentRoleName: roleName,
  region: z.literal("us-east-1"),
});

export type BootstrapConfig = z.infer<typeof bootstrapConfigSchema>;

export function parseBootstrapConfig(input: unknown): BootstrapConfig {
  return bootstrapConfigSchema.parse(input);
}
