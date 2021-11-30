import { Construct, Stack, StackProps } from "@aws-cdk/core";
import { SimpleDatabase } from "./constructs/simple-database";
import { SimpleBucket } from "./constructs/simple-bucket";

interface AirportDataStackProps extends StackProps {
  appName: string;
  stageName: string;
  region: string;
}

export class AirportDataStack extends Stack {
  readonly liveDataSimpleDatabase: SimpleDatabase;
  readonly runwayImages: SimpleBucket;

  constructor(scope: Stack, id: string, props: AirportDataStackProps) {
    super(scope, id);

    this.liveDataSimpleDatabase = new SimpleDatabase(
      this,
      `${props.appName}-LiveData-${props.stageName}`,
      {
        tableNamePrefix: `${props.appName}-LiveData`,
        tableRegion: `${props.region}`,
        stageName: `${props.stageName}`,
        partitionKey: "iata-code",
        readCapacity: 5,
        writeCapacity: 5,
      }
    );

    this.runwayImages = new SimpleBucket(
      this,
      `${props.appName}-${props.region}-${props.stageName}-s3-bucket`,
      {
        bucketNamePrefix: `${props.appName}-RunwayImages`,
        stageName: `${props.stageName}`,
        region: `${props.region}`,
      }
    );
  }
}
