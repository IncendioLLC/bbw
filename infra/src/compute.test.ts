import { App, Stack } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { Stage1Compute } from "./compute.js";

describe("Stage 1 compute", () => {
  it("creates a cluster and scoped ECS roles", () => {
    const stack = new Stack(new App(), "ComputeTest");
    const vpc = new ec2.Vpc(stack, "Vpc", { maxAzs: 2, natGateways: 0 });
    new Stage1Compute(stack, "Compute", vpc);
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::ECS::Cluster", 1);
    template.resourceCountIs("AWS::IAM::Role", 2);
    template.hasResourceProperties("AWS::ECS::Cluster", {
      ClusterSettings: [{ Name: "containerInsights", Value: "enabled" }],
    });
  });
});
