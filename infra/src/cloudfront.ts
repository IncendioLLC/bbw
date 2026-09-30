import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";

export interface Stage1CloudFrontProps {
  /** Public ALB DNS name, not a user-facing DNS name. */
  readonly originDomainName: string;
  readonly publicCertificateArn: string;
  readonly managementCertificateArn: string;
  readonly publicHostname?: string;
  readonly managementHostname?: string;
}

/**
 * Viewer TLS and response privacy boundary for the public and management
 * surfaces. The origin request policy forwards the viewer Host header so the
 * shared ALB can retain host-based isolation.
 */
export class Stage1CloudFront extends Construct {
  public readonly publicDistribution: cloudfront.Distribution;
  public readonly managementDistribution: cloudfront.Distribution;

  public constructor(scope: Construct, id: string, props: Stage1CloudFrontProps) {
    super(scope, id);
    const publicOrigin = new origins.HttpOrigin(props.originDomainName, {
      protocolPolicy: cloudfront.OriginProtocolPolicy.HTTPS_ONLY,
      httpsPort: 443,
    });
    const securityHeaders = cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS;
    const cachePolicy = cloudfront.CachePolicy.CACHING_DISABLED;
    const originRequestPolicy = cloudfront.OriginRequestPolicy.ALL_VIEWER;

    this.publicDistribution = new cloudfront.Distribution(this, "PublicDistribution", {
      comment: "BBW Stage 1 public/member distribution",
      enabled: true,
      domainNames: [props.publicHostname ?? "app.bbw.incendiollc.com"],
      certificate: acm.Certificate.fromCertificateArn(this, "PublicCertificate", props.publicCertificateArn),
      defaultBehavior: {
        origin: publicOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy,
        originRequestPolicy,
        responseHeadersPolicy: securityHeaders,
      },
    });

    this.managementDistribution = new cloudfront.Distribution(this, "ManagementDistribution", {
      comment: "BBW Stage 1 management distribution",
      enabled: true,
      domainNames: [props.managementHostname ?? "admin.bbw.incendiollc.com"],
      certificate: acm.Certificate.fromCertificateArn(this, "ManagementCertificate", props.managementCertificateArn),
      defaultBehavior: {
        origin: publicOrigin,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy,
        originRequestPolicy,
        responseHeadersPolicy: securityHeaders,
      },
    });
  }
}
