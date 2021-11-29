const { Err } = require('@openaddresses/batch-schema');

async function router(schema, config) {
    const user = new (require('../lib/user'))(config);
    const email = new (require('../lib/email'))(config);

    /**
     * @api {get} /api/user List Users
     * @apiVersion 1.0.0
     * @apiName ListUsers
     * @apiGroup User
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of users that have registered with the service
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListUsers.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListUsers.json} apiSuccess
     */
    await schema.get('/user', {
        res: 'res.ListUsers.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            res.json(await user.list(req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/user Create User
     * @apiVersion 1.0.0
     * @apiName CreateUser
     * @apiGroup User
     * @apiPermission public
     *
     * @apiDescription
     *     Create a new user
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateUser.json} apiParam
     * @apiSchema {jsonschema=../schema/res.User.json} apiSuccess
     */
    await schema.post('/user', {
        body: 'req.body.CreateUser.json',
        res: 'res.User.json'
    }, async (req, res) => {
        try {
            const usr = await user.register(req.body);

            const forgot = await user.forgot(usr.username, 'verify');

            if (config.args.email) {
                await email.verify({
                    username: usr.username,
                    email: usr.email,
                    token: forgot.token
                });
            } else if (!config.args.validate) {
                await user.verify(forgot.token);
            }

            return res.json(usr);
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/user/:uid Update User
     * @apiVersion 1.0.0
     * @apiName PatchUser
     * @apiGroup User
     * @apiPermission admin
     *
     * @apiDescription
     *     Update information about a given user
     *
     * @apiParam {Number} :uid The UID of the user to update
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchUser.json} apiParam
     * @apiSchema {jsonschema=../schema/res.User.json} apiSuccess
     */
    await schema.patch('/user/:uid', {
        ':uid': 'integer',
        body: 'req.body.PatchUser.json',
        res: 'res.User.json'
    }, async (req, res) => {
        try {
            await user.is_auth(req);

            if (req.auth.access !== 'admin' && req.auth.uid !== req.params.uid) {
                throw new Err(401, null, 'You can only edit your own user account');
            }

            // Only admins can change access or set validated
            if (req.auth.access !== 'admin') {
                delete req.body.access;
                delete req.body.validated;
            }

            res.json(await user.patch(req.params.uid, req.body));
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
