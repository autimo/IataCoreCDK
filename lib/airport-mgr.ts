import { Aws, Construct, Stack, StackProps } from "@aws-cdk/core";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { ManagedPolicy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";

interface AirportMgrStackProps extends StackProps {
  appName: string;
  stageName: string;
  code: Code;
  airportLiveDataTableArn: string;
  airportRunwayImageBucket: string;
}

export class AirportMgrStack extends Stack {
  constructor(scope: Stack, id: string, props: AirportMgrStackProps) {
    super(scope, id);

    const createAirportLambdaExecutionRole = new Role(
      this,
      `${props.appName}-CreateAirportLambda-ExecutionRole-${props.stageName}`,
      {
        roleName: `${props.appName}-CreateAirportLambda-ExecutionRole-${props.stageName}`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    const createAirportLambda = new Function(
      this,
      `${props.appName}-CreateAirportLambda`,
      {
        functionName: `${props.appName}-CreateAirportLambda`,
        role: createAirportLambdaExecutionRole,
        environment: {
          AIRORT_LIVE_TABLE_ARN: props.airportLiveDataTableArn,
          AIRPORT_RUNWAY_IMAGE_BUCKET: props.airportRunwayImageBucket,
        },
        code: props.code,
        handler: "src/create-airport/createAirport.handler",
        runtime: Runtime.NODEJS_14_X,
      }
    );

    const updateAirportLambdaExecutionRole = new Role(
      this,
      `${props.appName}-UpdateAirportLambda-ExecutionRole-${props.stageName}`,
      {
        roleName: `${props.appName}-UpdateAirportLambda-ExecutionRole-${props.stageName}`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    const updateAirportLambda = new Function(
      this,
      `${props.appName}-UpdateAirportLambda`,
      {
        functionName: `${props.appName}-UpdateAirportLambda`,
        role: updateAirportLambdaExecutionRole,
        environment: {
          AIRORT_LIVE_TABLE_ARN: props.airportLiveDataTableArn,
          AIRPORT_RUNWAY_IMAGE_BUCKET: props.airportRunwayImageBucket,
        },
        code: props.code,
        handler: "src/update-airport/updateAirport.handler",
        runtime: Runtime.NODEJS_14_X,
      }
    );

    const deleteAirportLambdaExecutionRole = new Role(
      this,
      `${props.appName}-DeleteAirportLambda-ExecutionRole-${props.stageName}`,
      {
        roleName: `${props.appName}-DeleteAirportLambda-ExecutionRole-${props.stageName}`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    const deleteAirportLambda = new Function(
      this,
      `${props.appName}-DeleteAirportLambda`,
      {
        functionName: `${props.appName}-DeleteAirportLambda`,
        role: deleteAirportLambdaExecutionRole,
        environment: {
          AIRORT_LIVE_TABLE_ARN: props.airportLiveDataTableArn,
          AIRPORT_RUNWAY_IMAGE_BUCKET: props.airportRunwayImageBucket,
        },
        code: props.code,
        handler: "src/delete-airport/deleteAirport.handler",
        runtime: Runtime.NODEJS_14_X,
      }
    );
  }
}
