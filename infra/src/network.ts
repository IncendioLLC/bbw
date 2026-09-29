import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export const stage1NetworkProfile = {
  maxAzs: 2,
  natGateways: 2,
  isolatedDatabaseTier: true,
  futureAccountIsolation: true,
} as const;

export class Stage1Network extends Construct {
  public readonly vpc: ec2.Vpc;

  public constructor(scope: Construct, id: string) {
    super(scope, id);
    this.vpc = new ec2.Vpc(this, "Vpc", {
      vpcName: "bbw-stage1-vpc",
      maxAzs: stage1NetworkProfile.maxAzs,
      natGateways: stage1NetworkProfile.natGateways,
      subnetConfiguration: [
        { name: "public", subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
        { name: "application", subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 20 },
        { name: "database", subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
      ],
    });
    this.vpc.addGatewayEndpoint("S3", { service: ec2.GatewayVpcEndpointAwsService.S3 });
    this.vpc.addGatewayEndpoint("DynamoDb", { service: ec2.GatewayVpcEndpointAwsService.DYNAMODB });
    for (const [id, service] of [
      ["Ecr", ec2.InterfaceVpcEndpointAwsService.ECR],
      ["EcrDocker", ec2.InterfaceVpcEndpointAwsService.ECR_DOCKER],
      ["Logs", ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS],
    ] as const) {
      this.vpc.addInterfaceEndpoint(id, { service, privateDnsEnabled: true });
    }
  }
}
