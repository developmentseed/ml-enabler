'use strict';

const Err = require('./lib/error');
const Cacher = require('./lib/cacher');
const jwt = require('jsonwebtoken');
const Miss = Cacher.Miss;
const { ValidationError } = require('express-json-validator-middleware');
const Busboy = require('busboy');
const morgan = require('morgan');
const util = require('./lib/util');
const express = require('express');
const pkg = require('./package.json');
const minify = require('express-minify');
const bodyparser = require('body-parser');
const args = require('minimist')(process.argv, {
    boolean: ['help', 'populate', 'email', 'no-cache', 'silent'],
    string: ['postgres']
});

const Param = util.Param;
const Config = require('./lib/config');

if (require.main === module) {
    configure(args);
}

function configure(args, cb) {
    Config.env(args).then((config) => {
        return server(args, config, cb);
    }).catch((err) => {
        console.error(err);
        process.exit(1);
    });
}

/**
 * @apiDefine admin Admin
 *   The user must be a server admin to use this endpoint
 */
/**
 * @apiDefine orgadmin Org Admin
 *   The user must be an org admin (or server admin) to use this endpoint
 */
/**
 * @apiDefine user User
 *   A user must be logged in to use this endpoint
 */
/**
 * @apiDefine public Public
 *   This API endpoint does not require authentication
 */

