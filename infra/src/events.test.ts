import { App, Stack } from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { Stage1Events } from "./events.js";

describe("Stage 1 events", () => {
  it("creates a governed bus and retryable schedules", () => {
    const stack = new Stack(new App(), "EventsTest");
    const queue = new sqs.Queue(stack, "Scheduled");
    new Stage1Events(stack, "Events", queue);
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::Events::EventBus", 1);
    template.resourceCountIs("AWS::Events::Rule", 2);
    template.hasResourceProperties("AWS::Events::Rule", { State: "ENABLED" });
  });
});
