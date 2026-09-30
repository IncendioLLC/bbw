import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it, expect } from "vitest";
import { Stage1Waf } from "./waf.js";

describe("Stage 1 WAF", () => {
  it("protects the imported ALB with managed rules, limits, logging, and association", () => {
    const stack = new Stack(new App(), "WafTest");
    new Stage1Waf(stack, "Waf", { albArn: "arn:aws:elasticloadbalancing:us-east-1:123456789012:loadbalancer/app/example/abc" });
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::WAFv2::WebACL", 1);
    template.resourceCountIs("AWS::WAFv2::WebACLAssociation", 1);
    template.resourceCountIs("AWS::WAFv2::LoggingConfiguration", 1);
    template.hasResourceProperties("AWS::WAFv2::WebACL", { Scope: "REGIONAL" });
    const acl = JSON.stringify(template.findResources("AWS::WAFv2::WebACL"));
    expect(acl).toContain("AWSManagedRulesCommonRuleSet");
    expect(acl).toContain("PublicChatIpRateLimit");
    expect(acl).toContain("BlockPublicAdminPaths");
  });

  it("creates a CloudFront-scope WebACL for the global edge", () => {
    const stack = new Stack(new App(), "CloudFrontWafTest");
    new Stage1Waf(stack, "Waf", { createCloudFrontWebAcl: true });
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::WAFv2::WebACL", 1);
    template.hasResourceProperties("AWS::WAFv2::WebACL", { Scope: "CLOUDFRONT" });
  });
});
