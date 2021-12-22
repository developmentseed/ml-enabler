const { Err } = require('@openaddresses/batch-schema');
const Iteration = require('../lib/project/iteration');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/export
     * @apiVersion 1.0.0
     * @apiName GetExport
     * @apiGroup Export
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all model iterations within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.GetExport.json} apiParam
     */
    await schema.get('/project/:pid/iteration/:iterationid/export', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        query: 'req.query.GetExport.json'
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
