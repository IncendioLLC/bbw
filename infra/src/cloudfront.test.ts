import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { Stage1CloudFront } from "./cloudfront.js";

describe("Stage 1 CloudFront", () => {
  it("creates separate TLS distributions with disabled caching", () => {
    const stack = new Stack(new App(), "CloudFrontTest");
    new Stage1CloudFront(stack, "CloudFront", {
      originDomainName: "internal-alb.us-east-1.elb.amazonaws.com",
      publicCertificateArn: "arn:aws:acm:us-east-1:123456789012:certificate/public",
      managementCertificateArn: "arn:aws:acm:us-east-1:123456789012:certificate/management",
      publicHostname: "app.bbw.incendiollc.com",
      managementHostname: "admin.bbw.incendiollc.com",
    });
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::CloudFront::Distribution", 2);
    template.hasResourceProperties("AWS::CloudFront::Distribution", {
      DistributionConfig: {
        ViewerCertificate: { AcmCertificateArn: "arn:aws:acm:us-east-1:123456789012:certificate/public" },
        DefaultCacheBehavior: { ViewerProtocolPolicy: "redirect-to-https" },
        Origins: [{ CustomOriginConfig: { OriginProtocolPolicy: "https-only" } }],
      },
    });
  });
});
