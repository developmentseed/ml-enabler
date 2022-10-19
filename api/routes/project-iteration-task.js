import Err from '@openaddresses/batch-error';
import Task from '../lib/project/iteration/task.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {

    /**
     * @api {post} /api/project/:pid/iteration/:iterationid/task Create Task
     * @apiVersion 1.0.0
     * @apiName CreateTask
     * @apiGroup Tasks
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new task for a given iteration
     *
     * @apiSchema (Query) {jsonschema=../schema/req.body.CreateTask.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Task.json} apiSuccess
     */
    await schema.post('/project/:pid/iteration/:iterationid/task', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        body: 'req.body.CreateTask.json',
        res: 'res.Task.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            let task;
            if (req.body.type === 'vectorize') {
                task = await Task.batch(config, {
                    type: 'vectorize',
                    name: `vectorize-${req.params.pid}-${req.params.iterationid}-${req.body.data.submission}`,
                    iter_id: req.params.iterationid,
                    environment: [{
                        name: 'PROJECT_ID',
                        value: String(req.params.pid)
                    },{
                        name: 'ITERATION_ID',
                        value: String(req.params.iterationid)
                    },{
                        name: 'SUBMISSION_ID',
                        value: String(req.body.data.submission)
                    }]
                });
            }
            res.json(task.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

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
        ':pid': 'integer',
        ':iterationid': 'integer',
        query: 'req.query.ListTasks.json',
        res: 'res.ListTasks.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await Task.list(config.pool, req.params.iterationid, req.query));
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
        ':pid': 'integer',
        ':iterationid': 'integer',
        ':taskid': 'integer',
        res: 'res.Task.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

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
        ':pid': 'integer',
        ':iterationid': 'integer',
        ':taskid': 'integer',
        res: 'res.Task.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

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
        ':pid': 'integer',
        ':iterationid': 'integer',
        ':taskid': 'integer',
        body: 'req.body.PatchTask.json',
        res: 'res.Task.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

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
        ':pid': 'integer',
        ':iterationid': 'integer',
        ':taskid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

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
