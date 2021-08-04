'use strict';

const Err = require('../lib/error');

async function router(schema, config) {
    /**
     * @api {get} /api/stack List Stacks
     * @apiVersion 1.0.0
     * @apiName ListSacks
     * @apiGroup Stacks
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all currently deployed stacks
     *
     * @ apiSchema {jsonschema=../schema/res.ListStacks.json} apiSuccess
     */
    await schema.get('/stack', {
        //res: 'res.ListStacks.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            //@TODO
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
