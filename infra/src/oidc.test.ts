import { App, Stack } from "aws-cdk-lib";
import { Template } from "aws-cdk-lib/assertions";
import { describe, it } from "vitest";
import { Stage1GithubActionsRole } from "./oidc.js";

describe("Stage 1 deployment OIDC", () => {
  it("restricts trust to the repository Stage 1 environment", { timeout: 30_000 }, () => {
    const stack = new Stack(new App(), "OidcTest");
    new Stage1GithubActionsRole(stack, "Oidc", "example/platform");
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::IAM::Role", 2);
    template.hasResourceProperties("AWS::IAM::Role", {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Condition: {
              StringLike: {
                "token.actions.githubusercontent.com:sub":
                  "repo:example/platform:environment:stage1",
              },
            },
          },
        ],
      },
    });
  });

  it("supports GitHub immutable repository subjects", { timeout: 30_000 }, () => {
    const stack = new Stack(new App(), "ImmutableOidcTest");
    new Stage1GithubActionsRole(
      stack,
      "Oidc",
      "IncendioLLC/bbw",
      "repo:IncendioLLC@335236855/bbw@1393936250",
    );
    const template = Template.fromStack(stack);
    template.hasResourceProperties("AWS::IAM::Role", {
      AssumeRolePolicyDocument: {
        Statement: [
          {
            Condition: {
              StringLike: {
                "token.actions.githubusercontent.com:sub": [
                  "repo:IncendioLLC/bbw:environment:stage1",
                  "repo:IncendioLLC@335236855/bbw@1393936250:environment:stage1",
                ],
              },
            },
          },
        ],
      },
    });
  });
});
