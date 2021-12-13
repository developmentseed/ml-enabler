const { Err } = require('@openaddresses/batch-schema');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser')
const express = require('express');
const SNS = new AWS.SNS({
    region: process.env.AWS_DEFAULT_REGION || 'us-east-1'
});

async function router(schema, config) {
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
            //TODO await user.is_auth(req);

            if (typeof res.body === 'string') {
                res.body = JSON.parse(res.body);
            }

            if (res.headers['x-amz-sns-message-type'] === 'SubscriptionConfirmation') {
                await SNS.confirmSubscription({
                    TopicArn: body.TopicArn,
                    Token : body.Token
                }).promise();
            } else {
                console.error(res.body, res.headers);
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
