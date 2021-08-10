'use strict';

const Err = require('../lib/error');
const Iteration = require('../lib/project/iteration');
const { Param } = require('../lib/util');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/project/:pid/iteration List Iteration
     * @apiVersion 1.0.0
     * @apiName ListIteration
     * @apiGroup Iterations
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all model iterations within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListIterations.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListIterations.json} apiSuccess
     */
    await schema.get('/project/:pid/iteration', {
        query: 'req.query.ListIterations.json',
        res: 'res.ListIterations.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            req.query.pid = req.params.pid;

            // TODO
            return res.json({
                total: 0,
                iterations: []
            });

            res.json(await Iterations.list(config.pool, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid/iteration Create Iteration
     * @apiVersion 1.0.0
     * @apiName CreateIteration
     * @apiGroup Iterations
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new iteration within a project
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateIteration.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Iteration.json} apiSuccess
     */
    await schema.post('/project/:pid/iteration', {
        body: 'req.body.CreateIteration.json',
        res: 'res.Iteration.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            const iter = await Iteration.generate(config.pool, req.body);

            return res.json(iter.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
