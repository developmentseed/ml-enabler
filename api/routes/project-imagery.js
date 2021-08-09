'use strict';

const Err = require('../lib/error');
const Imagery = require('../lib/project/imagery');
const { Param } = require('../lib/util');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project List Imagery
     * @apiVersion 1.0.0
     * @apiName ListImagery
     * @apiGroup ProjectImagery
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all imagery sources within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListImagery.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListImagery.json} apiSuccess
     */
    await schema.get('/project/:pid/imagery', {
        query: 'req.query.ListImagery.json',
        res: 'res.ListImagery.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            req.query.pid = req.params.pid;
            res.json(await Imagery.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
