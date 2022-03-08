'use strict';
const { Err } = require('@openaddresses/batch-schema');
const ProjectAccess = require('../lib/project/access');
const User = require('../lib/user');

async function router(schema, config) {
    /**
     * @api {get} /api/project/:pid/user List Users
     * @apiVersion 1.0.0
     * @apiName ListProjectAccess
     * @apiGroup ProjectAccess
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of users with access to a particular project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListProjectAccess.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListProjectAccess.json} apiSuccess
     */
    await schema.get('/project/:pid/user', {
        ':pid': 'integer',
        query: 'req.query.ListProjectAccess.json',
        res: 'res.ListProjectAccess.json'
    }, async (req, res) => {
        try {
            await User.is_auth(req);

            res.json(await ProjectAccess.list(config.pool, req.params.pid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
