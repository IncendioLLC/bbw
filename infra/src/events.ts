import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";

export class Stage1Events extends Construct {
  public readonly bus: events.EventBus;

  public constructor(scope: Construct, id: string, scheduledQueue: sqs.IQueue) {
    super(scope, id);
    this.bus = new events.EventBus(this, "Bus", { eventBusName: "bbw-stage1-domain" });
    new events.Rule(this, "ExpirySchedule", {
      schedule: events.Schedule.rate(Duration.hours(1)),
      targets: [new targets.SqsQueue(scheduledQueue)],
    });
    new events.Rule(this, "CleanupSchedule", {
      schedule: events.Schedule.rate(Duration.days(1)),
      targets: [new targets.SqsQueue(scheduledQueue)],
    });
  }
}
