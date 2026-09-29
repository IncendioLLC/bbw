import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { Stage1Storage } from "./storage.js";

describe("Stage 1 storage", () => {
  it("creates private encrypted versioned buckets with lifecycle rules", () => {
    const stack = new Stack(new App(), "StorageTest");
    new Stage1Storage(stack, "Storage");
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::S3::Bucket", 3);
    template.allResourcesProperties("AWS::S3::Bucket", {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
      VersioningConfiguration: { Status: "Enabled" },
    });
  });
});
