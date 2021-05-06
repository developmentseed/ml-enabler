'use strict';

const fs = require('fs');
const Cacher = require('./lib/cacher');
const Miss = Cacher.Miss;
const session = require('express-session');
const { ValidationError } = require('express-json-validator-middleware');
const Busboy = require('busboy');
const path = require('path');
const morgan = require('morgan');
const util = require('./lib/util');
const express = require('express');
const pkg = require('./package.json');
const minify = require('express-minify');
const bodyparser = require('body-parser');
const args = require('minimist')(process.argv, {
    boolean: ['help', 'populate', 'email', 'no-cache'],
    string: ['postgres']
});

const pgSession = require('connect-pg-simple')(session);

const Param = util.Param;
const { Pool } = require('pg');

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
 *   The user must be an admin to use this endpoint
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
    //const Map = require('./lib/map');

    let postgres = process.env.POSTGRES;

    if (args.postgres) {
        postgres = args.postgres;
    } else if (!postgres) {
        postgres = 'postgres://postgres@localhost:5432/mlenabler';
    }

    const cacher = new Cacher(args['no-cache']);

    let pool = false;
    let retry = 5;
    do {
        try {
            pool = new Pool({
                connectionString: postgres
            });

            await pool.query('SELECT NOW()');
        } catch (err) {
            pool = false;

            if (retry === 0) {
                console.error('not ok - terminating due to lack of postgres connection');
                return process.exit(1);
            }

            retry--;
            console.error('not ok - unable to get postgres connection');
            console.error(`ok - retrying... (${5 - retry}/5)`);
            await sleep(5000);
        }
    } while (!pool);

    try {
        await pool.query(String(fs.readFileSync(path.resolve(__dirname, 'schema.sql'))));

        if (args.populate) {
            await Map.populate(pool);
        }
    } catch (err) {
        throw new Error(err);
    }

    const user = new (require('./lib/user'))(pool);
    const token = new (require('./lib/token'))(pool);

    const app = express();
    const router = express.Router();

    app.disable('x-powered-by');
    app.use(minify());

    app.use(session({
        name: args.prod ? '__Host-session' : 'session',
        proxy: args.prod,
        resave: false,
        store: new pgSession({
            pool: pool,
            tableName : 'session'
        }),
        cookie: {
            maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
            sameSite: true,
            secure: args.prod
        },
        saveUninitialized: true,
        secret: config.CookieSecret
    }));

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

    // Unified Auth
    router.use(async (req, res, next) => {
        if (req.session && req.session.auth && req.session.auth.username) {
            req.auth = req.session.auth;
            req.auth.type = 'session';
        } else if (req.header('shared-secret')) {
            if (req.header('shared-secret') !== config.SharedSecret) {
                return res.status(401).json({
                    status: 401,
                    message: 'Invalid shared secret'
                });
            } else {
                req.auth = {
                    uid: false,
                    type: 'secret',
                    level: 'sponsor',
                    username: false,
                    access: 'admin',
                    email: false,
                    flags: {}
                };
            }
        } else if (req.header('authorization')) {
            const authorization = req.header('authorization').split(' ');
            if (authorization[0].toLowerCase() !== 'bearer') {
                return res.status(401).json({
                    status: 401,
                    message: 'Only "Bearer" authorization header is allowed'
                });
            }

            try {
                req.auth = await token.validate(authorization[1]);
                req.auth.type = 'token';
            } catch (err) {
                return Err.respond(err, res);
            }
        } else {
            req.auth = false;
        }

        return next();
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

                if (args.email) await email.verify({
                    username: usr.username,
                    email: usr.email,
                    token: forgot.token
                });

                res.json(usr);
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {patch} /api/user/:id Update User
     * @apiVersion 1.0.0
     * @apiName PatchUser
     * @apiGroup User
     * @apiPermission admin
     *
     * @apiDescription
     *     Update information about a given user
     *
     * @apiParam {Number} :id The UID of the user to update
     *
     * @apiSchema (Body) {jsonschema=./schema/req.body.PatchUser.json} apiParam
     * @apiSchema {jsonschema=./schema/res.User.json} apiSuccess
     */
    router.patch(
        ...await schemas.get('PATCH /user/:id', {
            body: 'req.body.PatchUser.json',
            res: 'res.User.json'
        }),
        async (req, res) => {
            try {
                await Param.int(req, 'id');
                await user.is_admin(req);

                res.json(await user.patch(req.params.id, req.body));
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
     * @apiSchema (Query) {jsonschema=./schema/req.query.GetLogin.json} apiParam
     * @apiSchema {jsonschema=./schema/res.Login.json} apiSuccess
     */
    router.get(
        ...await schemas.get('GET /login', {
            query: 'req.query.GetLogin.json',
            res: 'res.Login.json'
        }),
        async (req, res) => {
            if (req.session && req.session.auth && req.session.auth.username) {
                try {
                    if (req.query.level) await level.single(req.session.auth.email);
                    res.json(await user.user(req.session.auth.uid));
                } catch (err) {
                    return Err.respond(err, res);
                }
            } else {
                return res.status(401).json({
                    status: 401,
                    message: 'Invalid session'
                });
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
                req.session.auth = await user.login({
                    username: req.body.username,
                    password: req.body.password
                });

                return res.json({
                    uid: req.session.auth.uid,
                    level: req.session.auth.level,
                    username: req.session.auth.username,
                    email: req.session.auth.email,
                    access: req.session.auth.access,
                    flags: req.session.auth.flags
                });
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {delete} /api/login Delete Session
     * @apiVersion 1.0.0
     * @apiName DeleteLogin
     * @apiGroup Login
     * @apiPermission user
     *
     * @apiDescription
     *     Log a user out of the service
     *
     * @apiSchema {jsonschema=./schema/res.Standard.json} apiSuccess
     */
    router.delete(
        ...await schemas.get('DELETE /login', {
            res: 'res.Standard.json'
        }),
        async (req, res) => {
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).json({
                        status: 500,
                        message: 'Failed to logout user'
                    });
                }

                return res.json({
                    status: 200,
                    message: 'The user has been logged ut'
                });
            });
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

                if (args.email) await email.forgot(reset);

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

                return res.json(await token.list(req.auth));
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

                return res.json(await token.generate(req.auth, req.body.name));
            } catch (err) {
                return Err.respond(err, res);
            }
        }
    );

    /**
     * @api {delete} /api/token/:id Delete Token
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
        ...await schemas.get('DELETE /token/:id', {
            res: 'res.Standard.json'
        }),
        async (req, res) => {
            try {
                await Param.int(req, 'id');

                await user.is_auth(req);

                return res.json(await token.delete(req.auth, req.params.id));
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

    const srv = app.listen(4999, (err) => {
        if (err) return err;

        if (cb) return cb(srv, pool);

        console.log('ok - http://localhost:4999');
    });
}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}


module.exports = configure;
