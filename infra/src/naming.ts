import type { StageEnvironment } from "./index.js";

export const REQUIRED_TAGS = ["Application", "Environment", "Owner"] as const;

export function resourceName(environment: StageEnvironment, component: string): string {
  const normalized = component
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const name = `bbw-${environment}-${normalized}`;
  if (name.length > 63) throw new Error(`Resource name exceeds 63 characters: ${name}`);
  return name;
}

export function requiredTags(environment: StageEnvironment): Record<string, string> {
  return { Application: "bbw", Environment: environment, Owner: "platform" };
}
