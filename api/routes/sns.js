'use strict';
const { Err } = require('@openaddresses/batch-schema');
const AWS = require('aws-sdk');
const express = require('express');
const Task = require('../lib/project/iteration/task');
const Stack = require('../lib/stack');
const Submission = require('../lib/project/iteration/submission');
const MessageValidator = require('sns-validator');

const SNS = new AWS.SNS({
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

/**
 * @class validator
 */
class Validator {
    constructor() {
        this.validator = new MessageValidator();
    }

    validate(message) {
        return new Promise((resolve, reject) => {
            this.validator.validate(message, (err, message) => {
                if (err) return reject(err);
                return resolve(message);
            });
        });
    }

}

async function router(schema, config) {
    const validator = new Validator();

    /**
     * @api {post} /api/sns SNS Webhook
     * @apiVersion 1.0.0
     * @apiName SNS Vectorize
     * @apiGroup SNS
     * @apiPermission admin
     *
     * @apiDescription
     *     Webhook API for receiving SNS webhooks
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.post('/sns', {
        res: 'res.Standard.json'
    }, express.text(), async (req, res) => {
        try {
            await validator.validate(req.body);
        } catch (err) {
            console.error(err);
            return res.json({
                status: 401,
                message: 'Invalid SNS Message'
            });
        }

        try {

            if (typeof req.body === 'string') {
                req.body = JSON.parse(req.body);
            }

            if (req.headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
                await SNS.confirmSubscription({
                    TopicArn: req.body.TopicArn,
                    Token : req.body.Token
                }).promise();
            } else if (req.headers['x-amz-sns-message-type'] === 'Notification') {
                req.body.Message = JSON.parse(req.body.Message);

                // Format: <stackname>-project-<project id>-iteration-<iteration id>-sqs-empty
                const stk_match = req.body.Message.AlarmArn.match(/.*project-(\d+)-iteration-(\d+)-sqs-empty/);
                if (!stk_match) throw new Error('Unknown Stack');
                const project_id = stk_match[1];
                const iter_id = stk_match[2];

                // Format: arn:aws:sns:<region>:<accountid>:<stackname>-delete
                if (req.body.TopicArn.match(/-delete$/)) {
                    console.error('DELETE', project_id, iter_id);

                    const stack = await Stack.from(project_id, iter_id);
                    await stack.delete();
                } else if (req.body.TopicArn.match(/-vectorize$/)) {
                    console.error('VECTORIZE', project_id, iter_id);

                    const list = await Submission.list(config.pool, iter_id);

                    for (const sub of list.submissions) {
                        if (sub.storage) continue;

                        await Task.batch(config, {
                            type: 'vectorize',
                            name: `vectorize-${project_id}-${iter_id}-${1}`,
                            iter_id: iter_id,
                            environment: [{
                                name: 'PROJECT_ID',
                                value: String(project_id)
                            },{
                                name: 'ITERATION_ID',
                                value: String(iter_id)
                            },{
                                name: 'SUBMISSION_ID',
                                value: String(sub.id)
                            }]
                        });
                    }
                }
            } else {
                console.error('UNKNOWN', req.headers, req.body);
            }

            res.json({
                status: 200,
                message: 'Webhook Accepted'
            });
        } catch (err) {
            if (err) console.error(err);
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
