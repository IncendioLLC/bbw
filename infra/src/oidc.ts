import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class Stage1GithubActionsRole extends Construct {
  public readonly role: iam.Role;

  public constructor(scope: Construct, id: string, repository = "OWNER/REPOSITORY") {
    super(scope, id);
    const provider = new iam.OpenIdConnectProvider(this, "GithubProvider", {
      url: "https://token.actions.githubusercontent.com",
      clientIds: ["sts.amazonaws.com"],
      thumbprints: ["6938fd4d98bab03faadb97b34396831e3780aea1"],
    });
    this.role = new iam.Role(this, "DeployRole", {
      roleName: "BbwGithubActionsDeploy",
      assumedBy: new iam.FederatedPrincipal(
        provider.openIdConnectProviderArn,
        {
          StringEquals: { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
          StringLike: {
            "token.actions.githubusercontent.com:sub": `repo:${repository}:environment:stage1`,
          },
        },
        "sts:AssumeRoleWithWebIdentity",
      ),
      inlinePolicies: {
        Stage1Deployment: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: [
                "cloudformation:*",
                "ec2:*",
                "ecs:*",
                "ecr:*",
                "rds:*",
                "s3:*",
                "sqs:*",
                "ses:*",
                "sns:*",
                "events:*",
                "logs:*",
                "wafv2:*",
                "cloudfront:*",
                "acm:*",
                "iam:PassRole",
              ],
              resources: ["*"],
            }),
          ],
        }),
      },
    });
  }
}
