import * as cdk from "aws-cdk-lib";
import * as ses from "aws-cdk-lib/aws-ses";
import * as sns from "aws-cdk-lib/aws-sns";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";
import { Construct } from "constructs";

export class Stage1Email extends Construct {
  public readonly configurationSet: ses.ConfigurationSet;

  public constructor(
    scope: Construct,
    id: string,
    domain = "example.invalid",
    useExistingIdentity = false,
  ) {
    super(scope, id);
    if (useExistingIdentity) {
      ses.EmailIdentity.fromEmailIdentityName(this, "DomainIdentity", domain);
    } else {
      new ses.EmailIdentity(this, "DomainIdentity", { identity: ses.Identity.domain(domain) });
    }
    this.configurationSet = new ses.ConfigurationSet(this, "ConfigurationSet", {
      configurationSetName: "bbw-stage1",
      reputationMetrics: true,
      sendingEnabled: true,
    });
    const eventsTopic = new sns.Topic(this, "EventsTopic", {
      topicName: "bbw-stage1-email-events",
    });
    const eventsQueue = new sqs.Queue(this, "EventsCaptureQueue", {
      queueName: "bbw-stage1-email-events-capture",
      encryption: sqs.QueueEncryption.SQS_MANAGED,
      retentionPeriod: cdk.Duration.days(1),
    });
    eventsTopic.addSubscription(new subscriptions.SqsSubscription(eventsQueue));
    this.configurationSet.addEventDestination("Events", {
      destination: ses.EventDestination.snsTopic(eventsTopic),
    });
  }
}
