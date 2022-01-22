'use strict';
const { Err } = require('@openaddresses/batch-schema');
const Iteration = require('../lib/project/iteration');
const Stack = require('../lib/stack');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration/:iterationid/stack Get Stack
     * @apiVersion 1.0.0
     * @apiName GetStack
     * @apiGroup Stacks
     * @apiPermission user
     *
     * @apiDescription
     *     Get all information about a deployed stack
     *
     * @apiSchema {jsonschema=../schema/res.Stack.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration/:iterationid/stack', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        res: 'res.Stack.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            config.is_aws();

            const stack = await Stack.from(req.params.pid, req.params.iterationid);
            return res.json(stack.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid/iteration/:iterationid/stack Create Stack
     * @apiVersion 1.0.0
     * @apiName CreateStack
     * @apiGroup Stacks
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new stack within a project
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateStack.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Stack.json} apiSuccess
     */
    await schema.post('/project/:pid/iteration/:iterationid/stack', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        body: 'req.body.CreateStack.json',
        res: 'res.Stack.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            config.is_aws();

            const iter = await Iteration.from(config.pool, req.params.iterationid);

            await Stack.generate(
                req.params.pid,
                req.params.iterationid, {
                    tags: req.body.tags,
                    max_size: req.body.max_size,
                    max_concurrency: req.body.max_concurrency,
                    project_id: req.params.pid,
                    iteration_id: req.params.iterationid,
                    imagery_id: iter.imagery_id,
                    inf_list: iter.inf_list,
                    inf_supertile: iter.inf_supertile,
                    model_type: iter.model_type
                }
            );

            return res.json({
                status: 200,
                message: 'Stack Created'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/project/:pid/iteration/:iterationid/stack Delete Stack
     * @apiVersion 1.0.0
     * @apiName DeleteStack
     * @apiGroup Stacks
     * @apiPermission user
     *
     * @apiDescription
     *     Delete stack within a project
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/project/:pid/iteration/:iterationid/stack', {
        ':pid': 'integer',
        ':iterationid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            config.is_aws();

            const stack = await Stack.from(req.params.pid, req.params.iterationid);
            await stack.delete();

            return res.json({
                status: 200,
                message: 'Stack Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
