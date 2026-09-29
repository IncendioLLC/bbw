import * as ses from "aws-cdk-lib/aws-ses";
import * as sns from "aws-cdk-lib/aws-sns";
import { Construct } from "constructs";

export class Stage1Email extends Construct {
  public readonly configurationSet: ses.ConfigurationSet;

  public constructor(scope: Construct, id: string, domain = "example.invalid") {
    super(scope, id);
    new ses.EmailIdentity(this, "DomainIdentity", { identity: ses.Identity.domain(domain) });
    this.configurationSet = new ses.ConfigurationSet(this, "ConfigurationSet", {
      configurationSetName: "bbw-stage1",
      reputationMetrics: true,
      sendingEnabled: true,
    });
    const eventsTopic = new sns.Topic(this, "EventsTopic", {
      topicName: "bbw-stage1-email-events",
    });
    this.configurationSet.addEventDestination("Events", {
      destination: ses.EventDestination.snsTopic(eventsTopic),
    });
  }
}
