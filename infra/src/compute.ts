import * as ecs from "aws-cdk-lib/aws-ecs";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as logs from "aws-cdk-lib/aws-logs";
import * as ecrAssets from "aws-cdk-lib/aws-ecr-assets";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { Construct } from "constructs";

export class Stage1Compute extends Construct {
  public readonly cluster: ecs.Cluster;
  public readonly executionRole: iam.Role;
  public readonly taskRole: iam.Role;
  public readonly publicService?: ecs.FargateService;
  public readonly apiService?: ecs.FargateService;
  public readonly managementService?: ecs.FargateService;

  public constructor(
    scope: Construct,
    id: string,
    vpc: ec2.Vpc,
    ecsSecurityGroup?: ec2.SecurityGroup,
    servicesEnabled = false,
    databaseSecret?: secretsmanager.ISecret,
    workerQueue?: sqs.IQueue,
  ) {
    super(scope, id);
    this.cluster = new ecs.Cluster(this, "Cluster", {
      vpc: vpc as unknown as ec2.IVpc,
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
    if (servicesEnabled && ecsSecurityGroup) {
      this.publicService = this.createService("Public", "bbw-stage1-public", ecsSecurityGroup, vpc, true);
      this.apiService = this.createService("Api", "bbw-stage1-api", ecsSecurityGroup, vpc, true, databaseSecret);
      this.managementService = this.createService("Management", "bbw-stage1-management", ecsSecurityGroup, vpc, true);
      this.createService("Worker", "bbw-stage1-worker", ecsSecurityGroup, vpc, false, undefined, workerQueue);
    }
  }

  private createService(
    id: string,
    serviceName: string,
    securityGroup: ec2.SecurityGroup,
    vpc: ec2.Vpc,
    exposesHttp: boolean,
    databaseSecret?: secretsmanager.ISecret,
    workerQueue?: sqs.IQueue,
  ): ecs.FargateService {
    const logsGroup = new logs.LogGroup(this, `${id}Logs`, {
      logGroupName: `/aws/ecs/${serviceName}`,
      retention: logs.RetentionDays.ONE_WEEK,
    });
    const taskDefinition = new ecs.FargateTaskDefinition(this, `${id}Task`, {
      cpu: 256,
      memoryLimitMiB: 512,
      executionRole: this.executionRole,
      taskRole: this.taskRole,
    });
    const runtimeImage = id === "Api" || id === "Worker"
      ? new ecrAssets.DockerImageAsset(this, `${id}Image`, {
          directory: path.resolve(
            path.dirname(fileURLToPath(import.meta.url)),
            `../../apps/${id === "Api" ? "api" : "worker"}`,
          ),
        })
      : undefined;
    const container = taskDefinition.addContainer(`${id}Container`, {
      image: runtimeImage
        ? ecs.ContainerImage.fromDockerImageAsset(runtimeImage)
        : ecs.ContainerImage.fromRegistry("public.ecr.aws/docker/library/nginx:1.27-alpine"),
      ...(id === "Api" ? { environment: { NODE_ENV: "production", PORT: "3000" } } : {}),
      ...(id === "Worker" && workerQueue ? { environment: { NODE_ENV: "production", JOB_QUEUE_URL: workerQueue.queueUrl } } : {}),
      ...(id === "Api" && databaseSecret
        ? { secrets: { DATABASE_SECRET: ecs.Secret.fromSecretsManager(databaseSecret) } }
        : {}),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: serviceName, logGroup: logsGroup }),
      essential: true,
      healthCheck: exposesHttp
        ? {
            command: [
              "CMD-SHELL",
              `wget -q -O - http://localhost:${id === "Api" ? 3000 : 80}/${id === "Api" ? "readyz" : ""} || exit 1`,
            ],
          }
        : { command: ["CMD-SHELL", "node -e \"process.exit(0)\" || exit 1"] },
    });
    if (id === "Worker" && workerQueue) {
      this.taskRole.addToPrincipalPolicy(
        new iam.PolicyStatement({
          actions: ["sqs:ReceiveMessage", "sqs:DeleteMessage", "sqs:ChangeMessageVisibility", "sqs:GetQueueAttributes"],
          resources: [workerQueue.queueArn],
        }),
      );
    }
    if (exposesHttp) container.addPortMappings({ containerPort: id === "Api" ? 3000 : 80 });
    const service = new ecs.FargateService(this, `${id}Service`, {
      serviceName,
      cluster: this.cluster as unknown as ecs.ICluster,
      taskDefinition,
      desiredCount: 1,
      assignPublicIp: false,
      securityGroups: [securityGroup],
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
      enableExecuteCommand: false,
      circuitBreaker: { rollback: true },
    });
    service.node.addDependency(taskDefinition);
    return service;
  }
}
