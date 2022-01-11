const fs = require('fs');
const path = require('path');
const { Schema, Err } = require('@openaddresses/batch-schema');
const jwt = require('jsonwebtoken');
const morgan = require('morgan');
const express = require('express');
const pkg = require('./package.json');
const minify = require('express-minify');
const bodyparser = require('body-parser');
const args = require('minimist')(process.argv, {
    boolean: ['help', 'populate', 'email', 'no-cache', 'silent', 'validate'],
    string: ['postgres']
});

const Config = require('./lib/config');
const UserToken = new require('./lib/token');

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
 * @apiDefine user User
 *   A user must be logged in to use this endpoint
 */
/**
 * @apiDefine public Public
 *   This API endpoint does not require authentication
 */

async function server(args, config, cb) {
    const user = new (require('./lib/user'))(config);

    const app = express();

    const schema = new Schema(express.Router(), {
        schemas: path.resolve(__dirname, 'schema')
    });

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
            version: pkg.version,
            stack: config.Stack,
            environment: config.Environment,
            security: 'authenticated'
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

    app.use('/api', schema.router);
    app.use('/docs', express.static('./doc'));
    app.use('/*', express.static('web/dist'));

    schema.router.use(bodyparser.urlencoded({ extended: true }));
    schema.router.use(morgan('combined'));
    schema.router.use(bodyparser.json({ limit: '50mb' }));

    schema.router.use(async (req, res, next) => {
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

            if (authorization[1].split('.')[0] === 'mle') {
                try {
                    req.auth = await UserToken.validate(config.pool, authorization[1]);
                } catch (err) {
                    return Err.respond(err, res);
                }
            } else {
                try {
                    const decoded = jwt.verify(authorization[1], config.SigningSecret);

                    // Internal Machine Token
                    if (decoded.t === 'i') {
                        req.auth = 'internal';
                    } else {
                        req.auth = await user.user(decoded.u);
                    }
                } catch (err) {
                    return Err.respond(new Err(401, err, 'Invalid Token'), res);
                }
            }
        } else if (req.query.token) {
            try {
                const decoded = jwt.verify(req.query.token, config.SigningSecret);
                if (decoded.t === 'i') {
                    req.auth = 'internal';
                } else {
                    req.token = await user.user(decoded.u);
                }
            } catch (err) {
                return Err.respond(new Err(401, err, 'Invalid Token'), res);
            }
        } else {
            req.auth = false;
        }

        return next();
    });

    await schema.api();

    // Load dynamic routes directory
    for (const r of fs.readdirSync(path.resolve(__dirname, './routes'))) {
        if (!config.silent) console.error(`ok - loaded routes/${r}`);
        await require('./routes/' + r)(schema, config);
    }

    schema.error();

    schema.router.all('*', (req, res) => {
        return res.status(404).json({
            status: 404,
            message: 'API endpoint does not exist!'
        });
    });

    config.confirm_sns();

    const srv = app.listen(2000, (err) => {
        if (err) return err;

        if (!config.silent) console.log('ok - http://localhost:2000');

        if (cb) return cb(srv, config);
    });
}

module.exports = configure;
