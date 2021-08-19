'use strict';

const AWS = require('aws-sdk');
const cf = new AWS.CloudFormation({
    region: process.env.AWS_DEFAULT_REGION
});

class Stack {
    async list() {
        let stacks = [];

        let partial = false;
        try {
             partial = await cf.listStacks({
                StackStatusFilter: [
                    'CREATE_IN_PROGRESS',
                    'CREATE_COMPLETE',
                    'ROLLBACK_IN_PROGRESS',
                    'ROLLBACK_FAILED',
                    'ROLLBACK_COMPLETE',
                    'DELETE_IN_PROGRESS',
                    'DELETE_FAILED',
                    'UPDATE_IN_PROGRESS',
                    'UPDATE_COMPLETE_CLEANUP_IN_PROGRESS',
                    'UPDATE_COMPLETE',
                    'UPDATE_ROLLBACK_IN_PROGRESS',
                    'UPDATE_ROLLBACK_FAILED',
                    'UPDATE_ROLLBACK_COMPLETE_CLEANUP_IN_PROGRESS',
                    'UPDATE_ROLLBACK_COMPLETE',
                    'REVIEW_IN_PROGRESS',
                    'IMPORT_IN_PROGRESS',
                    'IMPORT_COMPLETE',
                    'IMPORT_ROLLBACK_IN_PROGRESS',
                    'IMPORT_ROLLBACK_FAILED',
                    'IMPORT_ROLLBACK_COMPLETE',
                ]
            }).promise();

            stacks = stacks.concat(partial);

            while (partial.NextToken) {
                partial = await cf.listStacks({
                    NextToken: partial.NextToken
                }).promise();

                stacks = stacks.concat(partial);
            }

            return stacks;
        } catch (err) {
            throw new Err(500, err, 'Cannot list stacks');
        }
    }

    async generate(pid, iterationid, stack) {
        try {
            async cf.createStack({
                StackName=
                TemplateBody=
                Tags=stack.tags,
                Parameters=[{
                    ParameterKey: 'GitSha',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                },{
                    ParameterKey: 'StackName',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                },{
                    ParameterKey: 'ImageTag',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                },{
                    ParameterKey: 'Inferences',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                },{
                    ParameterKey: 'ModelId',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                },{
                    ParameterKey: 'PredictionId',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                },{
                    ParameterKey: 'ImageryId',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                },{
                    ParameterKey: 'MaxSize',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                },{
                    ParameterKey: 'MaxConcurrency',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                },{
                    ParameterKey: 'InfSupertile',
                    ParameterValue: CONFIG.EnvironmentConfig.GitSha,
                }],
                Capabilities=["CAPABILITY_NAMED_IAM"],
                OnFailure="ROLLBACK"
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to create stack');
        }
    }
}

module.exports = Stack;
