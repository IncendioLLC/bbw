import { App, Stack } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { Stage1Compute } from "./compute.js";
import { Stage1Edge } from "./edge.js";

describe("Stage 1 edge", () => {
  it("creates HTTPS host rules with an isolated management target", { timeout: 30_000 }, () => {
    const stack = new Stack(new App(), "EdgeFocusedTest");
    const vpc = new ec2.Vpc(stack, "Vpc", {
      maxAzs: 2,
      natGateways: 0,
      subnetConfiguration: [
        { name: "public", subnetType: ec2.SubnetType.PUBLIC },
        { name: "private", subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      ],
    });
    const security = new ec2.SecurityGroup(stack, "AlbSecurity", { vpc: vpc as unknown as ec2.IVpc });
    const compute = new Stage1Compute(stack, "Compute", vpc, security, true);
    new Stage1Edge(stack, "Edge", {
      vpc: vpc as unknown as ec2.Vpc,
      albSecurityGroup: security,
      publicService: compute.publicService!,
      apiService: compute.apiService!,
      managementService: compute.managementService!,
      certificateArn: "arn:aws:acm:us-east-1:123456789012:certificate/test",
      adminHostname: "admin.bbw.incendiollc.com",
      publicCloudFrontHostname: "app.bbw.incendiollc.com",
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::ElasticLoadBalancingV2::LoadBalancer", 1);
    template.resourceCountIs("AWS::ElasticLoadBalancingV2::Listener", 2);
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::ListenerRule", {
      Conditions: [{ Field: "host-header", HostHeaderConfig: { Values: ["admin.bbw.incendiollc.com"] } }],
    });
    template.hasResourceProperties("AWS::ElasticLoadBalancingV2::ListenerRule", {
      Conditions: [
        {
          Field: "host-header",
          HostHeaderConfig: { Values: ["app.bbw.incendiollc.com"] },
        },
      ],
    });
  });
});
