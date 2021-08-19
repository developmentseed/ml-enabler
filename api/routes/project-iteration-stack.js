'use strict';

const Err = require('../lib/error');
const Stack = require('../lib/stack');
const { Param } = require('../lib/util');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {post} /api/project/:pid/iteration Create Stack
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
        body: 'req.body.CreateStack.json',
        res: 'res.Stack.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);
            await Param.int(req, 'pid');
            await Param.int(req, 'iterationid');

            const stack = await Stack.generate(
                req.params.pid,
                req.params.iterationid,
                req.body
            );

            return res.json({
                status: 200,
                message: 'Stack Created'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