async function server(args, config, cb) {
    // these must be run after lib/config
    // const Map = require('./lib/map');
    const schemas = new (require('./lib/schema'))();

    const cacher = new Cacher(args['no-cache'], config.silent);

    const email = new (require('./lib/email'))(config);
    const user = new (require('./lib/user'))(config);
    const Token = new require('./lib/token');
    const Org = new require('./lib/org');
    const OrgUser = new require('./lib/org/user');
    const OrgInvite = new require('./lib/org/invite');

    const app = express();
    const router = express.Router();

    app.disable('x-powered-by');
    app.use(minify());

    app.use(express.static('web/dist'));

    /**
     * @api {get} /api Get Metadata
     * @apiVersion 1.0.0
     * @apiName Meta
     * @apiGroup Server
     * @apiPermission public
     *
     * @apiDescription
     *     Return basic metadata about server configuration
     *
     * @apiSchema {jsonschema=./schema/res.Meta.json} apiSuccess
     */
    app.get('/api', (req, res) => {
        return res.json({
            version: pkg.version
        });
    });

    /**
     * @api {get} /health Server Healthcheck
     * @apiVersion 1.0.0
     * @apiName Health
     * @apiGroup Server
     * @apiPermission public
     *
     * @apiDescription
     *     AWS ELB Healthcheck for the server
     *
     * @apiSchema {jsonschema=./schema/res.Health.json} apiSuccess
     */
    app.get('/health', (req, res) => {
        return res.json({
            healthy: true,
            message: ':wave:'
        });
    });

    app.use('/api', router);
    app.use('/docs', express.static('./doc'));
    app.use('/*', express.static('web/dist'));

    router.use(bodyparser.urlencoded({ extended: true }));
    router.use(morgan('combined'));
    router.use(bodyparser.json({ limit: '50mb' }));

    router.use(async (req, res, next) => {
        if (req.header('authorization')) {
            const authorization = req.header('authorization').split(' ');
            if (authorization[0].toLowerCase() !== 'bearer') {
                return res.status(401).json({
                    status: 401,
                    message: 'Only "Bearer" authorization header is allowed'
                });
            }

            if (!authorization[1]) {
                return res.status(401).json({
                    status: 401,
                    message: 'No bearer token present'
                });
            }

            if (authorization[1].split('.')[0] === 'bri') {
                try {
                    req.auth = await Token.validate(config.pool, authorization[1]);
                } catch (err) {
                    return Err.respond(err, res);
                }
            } else {
                try {
                    const decoded = jwt.verify(authorization[1], config.signing_secret);
                    req.auth = await user.user(decoded.u);
                } catch (err) {
                    return Err.respond(new Err(401, err, 'Invalid Token'), res);
                }
            }
        } else {
            req.auth = false;
        }

        return next();
    });

    router.param('org_id', async (req, res, next, org_id) => {
        try {
            req.org = await Org.from(config.pool, org_id);
            return next();
        } catch (err) {
            return next(err);
        }
    });

    /**
     * @api {get} /api/schema List Schemas
     * @apiVersion 1.0.0
     * @apiName ListSchemas
     * @apiGroup Schemas
     * @apiPermission public
     *
     * @apiDescription
     *     List all JSON Schemas in use
     *     With no parameters this API will return a list of all the endpoints that have a form of schema validation
     *     If the url/method params are used, the schemas themselves are returned
     *
     *     Note: If url or method params are used, they must be used together
     *
     * @apiSchema (Query) {jsonschema=./schema/req.query.ListSchema.json} apiParam
     * @apiSchema {jsonschema=./schema/res.ListSchema.json} apiSuccess
     */
    router.get(
        ...await schemas.get('GET /schema', {
            query: 'req.query.ListSchema.json',
            body: 'res.ListSchema.json'
        }),
        async (req, res) => {
            try {
                if (req.query.url && req.query.method) {
                    res.json(schemas.query(req.query.method, req.query.url));
                } else if (req.query.url || req.query.method) {
                    throw new Err(400, null, 'url & method params must be used together');
                } else {
                    return res.json(schemas.list());
                }
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {get} /api/user List Users
     * @apiVersion 1.0.0
     * @apiName ListUsers
     * @apiGroup User
     * @apiPermission admin
     *
     * @apiDescription
     *     Return a list of users that have registered with the service
     *
     * @apiSchema (Query) {jsonschema=./schema/req.query.ListUsers.json} apiParam
     * @apiSchema {jsonschema=./schema/res.ListUsers.json} apiSuccess
     */
    router.get(
        ...await schemas.get('GET /user', {
            res: 'res.ListUsers.json'
        }),
        async (req, res) => {
            try {
                await user.is_admin(req);

                res.json(await user.list(req.query));
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

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
     * @apiSchema (Body) {jsonschema=./schema/req.body.CreateUser.json} apiParam
     * @apiSchema {jsonschema=./schema/res.User.json} apiSuccess
     */
    router.post(
        ...await schemas.get('POST /user', {
            body: 'req.body.CreateUser.json',
            res: 'res.User.json'
        }),
        async (req, res) => {
            try {
                const usr = await user.register(req.body);

                const forgot = await user.forgot(usr.username, 'verify');

                if (args.email) {
                    await email.verify({
                        username: usr.username,
                        email: usr.email,
                        token: forgot.token
                    });
                }

                res.json(usr);
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

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
     * @apiSchema (Body) {jsonschema=./schema/req.body.PatchUser.json} apiParam
     * @apiSchema {jsonschema=./schema/res.User.json} apiSuccess
     */
    router.patch(
        ...await schemas.get('PATCH /user/:uid', {
            body: 'req.body.PatchUser.json',
            res: 'res.User.json'
        }),
        async (req, res) => {
            try {
                await Param.int(req, 'uid');
                await user.is_admin(req);

                res.json(await user.patch(req.params.uid, req.body));
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );


    /**
     * @api {get} /api/login Session Info
     * @apiVersion 1.0.0
     * @apiName GetLogin
     * @apiGroup Login
     * @apiPermission user
     *
     * @apiDescription
     *     Return information about the currently logged in user
     *
     * @apiSchema {jsonschema=./schema/res.Login.json} apiSuccess
     */
    router.get(
        ...await schemas.get('GET /login', {
            res: 'res.Login.json'
        }),
        async (req, res) => {
            try {
                await user.is_auth(req);
                res.json(await req.auth);
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {post} /api/login Create Session
     * @apiVersion 1.0.0
     * @apiName CreateLogin
     * @apiGroup Login
     * @apiPermission user
     *
     * @apiDescription
     *     Log a user into the service and create an authenticated cookie
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.CreateLogin.json} apiParam
     * @apiSchema {jsonschema=./schema/res.Login.json} apiSuccess
     */
    router.post(
        ...await schemas.get('POST /login', {
            body: 'req.body.CreateLogin.json',
            res: 'res.Login.json'
        }),
        async (req, res) => {
            try {
                req.auth = await user.login({
                    username: req.body.username,
                    password: req.body.password
                });

                return res.json({
                    uid: req.auth.uid,
                    username: req.auth.username,
                    email: req.auth.email,
                    access: req.auth.access,
                    token: req.auth.token
                });
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {post} /api/login/forgot Forgot Login
     * @apiVersion 1.0.0
     * @apiName ForgotLogin
     * @apiGroup Login
     * @apiPermission public
     *
     * @apiDescription
     *     If a user has forgotten their password, send them a password reset link to their email
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.ForgotLogin.json} apiParam
     * @apiSchema {jsonschema=./schema/res.Standard.json} apiSuccess
     */
    router.post(
        ...await schemas.get('POST /login/forgot', {
            body: 'req.body.ForgotLogin.json',
            res: 'res.Standard.json'
        }),
        async (req, res) => {
            try {
                const reset = await user.forgot(req.body.user); // Username or email

                if (args.email) {
                    await email.forgot(reset);
                }

                // To avoid email scraping - this will always return true, regardless of success
                return res.json({ status: 200, message: 'Password Email Sent' });
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {post} /api/login/reset Reset Login
     * @apiVersion 1.0.0
     * @apiName ResetLogin
     * @apiGroup Login
     * @apiPermission public
     *
     * @apiDescription
     *     Once a user has obtained a password reset by email via the Forgot Login API,
     *     use the token to reset the password
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.ResetLogin.json} apiParam
     * @apiSchema {jsonschema=./schema/res.Standard.json} apiSuccess
     */
    router.post(
        ...await schemas.get('POST /login/reset', {
            body: 'req.body.ResetLogin.json',
            res: 'res.Standard.json'
        }),
        async (req, res) => {
            try {
                return res.json(await user.reset({
                    token: req.body.token,
                    password: req.body.password
                }));

            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {get} /api/token List Tokens
     * @apiVersion 1.0.0
     * @apiName ListTokens
     * @apiGroup Token
     * @apiPermission user
     *
     * @apiDescription
     *     List all tokens associated with the requester's account
     *
     * @apiSchema {jsonschema=./schema/res.ListTokens.json} apiSuccess
     */
    router.get(
        ...await schemas.get('GET /token', {
            res: 'res.ListTokens.json'
        }),
        async (req, res) => {
            try {
                await user.is_auth(req);

                req.query.uid = req.auth.uid;
                return res.json(await Token.list(config.pool, req.query));
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {post} /api/token Create Token
     * @apiVersion 1.0.0
     * @apiName CreateToken
     * @apiGroup Token
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new API token for programatic access
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.CreateToken.json} apiParam
     * @apiSchema {jsonschema=./schema/res.CreateToken.json} apiSuccess
     */
    router.post(
        ...await schemas.get('POST /token', {
            body: 'req.body.CreateToken.json',
            res: 'res.CreateToken.json'
        }),
        async (req, res) => {
            try {
                await user.is_auth(req);

                req.body.uid = req.auth.uid;
                return res.json((await Token.gen(config.pool, req.body)).json(true));
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {delete} /api/token/:token_id Get Token
     * @apiVersion 1.0.0
     * @apiName GetToken
     * @apiGroup Token
     * @apiPermission user
     *
     * @apiDescription
     *     Get information about a single token
     *
     * @apiSchema {jsonschema=./schema/res.GetToken.json} apiSuccess
     */
    router.get(
        ...await schemas.get('GET /token/:token_id', {
            res: 'res.GetToken.json'
        }),
        async (req, res) => {
            try {
                await Param.int(req, 'token_id');

                await user.is_auth(req);

                const token = await Token.from(config.pool, req.params.token_id);
                if (token.uid !== req.auth.uid) throw new Err(401, null, 'Cannot get a token you did not create');

                return res.json(token.json());
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {delete} /api/token/:token_id Delete Token
     * @apiVersion 1.0.0
     * @apiName DeleteToken
     * @apiGroup Token
     * @apiPermission user
     *
     * @apiDescription
     *     Delete a user's API Token
     *
     * @apiSchema {jsonschema=./schema/res.Standard.json} apiSuccess
     */
    router.delete(
        ...await schemas.get('DELETE /token/:token_id', {
            res: 'res.Standard.json'
        }),
        async (req, res) => {
            try {
                await Param.int(req, 'token_id');

                await user.is_auth(req);

                const token = await Token.from(config.pool, req.params.token_id);
                if (token.uid !== req.auth.uid) throw new Err(401, null, 'Cannot delete a token you did not create');

                return res.json(await token.delete(config.pool));
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {post} /api/org Create Org
     * @apiVersion 1.0.0
     * @apiName CreateOrg
     * @apiGroup Org
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new Organization
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.CreateOrg.json} apiParam
     * @apiSchema {jsonschema=./schema/res.Org.json} apiSuccess
     */
    router.post(
        ...await schemas.get('POST /org', {
            body: 'req.body.CreateOrg.json',
            res: 'res.Org.json'
        }),
        async (req, res) => {
            try {
                await user.is_auth(req);

                const org = await Org.gen(config.pool, req.body);

                // User's that create an Org are automatically admins
                await OrgUser.gen(config.pool, {
                    uid: req.auth.uid,
                    org_id: org.id,
                    access: 'admin'
                });

                return res.json(org.json());
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {patch} /api/org/:org_id Patch Org
     * @apiVersion 1.0.0
     * @apiName PatchOrg
     * @apiGroup Org
     * @apiPermission orgadmin
     *
     * @apiDescription
     *     Modify an organization
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.PatchOrg.json} apiParam
     * @apiSchema {jsonschema=./schema/res.Org.json} apiSuccess
     */
    router.patch(
        ...await schemas.get('PATCH /org/:org_id', {
            body: 'req.body.CreateOrg.json',
            res: 'res.Org.json'
        }),
        async (req, res) => {
            try {
                await user.is_orgadmin(config.pool, req);
                await Param.int(req, 'org_id');

                req.org.patch(req.body);
                return res.json((await req.org.commit(config.pool)).json());
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {get} /api/org/:org_id Get Org
     * @apiVersion 1.0.0
     * @apiName GetOrg
     * @apiGroup Org
     * @apiPermission user
     *
     * @apiDescription
     *     Return all info about an org
     *
     * @apiSchema {jsonschema=./schema/res.Org.json} apiSuccess
     */
    router.get(
        ...await schemas.get('GET /org/:org_id', {
            res: 'res.Org.json'
        }),
        async (req, res) => {
            try {
                await user.is_admin(req);
                await Param.int(req, 'org_id');

                return res.json(req.org.json());
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {get} /api/org/:org_id/user List Users
     * @apiVersion 1.0.0
     * @apiName ListOrgUsers
     * @apiGroup OrgUsers
     * @apiPermission orgadmin
     *
     * @apiDescription
     *     List all users in an Org
     *
     * @apiSchema (Query) {jsonschema=./schema/req.query.ListOrgUsers.json} apiParam
     * @apiSchema {jsonschema=./schema/res.ListOrgUsers.json} apiSuccess
     */
    router.get(
        ...await schemas.get('GET /org/:org_id/user', {
            query: 'req.query.ListOrgUsers.json',
            res: 'res.ListOrgUsers.json'
        }),
        async (req, res) => {
            try {
                await user.is_orgadmin(config.pool, req);

                await Param.int(req, 'org_id');

                req.query.org = req.params.org_id;
                const list = await user.list(req.query);

                list.users = list.users.map((u) => {
                    delete u.orgs;
                    return u;
                });

                return res.json(list);
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {post} /api/org/:org_id/user Add User
     * @apiVersion 1.0.0
     * @apiName AddOrgUser
     * @apiGroup OrgUsers
     * @apiPermission orgadmin
     *
     * @apiDescription
     *     Allow a server admin to add a user to an org
     *
     *     Note: This is for server admins and not orgadmins. Org admins
     *     should use the /invite to send a graceful email invite
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.AddOrgUser.json} apiParam
     * @apiSchema {jsonschema=./schema/res.OrgUser.json} apiSuccess
     */
    router.post(
        ...await schemas.get('POST /org/:org_id/user', {
            body: 'req.body.AddOrgUser.json',
            res: 'res.OrgUser.json'
        }),
        async (req, res) => {
            try {
                await user.is_admin(req);
                await Param.int(req, 'org_id');

                req.body.org_id = req.params.org_id;
                const org_user = await OrgUser.gen(config.pool, req.body);
                return res.json(org_user.json());
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {post} /api/org/:org_id/user/invite Invite User
     * @apiVersion 1.0.0
     * @apiName InviteOrgUser
     * @apiGroup OrgInvite
     * @apiPermission orgadmin
     *
     * @apiDescription
     *     Invite a user to join an org by sending an email link
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.InviteOrgUser.json} apiParam
     * @apiSchema {jsonschema=./schema/res.OrgInvite.json} apiSuccess
     */
    router.post(
        ...await schemas.get('POST /org/:org_id/user/invite', {
            body: 'req.body.InviteOrgUser.json',
            res: 'res.OrgInvite.json'
        }),
        async (req, res) => {
            try {
                await user.is_orgadmin(config.pool, req);
                await Param.int(req, 'org_id');

                const invite = await OrgInvite.gen(config.pool, config.signing_secret, {
                    email: req.body.email,
                    org_id: req.params.org_id
                });

                if (args.email) {
                    console.error((await email.invite({
                        email: invite.email,
                        token: invite.token
                    }, req.org)));
                }

                return res.json(invite.json(true));
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {post} /api/org/accept Accept Invite
     * @apiVersion 1.0.0
     * @apiName AcceptInviteOrgUser
     * @apiGroup OrgInvite
     * @apiPermission user
     *
     * @apiDescription
     *     Accept an invite to an Org
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.AcceptInviteOrgUser.json} apiParam
     * @apiSchema {jsonschema=./schema/res.Standard.json} apiSuccess
     */
    router.post(
        ...await schemas.get('POST /org/accept', {
            body: 'req.body.AcceptInviteOrgUser.json',
            res: 'res.Standard.json'
        }),
        async (req, res) => {
            try {
                await user.is_auth(req);

                let decoded;
                try {
                    decoded = jwt.verify(req.body.token, config.signing_secret);
                } catch (err) {
                    throw new Err(400, err, 'JWT Decoded Error');
                }

                // This will throw an error if the invite token is not found
                const org_invite = await OrgInvite.from(config.pool, decoded.o, req.body.token);

                await OrgUser.gen(config.pool, {
                    uid: req.auth.uid,
                    org_id: decoded.o,
                    access: 'user'
                });

                await org_invite.delete(config.pool);

                return res.json({
                    status: 200,
                    message: 'Accepted Org Invite'
                });
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {get} /api/org/:org_id/user/invite List Invites
     * @apiVersion 1.0.0
     * @apiName ListInviteOrgUser
     * @apiGroup OrgInvite
     * @apiPermission orgadmin
     *
     * @apiDescription
     *     List all invites that have been sent but not accepted in an org
     *
     * @apiSchema (Query) {jsonschema=./schema/req.query.ListOrgInvites.json} apiParam
     * @apiSchema {jsonschema=./schema/res.ListOrgInvites.json} apiSuccess
     */
    router.get(
        ...await schemas.get('GET /org/:org_id/user/invite', {
            query: 'req.query.ListOrgInvites.json',
            res: 'res.ListOrgInvites.json'
        }),
        async (req, res) => {
            try {
                await user.is_orgadmin(config.pool, req);
                await Param.int(req, 'org_id');

                req.query.org = req.params.org_id;
                res.json(await OrgInvite.list(config.pool, req.query));
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {delete} /api/org/:org_id/user/invite/:invite_id Delete Invite
     * @apiVersion 1.0.0
     * @apiName DeleteInviteOrgUser
     * @apiGroup OrgInvite
     * @apiPermission orgadmin
     *
     * @apiDescription
     *     Delete an invite that hasn't yet been accepted
     *
     * @apiSchema {jsonschema=./schema/res.Standard.json} apiSuccess
     */
    router.delete(
        ...await schemas.get('DELETE /org/:org_id/user/invite/:invite_id', {
            res: 'res.Standard.json'
        }),
        async (req, res) => {
            try {
                await user.is_orgadmin(config.pool, req);
                await Param.int(req, 'org_id');
                await Param.int(req, 'invite_id');

                const invite = await OrgInvite.from(config.pool, req.params.org_id, req.params.invite_id);

                if (invite.org_id !== req.params.org_id) {
                    throw new Err(400, null, 'Invite does not belong to this org');
                }

                invite.delete(config.pool);

                return res.json({
                    status: 200,
                    message: 'Invite Deleted'
                });
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {delete} /api/org/:org_id/user/:uid Remove User
     * @apiVersion 1.0.0
     * @apiName RemoveOrgUser
     * @apiGroup OrgUsers
     * @apiPermission orgadmin
     *
     * @apiDescription
     *     Remove a user from an organisation
     *
     * @apiSchema {jsonschema=./schema/res.Standard.json} apiSuccess
     */
    router.delete(
        ...await schemas.get('DELETE /org/:org_id/user/:uid', {
            res: 'res.Standard.json'
        }),
        async (req, res) => {
            try {
                await user.is_orgadmin(config.pool, req);
                await Param.int(req, 'org_id');
                await Param.int(req, 'uid');

                const org_user = await OrgUser.from(config.pool, req.params.org_id, req.params.uid);
                await org_user.delete(config.pool);

                return res.json({
                    status: 200,
                    message: 'User Removed'
                });
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {patch} /api/org/:org_id/user/:uid Update User
     * @apiVersion 1.0.0
     * @apiName UpdateOrgUser
     * @apiGroup OrgUsers
     * @apiPermission orgadmin
     *
     * @apiDescription
     *     Update a user access
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.PatchOrgUser.json} apiParam
     * @apiSchema {jsonschema=./schema/res.OrgUser.json} apiSuccess
     */
    router.patch(
        ...await schemas.get('PATCH /org/:org_id/user/:uid', {
            body: 'req.body.PatchOrgUser.json',
            res: 'res.OrgUser.json'
        }),
        async (req, res) => {
            try {
                await user.is_orgadmin(config.pool, req);
                await Param.int(req, 'org_id');
                await Param.int(req, 'uid');

                const org_user = await OrgUser.from(config.pool, req.params.org_id, req.params.uid);
                org_user.patch(req.body);

                return res.json(org_user.json());
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );


    router.use((err, req, res, next) => {
        if (err instanceof ValidationError) {
            let errs = [];

            if (err.validationErrors.body) {
                errs = errs.concat(err.validationErrors.body.map((e) => {
                    return { message: e.message };
                }));
            }

            if (err.validationErrors.query) {
                errs = errs.concat(err.validationErrors.query.map((e) => {
                    return { message: e.message };
                }));
            }

            return Err.respond(
                new Err(400, null, 'validation error'),
                res,
                errs
            );
        } else {
            next(err);
        }
    });

    router.all('*', (req, res) => {
        return res.status(404).json({
            status: 404,
            message: 'API endpoint does not exist!'
        });
    });

    const srv = app.listen(2001, (err) => {
        if (err) return err;

        if (!config.silent) console.log('ok - http://localhost:2001');

        if (cb) return cb(srv, config);
    });
}

module.exports = configure;
