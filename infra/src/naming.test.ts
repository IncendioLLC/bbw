import { describe, expect, it } from "vitest";
import { REQUIRED_TAGS, requiredTags, resourceName } from "./naming.js";

describe("infrastructure naming policy", () => {
  it("produces deterministic bounded names", () => {
    expect(resourceName("stage1", "api-service")).toBe("bbw-stage1-api-service");
    expect(resourceName("stage1", "edge")).toMatch(/^[a-z0-9-]+$/);
  });

  it("provides mandatory tags", () => {
    const tags = requiredTags("stage1");
    expect(Object.keys(tags)).toEqual(expect.arrayContaining([...REQUIRED_TAGS]));
    expect(tags.Environment).toBe("stage1");
  });

  it("rejects names over the AWS limit", () => {
    expect(() => resourceName("stage1", "x".repeat(70))).toThrow(/63 characters/);
  });
});
