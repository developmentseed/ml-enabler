'use strict';

const { Err } = require('@openaddresses/batch-schema');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/inference Create Inference
     * @apiVersion 1.0.0
     * @apiName CreateInference
     * @apiGroup Inferences
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new inference on the server
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateInference.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Inference.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/inference', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        query: 'req.body.CreateInference.json',
        res: 'res.Inference.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            res.json(true);
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
