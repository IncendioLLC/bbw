import * as logs from "aws-cdk-lib/aws-logs";
import * as wafv2 from "aws-cdk-lib/aws-wafv2";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";

export interface Stage1WafProps {
  readonly albArn?: string;
  readonly createCloudFrontWebAcl?: boolean;
}

/**
 * WAF is deliberately split by AWS scope: regional protection belongs on the
 * ALB, while CloudFront requires a CLOUDFRONT WebACL in us-east-1.
 */
export class Stage1Waf extends Construct {
  public readonly regionalWebAcl?: wafv2.CfnWebACL;
  public readonly cloudFrontWebAcl?: wafv2.CfnWebACL;

  public constructor(scope: Construct, id: string, props: Stage1WafProps) {
    super(scope, id);
    if (props.albArn) {
      this.regionalWebAcl = this.createWebAcl("Regional", "REGIONAL");
      new wafv2.CfnWebACLAssociation(this, "AlbAssociation", {
        resourceArn: props.albArn,
        webAclArn: this.regionalWebAcl.attrArn,
      });
      new CfnOutput(this, "RegionalWebAclArn", { value: this.regionalWebAcl.attrArn });
    }
    if (props.createCloudFrontWebAcl) {
      this.cloudFrontWebAcl = this.createWebAcl("CloudFront", "CLOUDFRONT");
      new CfnOutput(this, "CloudFrontWebAclArn", { value: this.cloudFrontWebAcl.attrArn });
    }
  }

  private createWebAcl(id: string, scope: "REGIONAL" | "CLOUDFRONT"): wafv2.CfnWebACL {
    const logGroup = new logs.LogGroup(this, `${id}LogGroup`, {
      logGroupName: `aws-waf-logs-bbw-stage1-${id.toLowerCase()}`,
      retention: logs.RetentionDays.ONE_MONTH,
      removalPolicy: RemovalPolicy.RETAIN,
    });
    const webAcl = new wafv2.CfnWebACL(this, `${id}WebAcl`, {
      name: `bbw-stage1-${id.toLowerCase()}-waf`,
      scope,
      defaultAction: { allow: {} },
      visibilityConfig: {
        cloudWatchMetricsEnabled: true,
        metricName: `bbw-stage1-${id.toLowerCase()}-waf`,
        sampledRequestsEnabled: true,
      },
      rules: [
        this.managedRule("CommonRuleSet", 10, "AWSManagedRulesCommonRuleSet"),
        this.managedRule("KnownBadInputs", 20, "AWSManagedRulesKnownBadInputsRuleSet"),
        {
          name: "GeneralIpRateLimit",
          priority: 30,
          action: { block: {} },
          statement: { rateBasedStatement: { limit: 2000, aggregateKeyType: "IP" } },
          visibilityConfig: this.visibility("general-rate-limit"),
        },
        {
          name: "PublicChatIpRateLimit",
          priority: 40,
          action: { block: {} },
          statement: {
            rateBasedStatement: {
              limit: 100,
              aggregateKeyType: "IP",
              scopeDownStatement: {
                byteMatchStatement: {
                  fieldToMatch: { uriPath: {} },
                  positionalConstraint: "CONTAINS",
                  searchString: "/api/chat",
                  textTransformations: [{ priority: 0, type: "LOWERCASE" }],
                },
              },
            },
          },
          visibilityConfig: this.visibility("public-chat-rate-limit"),
        },
        {
          name: "BlockPublicAdminPaths",
          priority: 50,
          action: { block: {} },
          statement: {
            andStatement: {
              statements: [
                {
                  byteMatchStatement: {
                    fieldToMatch: {
                      // CloudFormation's nested SingleHeader schema uses an
                      // uppercase property name even though the CDK type is
                      // structurally permissive here.
                      singleHeader: { Name: "host" } as unknown as wafv2.CfnWebACL.SingleHeaderProperty,
                    },
                    positionalConstraint: "EXACTLY",
                    searchString: "bbw.incendiollc.com",
                    textTransformations: [{ priority: 0, type: "LOWERCASE" }],
                  },
                },
                {
                  orStatement: {
                    statements: ["/admin", "/management"].map((path) => ({
                      byteMatchStatement: {
                        fieldToMatch: { uriPath: {} },
                        positionalConstraint: "STARTS_WITH",
                        searchString: path,
                        textTransformations: [{ priority: 0, type: "LOWERCASE" }],
                      },
                    })),
                  },
                },
              ],
            },
          },
          visibilityConfig: this.visibility("public-admin-paths"),
        },
      ],
    });
    new wafv2.CfnLoggingConfiguration(this, `${id}Logging`, {
      resourceArn: webAcl.attrArn,
      logDestinationConfigs: [logGroup.logGroupArn],
    });
    return webAcl;
  }

  private managedRule(name: string, priority: number, ruleName: string): wafv2.CfnWebACL.RuleProperty {
    return {
      name,
      priority,
      overrideAction: { none: {} },
      statement: {
        managedRuleGroupStatement: { vendorName: "AWS", name: ruleName },
      },
      visibilityConfig: this.visibility(name),
    };
  }

  private visibility(metricName: string): wafv2.CfnWebACL.VisibilityConfigProperty {
    return {
      cloudWatchMetricsEnabled: true,
      metricName: metricName.replace(/[^A-Za-z0-9-_]/g, "-"),
      sampledRequestsEnabled: true,
    };
  }
}
