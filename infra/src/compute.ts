import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export class Stage1Compute extends Construct {
  public readonly cluster: ecs.Cluster;
  public readonly executionRole: iam.Role;
  public readonly taskRole: iam.Role;

  public constructor(scope: Construct, id: string, vpc: import("aws-cdk-lib/aws-ec2").Vpc) {
    super(scope, id);
    this.cluster = new ecs.Cluster(this, "Cluster", {
      vpc: vpc as unknown as import("aws-cdk-lib/aws-ec2").IVpc,
      containerInsights: true,
      clusterName: "bbw-stage1",
    });
    this.executionRole = new iam.Role(this, "ExecutionRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName("service-role/AmazonECSTaskExecutionRolePolicy"),
      ],
      inlinePolicies: {
        ReadDatabaseSecret: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["secretsmanager:GetSecretValue"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });
    this.taskRole = new iam.Role(this, "TaskRole", {
      assumedBy: new iam.ServicePrincipal("ecs-tasks.amazonaws.com"),
      inlinePolicies: {
        ReadRuntimeConfig: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              actions: ["ssm:GetParameters", "secretsmanager:GetSecretValue"],
              resources: ["*"],
            }),
          ],
        }),
      },
    });
  }
}
