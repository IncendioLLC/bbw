import { Duration, RemovalPolicy } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export class Stage1Storage extends Construct {
  public readonly exportsBucket: s3.Bucket;
  public readonly assetsBucket: s3.Bucket;
  public readonly logsBucket: s3.Bucket;

  public constructor(scope: Construct, id: string) {
    super(scope, id);
    const common = {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      versioned: true,
      lifecycleRules: [{ expiration: Duration.days(365) }],
      removalPolicy: RemovalPolicy.RETAIN,
      autoDeleteObjects: false,
    };
    this.exportsBucket = new s3.Bucket(this, "Exports", common);
    this.assetsBucket = new s3.Bucket(this, "Assets", {
      ...common,
      lifecycleRules: [{ expiration: Duration.days(730) }],
    });
    this.logsBucket = new s3.Bucket(this, "Logs", {
      ...common,
      lifecycleRules: [{ expiration: Duration.days(90) }],
    });
  }
}
