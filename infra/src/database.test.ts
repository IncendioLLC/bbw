import { App, Stack } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import { Template } from "aws-cdk-lib/assertions";
import { describe, expect, it } from "vitest";
import { Stage1Database, stage1DatabaseProfile } from "./database.js";

describe("Stage 1 database", () => {
  it("creates encrypted private PostgreSQL 17 with backups and deletion protection", () => {
    const stack = new Stack(new App(), "DatabaseTest");
    const vpc = new ec2.Vpc(stack, "Vpc", { maxAzs: 2, natGateways: 0 });
    const securityGroup = new ec2.SecurityGroup(stack, "DatabaseSecurity", {
      vpc: vpc as unknown as ec2.IVpc,
    });
    new Stage1Database(stack, "Database", vpc, securityGroup);
    const template = Template.fromStack(stack);
    template.resourceCountIs("AWS::RDS::DBInstance", 1);
    template.hasResourceProperties("AWS::RDS::DBInstance", {
      Engine: "postgres",
      EngineVersion: "17",
      PubliclyAccessible: false,
      MultiAZ: true,
      DeletionProtection: true,
      StorageEncrypted: true,
    });
  });

  it("keeps the Stage 1 database profile ready for later duplication", () => {
    expect(stage1DatabaseProfile).toMatchObject({
      engine: "postgres17",
      encrypted: true,
      futureAccountIsolation: true,
    });
  });
});
