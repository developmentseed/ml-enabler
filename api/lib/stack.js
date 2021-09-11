'use strict';

const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const Err = require('./error');
const cf = new AWS.CloudFormation({
    region: process.env.AWS_DEFAULT_REGION
});

class Stack {
    static async list() {
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
                    'IMPORT_ROLLBACK_COMPLETE'
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

    static async from(pid, iterationid) {
        const stack_name = `${process.env.StackName}-project-${pid}-iteration-${iterationid}`;

        let stack;
        try {
            stack = await cf.describeStacks({
                StackName: stack_name
            }).promise();
        } catch (err) {
            if (err.statusCode === 400) {
                return {
                    id: 'none',
                    name: stack,
                    status: 'None'
                };
            } else {
                throw new Err(500, err, 'Could not describe stacks');
            }
        }

        return {
            id: stack.Stacks[0].StackId,
            name: stack,
            status: stack.Stacks[0].StackStatus
        };
    }

    static async generate(pid, iterationid, options) {
        try {
            const image = `project-${pid}-iteration-${iterationid}`;
            const stack_name = `${process.env.StackName}-${image}`;

            await cf.createStack({
                StackName: stack_name,
                TemplateBody: String(fs.readFileSync(path.resolve(__dirname, '../../cloudformation/prediction.template.json'))),
                Tags: options.tags,
                Parameters: [
                    { ParameterKey: 'GitSha',           ParameterValue: process.env.GitSha },
                    { ParameterKey: 'StackName',        ParameterValue: process.env.StackName },
                    { ParameterKey: 'ImageTag',         ParameterValue: image },
                    { ParameterKey: 'Inferences',       ParameterValue: options.inf_list },
                    { ParameterKey: 'ProjectId',        ParameterValue: String(options.project_id) },
                    { ParameterKey: 'IterationId',      ParameterValue: String(options.iteration_id) },
                    { ParameterKey: 'ImageryId',        ParameterValue: String(options.imagery_id) },
                    { ParameterKey: 'MaxSize',          ParameterValue: String(options.max_size) },
                    { ParameterKey: 'MaxConcurrency',   ParameterValue: String(options.max_concurrency) },
                    { ParameterKey: 'InfSupertile',     ParameterValue: options.inf_supertile ? 'True' : 'False' }
                ],
                Capabilities: ['CAPABILITY_NAMED_IAM'],
                OnFailure: 'ROLLBACK'
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to create stack');
        }
    }
}

module.exports = Stack;