import { Aws, Construct, Stack, StackProps } from "@aws-cdk/core";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { ManagedPolicy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";

interface AirportMgrStackProps extends StackProps {
  appName: string;
  stageName: string;
  code: Code;
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
        code: props.code,
        handler: "src/create-airport/createAirport.handler",
        runtime: Runtime.NODEJS_12_X,
      }
    );
  }
}
