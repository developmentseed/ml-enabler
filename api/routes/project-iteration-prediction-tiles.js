const { Err } = require('@openaddresses/batch-schema');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/tiles TileJSON
     * @apiVersion 1.0.0
     * @apiName TilejsonPredictions
     * @apiGroup Predictions
     * @apiPermission user
     *
     * @apiDescription
     *     Return a TileJSON for the predictions of a given iteration
     *
     * @apiSchema {jsonschema=../schema/res.TilejsonPredictions.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/tiles', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        res: 'res.TilejsonPredictions.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            res.json({
                uploaded: false
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
