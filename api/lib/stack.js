'use strict';
const { Err } = require('@openaddresses/batch-schema');
const AWS = require('aws-sdk');
const cf = new AWS.CloudFormation({
    region: process.env.AWS_DEFAULT_REGION
});

const template = require('../cloudformation/prediction.template.js');

/**
 * @class
 */
class Stack {
    static async list(prefix) {
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

            stacks = stacks.concat(partial.StackSummaries);

            while (partial.NextToken) {
                partial = await cf.listStacks({
                    NextToken: partial.NextToken
                }).promise();

                stacks = stacks.concat(partial.StackSummaries);
            }

            return stacks.filter((s) => {
                return s.StackName.includes(prefix);
            });
        } catch (err) {
            throw new Err(500, err, 'Cannot list stacks');
        }
    }

    serialize() {
        return {
            id: this.id,
            name: this.stack_name,
            status: this.status
        };
    }

    static async from(pid, iterationid) {
        const stack = new Stack();

        stack.stack_name = `${process.env.StackName}-project-${pid}-iteration-${iterationid}`;

        try {
            stack.stack = await cf.describeStacks({
                StackName: stack.stack_name
            }).promise();
        } catch (err) {
            if (err.statusCode === 400) {
                stack.id = 'none',
                stack.status = 'None';

                return stack;
            } else {
                throw new Err(500, err, 'Could not describe stacks');
            }
        }

        stack.pid = pid;
        stack.iterationid = iterationid;

        if (!stack.stack.Stacks || !stack.stack.Stacks.length) {
            throw new Err(400, null, 'No Stack Found');
        }

        stack.id = stack.stack.Stacks[0].StackId,
        stack.status = stack.stack.Stacks[0].StackStatus;

        return stack;
    }

    static async generate(pid, iterationid, options) {
        try {
            const image = `project-${pid}-iteration-${iterationid}`;
            const stack_name = `${process.env.StackName}-${image}`;

            let memory_size = 512;
            if (inf_type === 'segmentation') {
                memory_size = 1024;
            }

            await cf.createStack({
                StackName: stack_name,
                TemplateBody: JSON.stringify(template),
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
                    { ParameterKey: 'InfSupertile',     ParameterValue: options.inf_supertile ? 'True' : 'False' },
                    { ParameterKey: 'InfType',          ParameterValue: options.inf_type },
                    { ParameterKey: 'MemorySize',       ParameterValue: memory_size }
                ],
                Capabilities: ['CAPABILITY_NAMED_IAM'],
                OnFailure: 'ROLLBACK'
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to create stack');
        }
    }

    async delete() {
        try {
            await cf.deleteStack({
                StackName: this.stack_name
            }).promise();
        } catch (err) {
            throw new Err(500, err, 'Failed to delete stack');
        }
    }
}

module.exports = Stack;
