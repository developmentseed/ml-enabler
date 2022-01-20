'use strict';
const { Err } = require('@openaddresses/batch-schema');
const Stack = require('../lib/stack');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);

    /**
     * @api {get} /api/stack List Stacks
     * @apiVersion 1.0.0
     * @apiName ListStacks
     * @apiGroup Stacks
     * @apiPermission admin
     *
     * @apiDescription
     *     Return a list of all inferencing stacks currently running
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListStacks.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListStacks.json} apiSuccess
     */
    await schema.get('/stack', {
        query: 'req.query.ListStacks.json',
        res: 'res.ListStacks.json'
    }, async (req, res) => {
        try {
            await user.is_admin(req);

            const list = (await Stack.list(config.StackName + '-')).filter((stack) => {
                return stack.StackName.includes(req.query.filter);
            });

            return res.json({
                total: list.length,
                stacks: list.map((l) => {
                    l.project = l.StackName.match(/project-(\d+)/)[1]
                    l.iteration = l.StackName.match(/iteration-(\d+)/)[1]
                    return l;
                })
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });

}

module.exports = router;
