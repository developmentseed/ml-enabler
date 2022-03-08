'use strict';
const { Err } = require('@openaddresses/batch-schema');
const User = require('../lib/user');
const Login = require('../lib/login');
const Settings = require('../lib/settings');

async function router(schema, config) {
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
            await User.is_auth(req);

            const list = await User.list(config.pool, req.query);

            res.json(list);
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
            const has_password = !!req.body.password;

            if (!(await Settings.from(config.pool, 'user::registration')).value && req.user.access !== 'admin') {
                throw new Err(400, null, 'User Registration has been disabled');
            }

            const domains = (await Settings.from(config.pool, 'user::domains')).value;

            if (domains.length) {
                let matched = false;
                for (const domain of domains) {
                    if (req.body.email.endsWith(domain)) matched = true;
                }

                if (!matched) throw new Err(400, null, 'User Registration is restricted by email domain');
            }

            const usr = await User.generate(config.pool, {
                ...req.body,
                // Generate a temporary random password - can't actually be used as the user still has
                // to verify email (unless the server is in auto-validate mode)
                password: req.body.password || (Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8))
            });

            let token;
            if (has_password) {
                const forgot = await Login.forgot(config.pool, usr.username, 'verify');
                token = forgot.token;

                if (config.args.email) {
                    await email.verify({
                        username: usr.username,
                        email: usr.email,
                        token
                    });
                }
            } else {
                const forgot = await Login.forgot(config.pool, usr.username, 'reset');
                token = forgot.token;

                if (config.args.email) {
                    await email.forgot({
                        username: usr.username,
                        email: usr.email,
                        token
                    });
                }
            }

            if (!config.args.validate) {
                usr.validated = true;
                await usr.commit(config.pool);
            }

            return res.json(usr.serialize());
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
            await User.is_auth(req);

            if (req.user.access !== 'admin' && req.user.id !== req.params.uid) {
                throw new Err(401, null, 'You can only edit your own user account');
            }

            // Only admins can change access or set validated
            if (req.user.access !== 'admin') {
                delete req.body.access;
                delete req.body.validated;
            }

            const user = await User.from(config.pool, req.params.uid);
            user.patch(req.body);
            await user.commit(config.pool);

            res.json(user.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}

module.exports = router;
