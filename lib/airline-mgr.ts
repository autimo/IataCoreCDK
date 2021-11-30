import { Aws, Construct, Stack, StackProps } from "@aws-cdk/core";
import { Code, Function, Runtime } from "@aws-cdk/aws-lambda";
import { ManagedPolicy, Role, ServicePrincipal } from "@aws-cdk/aws-iam";

interface AirlineMgrStackProps extends StackProps {
  appName: string;
  stageName: string;
  code: Code;
}

export class AirlineMgrStack extends Stack {
  constructor(scope: Stack, id: string, props: AirlineMgrStackProps) {
    super(scope, id);

    const createAirlineLambdaExecutionRole = new Role(
      this,
      `${props.appName}-CreateAirlineLambda-ExecutionRole-${props.stageName}`,
      {
        roleName: `${props.appName}-CreateAirlineLambda-ExecutionRole-${props.stageName}`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    const createAirlineLambda = new Function(
      this,
      `${props.appName}-CreateAirlineLambda`,
      {
        functionName: `${props.appName}-CreateAirlineLambda`,
        role: createAirlineLambdaExecutionRole,
        code: props.code,
        handler: "src/create-airline/createAirline.handler",
        runtime: Runtime.NODEJS_14_X,
      }
    );

    const mergeAirlineLambdaExecutionRole = new Role(
      this,
      `${props.appName}-MergeAirlineLambda-ExecutionRole-${props.stageName}`,
      {
        roleName: `${props.appName}-MergeAirlineLambda-ExecutionRole-${props.stageName}`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    const mergeAirlineLambda = new Function(
      this,
      `${props.appName}-MergeAirlineLambda`,
      {
        functionName: `${props.appName}-MergeAirlineLambda`,
        role: mergeAirlineLambdaExecutionRole,
        code: props.code,
        handler: "src/merge-airline/mergeAirline.handler",
        runtime: Runtime.NODEJS_14_X,
      }
    );

    const updateAirlineLambdaExecutionRole = new Role(
      this,
      `${props.appName}-UpdateAirlineLambda-ExecutionRole-${props.stageName}`,
      {
        roleName: `${props.appName}-UpdateAirlineLambda-ExecutionRole-${props.stageName}`,
        assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
        managedPolicies: [
          ManagedPolicy.fromAwsManagedPolicyName(
            "service-role/AWSLambdaBasicExecutionRole"
          ),
        ],
      }
    );

    const updateAirlineLambda = new Function(
      this,
      `${props.appName}-UpdateAirlineLambda`,
      {
        functionName: `${props.appName}-UpdateAirlineLambda`,
        role: updateAirlineLambdaExecutionRole,
        code: props.code,
        handler: "src/update-airline/updateAirline.handler",
        runtime: Runtime.NODEJS_14_X,
      }
    );
  }
}
