const { Err } = require('@openaddresses/batch-schema');
const AWS = require('aws-sdk');
const express = require('express');
const SNS = new AWS.SNS({
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

async function router(schema) {
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
            // TODO await user.is_auth(req);

            console.error(req.body);
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

                // Format: arn:aws:sns:<region>:<accountid>:<stackname>-delete
                const action = req.body.TopicArn.match();

                // Format: <stackname>-project-<project id>-iteration-<iteration id>-sqs-empty
                const subject = msg.body.Message.AlarmArn;
            } else {
                console.error(req.body, req.headers);
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
