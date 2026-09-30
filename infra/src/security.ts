import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export class Stage1SecurityGroups extends Construct {
  public readonly alb: ec2.SecurityGroup;
  public readonly ecs: ec2.SecurityGroup;
  public readonly database: ec2.SecurityGroup;
  public readonly endpoints: ec2.SecurityGroup;

  public constructor(scope: Construct, id: string, vpc: ec2.Vpc) {
    super(scope, id);
    const subnetVpc = vpc as unknown as ec2.IVpc;
    this.alb = new ec2.SecurityGroup(this, "Alb", { vpc: subnetVpc, allowAllOutbound: false });
    this.alb.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), "HTTPS ingress");
    this.alb.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), "HTTP redirect ingress");
    this.ecs = new ec2.SecurityGroup(this, "Ecs", { vpc: subnetVpc, allowAllOutbound: true });
    this.alb.addEgressRule(this.ecs, ec2.Port.tcp(80), "ALB to HTTP application targets");
    this.alb.addEgressRule(this.ecs, ec2.Port.tcp(3000), "ALB to API targets");
    this.ecs.addIngressRule(this.alb, ec2.Port.tcp(80), "ALB to HTTP application targets");
    this.ecs.addIngressRule(this.alb, ec2.Port.tcp(3000), "ALB to application");
    this.database = new ec2.SecurityGroup(this, "Database", { vpc: subnetVpc, allowAllOutbound: false });
    this.database.addIngressRule(this.ecs, ec2.Port.tcp(5432), "ECS to PostgreSQL");
    this.endpoints = new ec2.SecurityGroup(this, "Endpoints", { vpc: subnetVpc, allowAllOutbound: false });
    this.endpoints.addIngressRule(this.ecs, ec2.Port.tcp(443), "ECS to VPC endpoints");
  }
}
