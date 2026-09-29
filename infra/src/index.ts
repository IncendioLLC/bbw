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
    new Stage1Database(this, "Database", network.vpc, security.database);
    new Stage1Compute(this, "Compute", network.vpc);
    new Stage1Storage(this, "Storage");
    const queues = new Stage1Queues(this, "Queues");
    new Stage1Events(this, "Events", queues.queues.scheduled);
    if (externalIntegrations.ses) {
      const domain = process.env.BBW_SES_DOMAIN;
      if (!domain) throw new Error("BBW_SES_DOMAIN is required when BBW_ENABLE_SES=true");
      new Stage1Email(this, "Email", domain);
    }
    if (externalIntegrations.githubOidc) {
      const repository = process.env.BBW_GITHUB_REPOSITORY;
      if (!repository)
        throw new Error("BBW_GITHUB_REPOSITORY is required when BBW_ENABLE_GITHUB_OIDC=true");
      new Stage1GithubActionsRole(this, "GithubActions", repository);
    }
  }
}

export function createStage1App(environment: StageEnvironment = "stage1"): cdk.App {
  const app = new cdk.App();
  new Stage1FoundationStack(app, `BbwStage1-${environment}`, environmentConfig[environment]);
  return app;
}

const selected = (process.env.BBW_CDK_ENV ?? "stage1") as StageEnvironment;
if (!(selected in environmentConfig))
  throw new Error(`BBW_CDK_ENV must be stage1; received ${selected}`);
createStage1App(selected);
