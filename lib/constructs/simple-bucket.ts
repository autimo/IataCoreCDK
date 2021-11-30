import { Aws, Construct } from "@aws-cdk/core";
import { BlockPublicAccess, Bucket } from "@aws-cdk/aws-s3";

interface SimpleBucketProps {
  bucketNamePrefix: string;
  stageName: string;
  region: string;
}

export class SimpleBucket extends Construct {
  readonly simpleBucket: Bucket; // can be made more specific

  constructor(scope: Construct, id: string, props: SimpleBucketProps) {
    super(scope, id);

    this.simpleBucket = new Bucket(
      this,
      `${props.bucketNamePrefix}-${props.region}-${props.stageName}-s3-bucket`,
      {
        versioned: true,
        bucketName:
          `${props.bucketNamePrefix.toLowerCase()}-${props.stageName.toLowerCase()}-` +
          `${Aws.ACCOUNT_ID}-${props.region.toLowerCase()}`,
        publicReadAccess: false,
        enforceSSL: true,
        // Explicitly denies access to HTTP requests
        blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      }
    );
  }
}
