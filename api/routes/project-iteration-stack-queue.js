'use strict';

const Err = require('../lib/error');
const Iteration = require('../lib/project/iteration');
const StackQueue = require('../lib/stack');
const { Param } = require('../lib/util');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/stack Get Queue
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
        res: 'res.Stack.json'
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
}

module.exports = router;
