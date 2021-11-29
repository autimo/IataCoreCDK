import * as cdk from '@aws-cdk/core';
import * as codePipeline from "@aws-cdk/aws-codepipeline";
import * as codeBuild from "@aws-cdk/aws-codebuild";
import * as codePipelineActions from "@aws-cdk/aws-codepipeline-actions";

export class IataCoreCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const appName: string = 'IataCore'

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
    const corePipelineSourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: `${appName}CDK-GitHub`,
      owner: "unoah",
      repo: `${appName}CDK`,
      branch: "main",
      oauthToken: cdk.SecretValue.secretsManager("github-token"),
      output: corePipelineSourceArtifacts,
      trigger: codePipelineActions.GitHubTrigger.WEBHOOK,
    });

    const airportMgrSourceArtifacts = new codePipeline.Artifact();
    const airportMgrSourceAction = new codePipelineActions.GitHubSourceAction({
      actionName: `${appName}AirportMgr-GitHub`,
      owner: "unoah",
      repo: "IataAirportMgr",
      branch: "main",
      oauthToken: cdk.SecretValue.secretsManager("github-token"),
      output: airportMgrSourceArtifacts,
      trigger: codePipelineActions.GitHubTrigger.WEBHOOK,
    })

    /* Pipeline Source Stage */
    corePipeline.addStage({
      stageName: "Source",
      actions: [
        corePipelineSourceAction,
        airportMgrSourceAction
      ],
    });

    /* Pipeline Build Stage Actions */
    // Pipeline build action
    const corePipelineBuildOutput = new codePipeline.Artifact("CorePipelineBuildArtifact");
    const corePipelineBuildAction = new codePipelineActions.CodeBuildAction({
      actionName: `${appName}CDK-CodeBuild`,
      project: new codeBuild.PipelineProject(this, `${appName}CDK-PipelineProject`, {
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
                "ls -Al cdk.out/"
              ],
            },
          },
          artifacts: {
            "base-directory": "cdk.out",
            "files": "**/*"
          },
        }),
      }),
      input: corePipelineSourceArtifacts,
      outputs: [corePipelineBuildOutput]
    });

    // AirportMgr build action
    const airportMgrBuildOutput = new codePipeline.Artifact("AirportMgrBuildArtifact");
    const airportMgrBuildAction = new codePipelineActions.CodeBuildAction({
      actionName: `${appName}AirportMgr-CodeBuild`,
      project: new codeBuild.PipelineProject(this, `${appName}AirportMgr-PipelineProject`, {
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
            "files": "**/*"
          },
        }),
      }),
      input: airportMgrSourceArtifacts,
      outputs: [airportMgrBuildOutput]
    });

    /* Pipeline Build Stage */
    corePipeline.addStage({
      stageName: "Build",
      actions: [
        corePipelineBuildAction,
        airportMgrBuildAction
      ],
    });
  }
}
