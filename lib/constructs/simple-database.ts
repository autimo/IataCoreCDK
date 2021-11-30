import { Construct, StackProps } from "@aws-cdk/core";
import { Table, AttributeType, BillingMode } from "@aws-cdk/aws-dynamodb";

interface SimpleDatabaseProps extends StackProps {
  tableNamePrefix: string;
  tableRegion: string;
  stageName: string;
  partitionKey: string;
  readCapacity: number;
  writeCapacity: number;
}

export class SimpleDatabase extends Construct {
  constructor(scope: Construct, id: string, props: SimpleDatabaseProps) {
    super(scope, id);

    const simpleDatabaseTable = new Table(
      this,
      `${props.tableNamePrefix}-${props.stageName}-dynamodb`,
      {
        tableName: `${props.tableNamePrefix}-${props.stageName}`,
        partitionKey: {
          name: `${props.partitionKey}`,
          type: AttributeType.STRING,
        },
        billingMode: BillingMode.PROVISIONED,
        readCapacity: props.readCapacity,
        writeCapacity: props.writeCapacity,
      }
    );
  }
}
