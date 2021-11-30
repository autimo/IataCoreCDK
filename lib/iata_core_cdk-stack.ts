import * as cdk from "@aws-cdk/core";
import * as codePipeline from "@aws-cdk/aws-codepipeline";
import * as codeBuild from "@aws-cdk/aws-codebuild";
import * as codePipelineActions from "@aws-cdk/aws-codepipeline-actions";
import * as lambda from "@aws-cdk/aws-lambda";
import { AirportMgrStack } from "./airport-mgr";
import { AirportDataStack } from "./airport-data";

export class IataCoreCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appName = "IataCore";

    // The code that defines your stack goes here
    const corePipeline = new codePipeline.Pipeline(
      this,
      `${appName}-Pipeline`,
      {
        pipelineName: `${appName}-Pipeline`,
        restartExecutionOnUpdate: true,
        crossAccountKeys: true,
      }
    );
    const corePipelineSourceArtifacts = new codePipeline.Artifact();

    /* Pipeline Source Stage Actions */
    // Pipeline source action
    const corePipelineSourceAction = new codePipelineActions.GitHubSourceAction(
      {
        actionName: `${appName}CDK-GitHub`,
        owner: "unoah",
        repo: `${appName}CDK`,
        branch: "main",
        oauthToken: cdk.SecretValue.secretsManager("github-token"),
        output: corePipelineSourceArtifacts,
        trigger: codePipelineActions.GitHubTrigger.WEBHOOK,
      }
    );

    const airportMgrSourceArtifacts = new codePipeline.Artifact();
    const airportMgrSourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: `${appName}AirportMgr-GitHub`,
      owner: "unoah",
      repo: "IataAirportMgr",
      branch: "main",
      oauthToken: cdk.SecretValue.secretsManager("github-token"),
      output: airportMgrSourceArtifacts,
      trigger: codePipelineActions.GitHubTrigger.WEBHOOK,
    });

    const airlineMgrSourceArtifacts = new codePipeline.Artifact();
    const airlineMgrSourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: `${appName}AirlineMgr-GitHub`,
      owner: "unoah",
      repo: "IataAirlineMgr",
      branch: "main",
      oauthToken: cdk.SecretValue.secretsManager("github-token"),
      output: airlineMgrSourceArtifacts,
      trigger: codePipelineActions.GitHubTrigger.WEBHOOK,
    });

    /* Pipeline Source Stage */
    corePipeline.addStage({
      stageName: "Source",
      actions: [
        corePipelineSourceAction,
        airportMgrSourceAction,
        airlineMgrSourceAction,
      ],
    });

    /* Pipeline Build Stage Actions */
    // Pipeline build action
    const corePipelineBuildOutput = new codePipeline.Artifact(
      "CorePipelineBuildArtifact"
    );
    const corePipelineBuildAction = new codePipelineActions.CodeBuildAction({
      actionName: `${appName}CDK-CodeBuild`,
      project: new codeBuild.PipelineProject(
        this,
        `${appName}CDK-PipelineProject`,
        {
          projectName: `${appName}CDK-PipelineProject`,
          buildSpec: codeBuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
              install: {
                "runtime-versions": {
                  nodejs: 14,
                },
                commands: ["npm ci"],
              },
              build: {
                commands: [
                  "ls -Al",
                  "npm run build",
                  "npm run cdk synth",
                  "ls -Al",
                  "ls -Al cdk.out/",
                ],
              },
            },
            artifacts: {
              "base-directory": "cdk.out",
              files: "**/*",
            },
          }),
        }
      ),
      input: corePipelineSourceArtifacts,
      outputs: [corePipelineBuildOutput],
    });

    // AirportMgr build action
    const airportMgrBuildOutput = new codePipeline.Artifact(
      "AirportMgrBuildArtifact"
    );
    const airportMgrBuildAction = new codePipelineActions.CodeBuildAction({
      actionName: `${appName}AirportMgr-CodeBuild`,
      project: new codeBuild.PipelineProject(
        this,
        `${appName}AirportMgr-PipelineProject`,
        {
          projectName: `${appName}AirportMgr-PipelineProject`,
          buildSpec: codeBuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
              install: {
                "runtime-versions": {
                  nodejs: 14,
                },
                commands: ["npm ci"],
              },
              build: {
                commands: ["npm run build", "ls -Al"],
              },
            },
            artifacts: {
              files: "**/*",
            },
          }),
        }
      ),
      input: airportMgrSourceArtifacts,
      outputs: [airportMgrBuildOutput],
    });

    // AirlineMgr build action
    const airlineMgrBuildOutput = new codePipeline.Artifact(
      "AirlineMgrBuildArtifact"
    );
    const airlineMgrBuildAction = new codePipelineActions.CodeBuildAction({
      actionName: `${appName}AirlineMgr-CodeBuild`,
      project: new codeBuild.PipelineProject(
        this,
        `${appName}AirlineMgr-PipelineProject`,
        {
          projectName: `${appName}AirlineMgr-PipelineProject`,
          buildSpec: codeBuild.BuildSpec.fromObject({
            version: "0.2",
            phases: {
              install: {
                "runtime-versions": {
                  nodejs: 14,
                },
                commands: ["npm ci"],
              },
              build: {
                commands: ["npm run build", "ls -Al"],
              },
            },
            artifacts: {
              files: "**/*",
            },
          }),
        }
      ),
      input: airlineMgrSourceArtifacts,
      outputs: [airlineMgrBuildOutput],
    });

    /* Pipeline Build Stage */
    corePipeline.addStage({
      stageName: "Build",
      actions: [
        corePipelineBuildAction,
        airportMgrBuildAction,
        airlineMgrBuildAction,
      ],
    });

    const airportDataStack = new AirportDataStack(
      this,
      `${appName}-AirportData`,
      {
        appName: `${appName}`,
        stageName: "beta",
        region: `us-east-1`,
      }
    );

    const airportMgrLambdaCode = lambda.Code.fromCfnParameters();
    const airportMgrStack = new AirportMgrStack(this, `${appName}-AirportMgr`, {
      appName: `${appName}`,
      stageName: "beta",
      code: airportMgrLambdaCode,
      airportLiveDataTableArn:
        airportDataStack.liveDataSimpleDatabase.simpleDatabaseTable.tableArn,
      airportRunwayImageBucket:
        airportDataStack.runwayImages.simpleBucket.bucketName,
    });
    airportMgrStack.addDependency(airportDataStack);

    corePipeline.addStage({
      stageName: "beta",
      actions: [
        new codePipelineActions.CloudFormationCreateUpdateStackAction({
          actionName: `${appName}-AirportData`,
          templatePath: corePipelineBuildOutput.atPath(
            `${airportDataStack.artifactId}.template.json`
          ),
          stackName: `${appName}-AirportData`,
          adminPermissions: true,
        }),
        new codePipelineActions.CloudFormationCreateUpdateStackAction({
          actionName: `${appName}-AirportMgr`,
          templatePath: corePipelineBuildOutput.atPath(
            `${airportMgrStack.artifactId}.template.json`
          ),
          stackName: `${appName}-AirportMgr`,
          adminPermissions: true,
          parameterOverrides: airportMgrLambdaCode.assign(
            airportMgrBuildOutput.s3Location
          ),
          extraInputs: [airportMgrBuildOutput],
        }),
      ],
    });
  }
}
