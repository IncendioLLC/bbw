import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { Stage1Network, stage1NetworkProfile } from "./network.js";

describe("Stage 1 network", () => {
  it("creates two-AZ public, application, and isolated database subnets", () => {
    const stack = new Stack(new App(), "NetworkTest");
    new Stage1Network(stack, "Network");
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::EC2::Subnet", 6);
    template.hasResourceProperties("AWS::EC2::Subnet", { MapPublicIpOnLaunch: true });
    template.hasResourceProperties("AWS::EC2::SubnetRouteTableAssociation", {});
    expect(template.toJSON().Resources).toBeDefined();
  });

  it("keeps the Stage 1 cost profile explicit and extensible", () => {
    expect(stage1NetworkProfile).toMatchObject({
      maxAzs: 2,
      natGateways: 2,
      futureAccountIsolation: true,
    });
  });
});
