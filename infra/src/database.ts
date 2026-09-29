import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";

export const stage1DatabaseProfile = {
  engine: "postgres17",
  encrypted: true,
  publiclyAccessible: false,
  backupRetentionDays: 7,
  futureAccountIsolation: true,
} as const;

export class Stage1Database extends Construct {
  public readonly instance: rds.DatabaseInstance;

  public constructor(scope: Construct, id: string, vpc: ec2.Vpc, securityGroup: ec2.SecurityGroup) {
    super(scope, id);
    this.instance = new rds.DatabaseInstance(this, "Postgres", {
      engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_17 }),
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.MICRO),
      vpc: vpc as unknown as ec2.IVpc,
      vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
      securityGroups: [securityGroup],
      multiAz: true,
      allocatedStorage: 100,
      maxAllocatedStorage: 200,
      storageEncrypted: true,
      backupRetention: Duration.days(7),
      deletionProtection: true,
      deleteAutomatedBackups: false,
      publiclyAccessible: false,
      credentials: rds.Credentials.fromGeneratedSecret("bbw_admin"),
      removalPolicy: RemovalPolicy.RETAIN,
    });
  }
}
