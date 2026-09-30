import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Stage1Network } from "./network.js";
import { Stage1Storage } from "./storage.js";
import { Stage1Queues } from "./messaging.js";
import { Stage1SecurityGroups } from "./security.js";
import { Stage1Database } from "./database.js";
import { Stage1Compute } from "./compute.js";
import { Stage1Events } from "./events.js";
import { Stage1Email } from "./email.js";
import { Stage1GithubActionsRole } from "./oidc.js";
import { Stage1Edge } from "./edge.js";
import { Stage1CloudFront } from "./cloudfront.js";
import { Stage1Waf } from "./waf.js";

export type StageEnvironment = "stage1";

export interface StageEnvironmentConfig {
  readonly name: StageEnvironment;
  readonly account?: string | undefined;
  readonly region: string;
  readonly terminationProtection: boolean;
}

export const environmentConfig: Record<StageEnvironment, StageEnvironmentConfig> = {
  stage1: {
    name: "stage1",
    account: process.env.BBW_STAGE1_ACCOUNT,
    region: "us-east-1",
    terminationProtection: false,
  },
};

const externalIntegrations = {
  ses: process.env.BBW_ENABLE_SES === "true",
  githubOidc: process.env.BBW_ENABLE_GITHUB_OIDC === "true",
};

export class Stage1FoundationStack extends cdk.Stack {
  public constructor(
    scope: Construct,
    id: string,
    config: StageEnvironmentConfig,
    props?: cdk.StackProps,
  ) {
    super(scope, id, {
      ...props,
      env: config.account
        ? { account: config.account, region: config.region }
        : { region: config.region },
      terminationProtection: config.terminationProtection,
      description: `BBW Stage 1 foundation (${config.name})`,
      tags: { Application: "bbw", Environment: config.name, Owner: "platform" },
    });
    new cdk.CfnOutput(this, "Environment", { value: config.name });
    new cdk.CfnOutput(this, "Region", { value: config.region });
    const network = new Stage1Network(this, "Network");
    new cdk.CfnOutput(this, "VpcId", { value: network.vpc.vpcId });
    const security = new Stage1SecurityGroups(this, "Security", network.vpc);
    const database = new Stage1Database(this, "Database", network.vpc, security.database);
    const queues = new Stage1Queues(this, "Queues");
    const compute = new Stage1Compute(
      this,
      "Compute",
      network.vpc,
      security.ecs,
      process.env.BBW_ENABLE_STAGE1_SERVICES === "true",
      database.instance.secret ?? undefined,
      queues.queues.embeddings,
    );
    const certificateArn = process.env.BBW_ALB_CERTIFICATE_ARN;
    if (
      process.env.BBW_ENABLE_STAGE1_SERVICES === "true" &&
      certificateArn &&
      compute.publicService &&
      compute.apiService &&
      compute.managementService
    ) {
      const edgeProps = {
        vpc: network.vpc,
        albSecurityGroup: security.alb,
        publicService: compute.publicService,
        apiService: compute.apiService,
        managementService: compute.managementService,
        certificateArn,
        adminHostname: process.env.BBW_ADMIN_HOSTNAME ?? "admin.bbw.incendiollc.com",
        publicHostname: process.env.BBW_PUBLIC_HOSTNAME ?? "bbw.incendiollc.com",
        publicCloudFrontHostname: process.env.BBW_PUBLIC_CLOUDFRONT_HOSTNAME ?? "app.bbw.incendiollc.com",
        apiHostname: process.env.BBW_API_HOSTNAME ?? "api.bbw.incendiollc.com",
      };
      const edge = new Stage1Edge(this, "Edge", edgeProps);
      const publicCloudFrontCertificateArn = process.env.BBW_CLOUDFRONT_PUBLIC_CERTIFICATE_ARN;
      const managementCloudFrontCertificateArn = process.env.BBW_CLOUDFRONT_MANAGEMENT_CERTIFICATE_ARN;
      const waf = new Stage1Waf(this, "Waf", {
        albArn: edge.loadBalancer.loadBalancerArn,
        createCloudFrontWebAcl: Boolean(publicCloudFrontCertificateArn && managementCloudFrontCertificateArn),
      });
      if (publicCloudFrontCertificateArn && managementCloudFrontCertificateArn) {
        new Stage1CloudFront(this, "CloudFront", {
          originDomainName: process.env.BBW_CLOUDFRONT_ORIGIN_DOMAIN ?? edge.loadBalancer.loadBalancerDnsName,
          publicCertificateArn: publicCloudFrontCertificateArn,
          managementCertificateArn: managementCloudFrontCertificateArn,
          publicHostname: process.env.BBW_PUBLIC_CLOUDFRONT_HOSTNAME ?? "app.bbw.incendiollc.com",
          managementHostname: process.env.BBW_MANAGEMENT_CLOUDFRONT_HOSTNAME ?? "admin.bbw.incendiollc.com",
          ...(waf.cloudFrontWebAcl ? { webAclArn: waf.cloudFrontWebAcl.attrArn } : {}),
        });
      }
    }
    new Stage1Storage(this, "Storage");
    new Stage1Events(this, "Events", queues.queues.scheduled);
    if (externalIntegrations.ses) {
      const domain = process.env.BBW_SES_DOMAIN;
      if (!domain) throw new Error("BBW_SES_DOMAIN is required when BBW_ENABLE_SES=true");
      new Stage1Email(
        this,
        "Email",
        domain,
        process.env.BBW_SES_USE_EXISTING_IDENTITY === "true",
      );
    }
    if (externalIntegrations.githubOidc) {
      const repository = process.env.BBW_GITHUB_REPOSITORY;
      if (!repository)
        throw new Error("BBW_GITHUB_REPOSITORY is required when BBW_ENABLE_GITHUB_OIDC=true");
      new Stage1GithubActionsRole(
        this,
        "GithubActions",
        repository,
        process.env.BBW_GITHUB_IMMUTABLE_SUBJECT,
      );
    }
  }
}

