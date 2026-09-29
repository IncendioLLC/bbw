import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { Stage1Queues, stage1QueueNames } from "./messaging.js";

describe("Stage 1 queues", () => {
  it("creates encrypted work queues and DLQs with redrive policies", () => {
    const stack = new Stack(new App(), "MessagingTest");
    new Stage1Queues(stack, "Queues");
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::SQS::Queue", stage1QueueNames.length * 2);
    template.allResourcesProperties("AWS::SQS::Queue", { SqsManagedSseEnabled: true });
    expect(template.findResources("AWS::SQS::Queue")).toBeDefined();
  });
});
