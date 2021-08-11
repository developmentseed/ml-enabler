'use strict';

const Err = require('../lib/error');
const Task = require('../lib/project/iteration/task');
const { Param } = require('../lib/util');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration List Tasks
     * @apiVersion 1.0.0
     * @apiName ListTask
     * @apiGroup Tasks
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of tasks within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListTasks.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListTasks.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/task', {
        query: 'req.query.ListTasks.json',
        res: 'res.ListTasks.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');

            req.query.pid = req.params.pid;
            req.query.iterationid = req.params.iterationid;
            res.json(await Task.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
