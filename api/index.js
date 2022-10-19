import fs from 'fs';
import Schema from '@openaddresses/batch-schema';
import Err from '@openaddresses/batch-error';
import jwt from 'jsonwebtoken';
import express from 'express';
import minify from 'express-minify';
import minimist from 'minimist';

import Config from './lib/config.js';
import Settings from './lib/settings.js';
import User from './lib/user.js';
import Project from './lib/project.js';
import UserToken from './lib/token.js';

const args = minimist(process.argv, {
    boolean: ['help', 'populate', 'email', 'no-cache', 'silent', 'validate'],
    string: ['postgres']
});

const pkg = JSON.parse(fs.readFile(new URL('./package.json', import.meta.url)));

if (require.main === module) {
    configure(args);
}

export default async function configure(args, cb) {
    try {
        const config = await Config.env(args);

        if (args.meta) {
            for (const arg in args.meta) {
                await Settings.generate(config.pool, {
                    key: arg,
                    value: args.meta[arg]
                });
            }
        }

        return server(args, config, cb);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
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
    const app = express();

    const schema = new Schema(express.Router(), {
        schemas: new URL('./schema', import.meta.url)
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
                    req.user = await UserToken.validate(config.pool, authorization[1]);
                } catch (err) {
                    return Err.respond(err, res);
                }
            } else {
                try {
                    const decoded = jwt.verify(authorization[1], config.SigningSecret);

                    // Internal Machine Token
                    if (decoded.t === 'i') {
                        req.user = 'internal';
                    } else {
                        req.user = await User.from(config.pool, decoded.u);
                    }
                } catch (err) {
                    return Err.respond(new Err(401, err, 'Invalid Token'), res);
                }
            }
        } else if (req.query.token) {
            try {
                const decoded = jwt.verify(req.query.token, config.SigningSecret);
                if (decoded.t === 'i') {
                    req.user = 'internal';
                } else {
                    req.token = await User.from(config.pool, decoded.u);
                }
            } catch (err) {
                return Err.respond(new Err(401, err, 'Invalid Token'), res);
            }
        } else {
            req.user = false;
        }

        return next();
    });

    schema.router.param('pid', async (req, res, next, pid) => {
        try {
            if ((req.user && req.user.access === 'admin') || (req.token && req.token.access === 'admin'))  {
                req.project = await Project.from(config.pool, pid);
            } else {
                let uid;
                if (req.user) {
                    uid = req.user.id;
                } else if (req.token) {
                    uid = req.token.id;
                }

                req.project = await Project.from(config.pool, pid, uid);
            }
        } catch (err) {
            return Err.respond(err, res);
        }

        return next();
    });

    await schema.api();
    await schema.load(
        new URL('./routes/', import.meta.url),
        config,
        {
            silent: !!config.silent
        }
    );

    schema.not_found();
    schema.error();

    fs.writeFileSync(new URL('./doc/api.js', import.meta.url), schema.docs.join('\n'));

    config.confirm_sns();

    const srv = app.listen(2001, (err) => {
        if (err) return err;

        if (!config.silent) console.log('ok - http://localhost:2001');

        if (cb) return cb(srv, config);
    });
}