/**
 * Deployable edge-only stack used when the foundation stack contains live
 * resources that are intentionally managed outside of CDK during recovery.
 * The origin is resolved through the owner-managed DNS alias and therefore
 * does not need a CloudFormation reference to the ALB.
 */
export class Stage1CloudFrontStack extends cdk.Stack {
  public constructor(scope: Construct, id: string, config: StageEnvironmentConfig) {
    super(scope, id, {
      env: config.account ? { account: config.account, region: config.region } : { region: config.region },
      terminationProtection: config.terminationProtection,
      description: `BBW Stage 1 CloudFront edge (${config.name})`,
      tags: { Application: "bbw", Environment: config.name, Owner: "platform" },
    });
    const originDomainName = process.env.BBW_CLOUDFRONT_ORIGIN_DOMAIN;
    const publicCertificateArn = process.env.BBW_CLOUDFRONT_PUBLIC_CERTIFICATE_ARN;
    const managementCertificateArn = process.env.BBW_CLOUDFRONT_MANAGEMENT_CERTIFICATE_ARN;
    if (!originDomainName || !publicCertificateArn || !managementCertificateArn) {
      throw new Error(
        "BBW_CLOUDFRONT_ORIGIN_DOMAIN, BBW_CLOUDFRONT_PUBLIC_CERTIFICATE_ARN, and BBW_CLOUDFRONT_MANAGEMENT_CERTIFICATE_ARN are required for CloudFront-only deployment",
      );
    }
    const waf = new Stage1Waf(this, "Waf", { createCloudFrontWebAcl: true });
    new Stage1CloudFront(this, "CloudFront", {
      originDomainName,
      publicCertificateArn,
      managementCertificateArn,
      publicHostname: process.env.BBW_PUBLIC_CLOUDFRONT_HOSTNAME ?? "app.bbw.incendiollc.com",
      managementHostname: process.env.BBW_MANAGEMENT_CLOUDFRONT_HOSTNAME ?? "admin.bbw.incendiollc.com",
      ...(waf.cloudFrontWebAcl ? { webAclArn: waf.cloudFrontWebAcl.attrArn } : {}),
    });
  }
}

export function createStage1App(environment: StageEnvironment = "stage1"): cdk.App {
  const app = new cdk.App();
  if (process.env.BBW_CLOUDFRONT_ONLY === "true") {
    new Stage1CloudFrontStack(app, `BbwStage1CloudFront-${environment}`, environmentConfig[environment]);
  } else {
    new Stage1FoundationStack(app, `BbwStage1-${environment}`, environmentConfig[environment]);
  }
  return app;
}

const selected = (process.env.BBW_CDK_ENV ?? "stage1") as StageEnvironment;
if (!(selected in environmentConfig))
  throw new Error(`BBW_CDK_ENV must be stage1; received ${selected}`);
createStage1App(selected);
