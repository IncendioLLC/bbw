import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { Stage1Email } from "./email.js";

describe("Stage 1 email", () => {
  it("creates a domain identity and monitored configuration set", () => {
    const stack = new Stack(new App(), "EmailTest");
    new Stage1Email(stack, "Email", "example.com");
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::SES::EmailIdentity", 1);
    template.resourceCountIs("AWS::SES::ConfigurationSet", 1);
    template.resourceCountIs("AWS::SNS::Topic", 1);
    template.resourceCountIs("AWS::SQS::Queue", 1);
  });

  it("can attach infrastructure to an already verified identity", () => {
    const stack = new Stack(new App(), "ExistingEmailTest");
    new Stage1Email(stack, "Email", "verified.example.com", true);
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::SES::EmailIdentity", 0);
    template.resourceCountIs("AWS::SES::ConfigurationSet", 1);
    template.resourceCountIs("AWS::SQS::Queue", 1);
  });
});
