import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as elbv2 from "aws-cdk-lib/aws-elasticloadbalancingv2";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Construct } from "constructs";

export interface Stage1EdgeProps {
  readonly vpc: ec2.Vpc;
  readonly albSecurityGroup: ec2.SecurityGroup;
  readonly publicService: ecs.FargateService;
  readonly apiService: ecs.FargateService;
  readonly managementService: ecs.FargateService;
  readonly certificateArn: string;
  readonly adminHostname?: string;
  readonly publicHostname?: string;
  /** Additional public alias used by the CloudFront member distribution. */
  readonly publicCloudFrontHostname?: string;
  readonly apiHostname?: string;
}

/** Shared HTTPS edge with explicit host isolation for the management service. */
export class Stage1Edge extends Construct {
  public readonly loadBalancer: elbv2.ApplicationLoadBalancer;
  public readonly httpsListener: elbv2.ApplicationListener;

  public constructor(scope: Construct, id: string, props: Stage1EdgeProps) {
    super(scope, id);
    this.loadBalancer = new elbv2.ApplicationLoadBalancer(this, "Alb", {
      vpc: props.vpc as unknown as ec2.IVpc,
      internetFacing: true,
      securityGroup: props.albSecurityGroup,
      loadBalancerName: "bbw-stage1-edge",
    });
    const certificate = acm.Certificate.fromCertificateArn(this, "Certificate", props.certificateArn);
    this.httpsListener = this.loadBalancer.addListener("Https", {
      port: 443,
      certificates: [certificate],
      defaultAction: elbv2.ListenerAction.fixedResponse(404, {
        contentType: "text/plain",
        messageBody: "Not found",
      }),
    });
    this.loadBalancer.addListener("Http", {
      port: 80,
      defaultAction: elbv2.ListenerAction.redirect({ protocol: "HTTPS", port: "443", permanent: true }),
    });

    const management = new elbv2.ApplicationTargetGroup(this, "ManagementTargets", {
      vpc: props.vpc as unknown as ec2.IVpc,
      port: 80,
      targetType: elbv2.TargetType.IP,
      targets: [props.managementService.loadBalancerTarget({ containerName: "ManagementContainer", containerPort: 80 })],
      healthCheck: { path: "/", healthyHttpCodes: "200-399" },
    });
    this.httpsListener.addAction("ManagementHost", {
      priority: 10,
      conditions: [elbv2.ListenerCondition.hostHeaders([props.adminHostname ?? "admin.bbw.incendiollc.com"])],
      action: elbv2.ListenerAction.forward([management]),
    });

    const publicTargets = new elbv2.ApplicationTargetGroup(this, "PublicTargets", {
      vpc: props.vpc as unknown as ec2.IVpc,
      port: 80,
      targetType: elbv2.TargetType.IP,
      targets: [props.publicService.loadBalancerTarget({ containerName: "PublicContainer", containerPort: 80 })],
      healthCheck: { path: "/", healthyHttpCodes: "200-399" },
    });
    const publicHostname = props.publicHostname ?? "bbw.incendiollc.com";
    const publicHostnames = [publicHostname, props.publicCloudFrontHostname].filter(
      (hostname): hostname is string => Boolean(hostname && hostname !== publicHostname),
    );
    if (publicHostname) {
      this.httpsListener.addAction("PublicHost", {
        priority: 20,
        conditions: [elbv2.ListenerCondition.hostHeaders([publicHostname, ...publicHostnames])],
        action: elbv2.ListenerAction.forward([publicTargets]),
      });
    }

    const apiTargets = new elbv2.ApplicationTargetGroup(this, "ApiTargets", {
      vpc: props.vpc as unknown as ec2.IVpc,
      port: 3000,
      targetType: elbv2.TargetType.IP,
      protocol: elbv2.ApplicationProtocol.HTTP,
      targets: [props.apiService.loadBalancerTarget({ containerName: "ApiContainer", containerPort: 3000 })],
      healthCheck: { path: "/readyz", healthyHttpCodes: "200" },
    });
    const apiHostname = props.apiHostname ?? "api.bbw.incendiollc.com";
    if (apiHostname) {
      this.httpsListener.addAction("ApiHost", {
        priority: 30,
        conditions: [elbv2.ListenerCondition.hostHeaders([apiHostname])],
        action: elbv2.ListenerAction.forward([apiTargets]),
      });
    }
  }
}
