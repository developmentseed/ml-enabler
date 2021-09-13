'use strict';

const Err = require('../lib/error');
const Iteration = require('../lib/project/iteration');
const StackQueue = require('../lib/stack/queue');
const Task = require('../lib/project/iteration/task');
const { Param } = require('../lib/util');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/stack/queue Get Queue
     * @apiVersion 1.0.0
     * @apiName GetStackQueue
     * @apiGroup StackQueue
     * @apiPermission user
     *
     * @apiDescription
     *     Get all information about the SQS queue powering the stack
     *
     * @apiSchema {jsonschema=../schema/res.StackQueue.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/stack/queue', {
        res: 'res.StackQueue.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');
            config.is_aws();

            const queue = await StackQueue.from(req.params.pid, req.params.iterationid);
            return res.json(queue.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/project/:pid/iteration/:iterationid/stack/queue Purge Queue
     * @apiVersion 1.0.0
     * @apiName GetStackQueue
     * @apiGroup StackQueue
     * @apiPermission user
     *
     * @apiDescription
     *     Get all information about the SQS queue powering the stack
     *
     * @apiSchema {jsonschema=../schema/res.StackQueue.json} apiSuccess
     */
    await schema.delete('/project/:pid/iteration/:iterationid/stack/queue', {
        res: 'res.StackQueue.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');
            config.is_aws();

            await StackQueue.delete(req.params.pid, req.params.iterationid);

            const queue = await StackQueue.from(req.params.pid, req.params.iterationid);
            return res.json(queue.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid/iteration/:iterationid/stack/queue Populate Queue
     * @apiVersion 1.0.0
     * @apiName PopulateStackQueue
     * @apiGroup StackQueue
     * @apiPermission user
     *
     * @apiDescription
     *     Populate a stack queue
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.post('/project/:pid/iteration/:iterationid/stack/queue', {
        res: 'res.StackQueue.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');
            config.is_aws();

            Task.batch(config, {
                type: 'pop'm
                name: `pop-${req.params.pid}-${req.params.iterationid}`,
                iter_id: req.params.iterationid
                environment: [{
                    Name: 'TASK',
                    Value: JSON.stringify(req.body)
                }]
            });

            return res.json({
                status: 200,
                message: 'Queue Populated'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
