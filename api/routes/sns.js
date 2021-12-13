const { Err } = require('@openaddresses/batch-schema');

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
    }, async (req, res) => {
        try {
            //TODO await user.is_auth(req);

            console.error(req.body, req.headers);

            res.json({
                status: 200,
                message: 'Webhook Accepted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
