import { describe, expect, it } from "vitest";
import { parseBootstrapConfig } from "./bootstrap.js";

const valid = {
  stage1AccountId: "111111111111",
  deploymentRoleName: "BbwGithubActionsDeploy",
  region: "us-east-1",
};

describe("AWS bootstrap configuration", () => {
  it("accepts complete account and role configuration", () => {
    expect(parseBootstrapConfig(valid)).toEqual(valid);
  });

  it("rejects malformed account IDs and regions", () => {
    expect(() =>
      parseBootstrapConfig({ ...valid, stage1AccountId: "123", region: "us-west-2" }),
    ).toThrow();
  });
});
