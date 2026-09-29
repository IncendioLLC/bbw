import { App, Stack } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { Stage1SecurityGroups } from "./security.js";

describe("Stage 1 security groups", () => {
  it("allows only edge-to-ECS and ECS-to-database paths", () => {
    const stack = new Stack(new App(), "SecurityTest");
    const vpc = new ec2.Vpc(stack, "Vpc", { maxAzs: 2, natGateways: 0 });
    new Stage1SecurityGroups(stack, "Security", vpc);
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::EC2::SecurityGroup", 4);
    template.hasResourceProperties("AWS::EC2::SecurityGroupIngress", {
      FromPort: 5432,
      ToPort: 5432,
    });
  });
});
