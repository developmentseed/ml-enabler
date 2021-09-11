'use strict';

const Err = require('../lib/error');
const Task = require('../lib/project/iteration/task');
const { Param } = require('../lib/util');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/task List Tasks
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
            await Param.int(req, 'iterationid');

            req.query.pid = req.params.pid;
            req.query.iterationid = req.params.iterationid;
            res.json(await Task.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/task/:taskid/logs Get Logs
     * @apiVersion 1.0.0
     * @apiName LogTask
     * @apiGroup Tasks
     * @apiPermission user
     *
     * @apiDescription
     *     Return task log if it has not expired
     *
     * @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/task/:taskid/logs', {
        res: 'res.Task.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');
            await Param.int(req, 'taskid');

            const task = await Task.from(config.pool, req.params.taskid);

            return res.json(await task.logs());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/task/:taskid Get Task
     * @apiVersion 1.0.0
     * @apiName GetTask
     * @apiGroup Tasks
     * @apiPermission user
     *
     * @apiDescription
     *     Return all information about a single task
     *
     * @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/task/:taskid', {
        res: 'res.Task.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');
            await Param.int(req, 'taskid');

            const task = await Task.from(config.pool, req.params.taskid);

            return res.json(task.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/project/:pid/iteration/:iterationid/task/:taskid Patch Task
     * @apiVersion 1.0.0
     * @apiName PatchTask
     * @apiGroup Tasks
     * @apiPermission user
     *
     * @apiDescription
     *     Update a single task
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchTask.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
     */
    await schema.patch('/project/:pid/iteration/:iterationid/task/:taskid', {
        body: 'req.body.PatchTask.json',
        res: 'res.Task.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');
            await Param.int(req, 'taskid');

            const task = await Task.from(config.pool, req.params.taskid);
            task.patch(req.body);
            await task.commit(config.pool);

            return res.json(task.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/task/:taskid Delete Task
     * @apiVersion 1.0.0
     * @apiName DeleteTask
     * @apiGroup Tasks
     * @apiPermission user
     *
     * @apiDescription
     *     Remove a previous task entry
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/project/:pid/iteration/:iterationid/task/:taskid', {
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');
            await Param.int(req, 'taskid');

            const task = await Task.from(config.pool, req.params.taskid);
            await task.delete(config.pool);

            res.json({
                status: 200,
                message: 'Task Removed'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
