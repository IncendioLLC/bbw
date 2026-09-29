import * as sqs from "aws-cdk-lib/aws-sqs";
import { Duration } from "aws-cdk-lib";
import { Construct } from "constructs";

export const stage1QueueNames = [
  "email",
  "news",
  "embeddings",
  "analytics",
  "retention",
  "scheduled",
] as const;

export class Stage1Queues extends Construct {
  public readonly queues: Record<(typeof stage1QueueNames)[number], sqs.Queue>;

  public constructor(scope: Construct, id: string) {
    super(scope, id);
    this.queues = Object.fromEntries(
      stage1QueueNames.map((name) => {
        const deadLetterQueue = new sqs.Queue(this, `${name}Dlq`, {
          queueName: `bbw-stage1-${name}-dlq`,
          encryption: sqs.QueueEncryption.SQS_MANAGED,
          retentionPeriod: Duration.days(14),
        });
        const queue = new sqs.Queue(this, name, {
          queueName: `bbw-stage1-${name}`,
          encryption: sqs.QueueEncryption.SQS_MANAGED,
          visibilityTimeout: Duration.seconds(60),
          retentionPeriod: Duration.days(4),
          deadLetterQueue: { queue: deadLetterQueue, maxReceiveCount: 3 },
        });
        return [name, queue];
      }),
    ) as Record<(typeof stage1QueueNames)[number], sqs.Queue>;
  }
}
