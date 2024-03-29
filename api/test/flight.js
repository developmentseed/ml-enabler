process.env.StackName = 'test';

import { sql } from 'slonik';
import fs from 'fs';
import { promisify } from 'util';
import api from '../index.js';
import Knex from 'knex';
import KnexConfig from '../knexfile.js';
import drop from './drop.js';
import { pathToRegexp } from 'path-to-regexp';
import request from 'request';
import Ajv from 'ajv';

const prequest = promisify(request);
const ajv = new Ajv({
    allErrors: true
});

export default class Flight {

    constructor() {
        this.srv;
        this.base = 'http://localhost:2001';
        this.token = {};
    }

    /**
     * Clear and restore an empty database schema
     *
     * @param {Tape} test Tape test instance
     */
    init(test) {
        test('start: database', async (t) => {
            try {
                await drop();
                const knex = Knex(KnexConfig);
                await knex.migrate.latest();
                await knex.destroy();
            } catch (err) {
                t.error(err);
            }

            this.schema = JSON.parse(fs.readFileSync(new URL('./fixtures/get_schema.json', import.meta.url)));
            this.routes = {};

            for (const route of Object.keys(this.schema)) {
                this.routes[route] = new RegExp(pathToRegexp(route.split(' ').join(' /api')));
            }

            t.end();
        });
    }

    /**
     * Make a request using a JSON fixture
     *
     * @param {Tape} test Tape Instance
     * @param {String} name Name of fixture present in the ./fixtures folder (Should be JSON)
     * @param {String} auth Name of the token that will be used to make the request
     */
    fixture(test, name, auth) {
        test(`Fixture: ${name}`, async (t) => {
            const req = JSON.parse(fs.readFileSync(new URL('./fixtures/' + name, import.meta.url)));
            if (auth) req.auth = {
                bearer: this.token[auth]
            };

            try {
                await this.request(req, t);
            } catch (err) {
                t.error(err, 'no errors');
            }

            t.end();
        });
    }

    /**
     * Request data from the API & Ensure the output schema matches the response
     *
     * @param {Object} req Request Object
     * @param {Object} t Options test argument - if not present doesn't test API response
     */
    async request(req, t) {
        req.url = new URL(req.url, this.base);

        if (!t) return await prequest(req);

        let match = false;
        const spath = `${req.method.toUpperCase()} ${req.url.pathname}/`;

        for (const r of Object.keys(this.routes)) {
            if (spath.match(this.routes[r])) {
                match = r;
            }
        }

        if (!match) {
            t.fail(`Cannot find schema match for: ${spath}`);
            return;
        }

        const schemaurl = new URL('/api/schema', this.base);
        schemaurl.searchParams.append('method', match.split(' ')[0]);
        schemaurl.searchParams.append('url', match.split(' ')[1]);
        const schema = ajv.compile((await prequest({
            json: true,
            url: schemaurl
        })).body.res);

        const res = await prequest(req);

        t.equals(res.statusCode, 200, 'statusCode: 200');

        if (res.statusCode === 200) {

            schema(res.body);

            if (!schema.errors) return res;

            for (const error of schema.errors) {
                t.fail(`${error.schemaPath}: ${error.message}`);
            }
        } else {
            // Just print the body instead of spewing
            // 100 schema validation errors for an error response
            t.fail(JSON.stringify(res.body));
        }

        return res;
    }

    /**
     * Bootstrap a new server test instance
     *
     * @param {Tape} test tape instance to run takeoff action on
     * @param {Object} custom custom config options
     */
    takeoff(test, custom = {}) {
        test('test server takeoff', (t) => {
            api(Object.assign({
                silent: true,
                meta: {
                    'user::registration': true
                }
            }, custom), (srv, config) => {
                t.ok(srv, 'server object returned');
                t.ok(config, 'config object returned');

                this.srv = srv;
                this.config = config;

                t.end();
            });
        });
    }

    /**
     * Create a new user and return an API token for that user
     *
     * @param {Object} test Tape runner
     * @param {String} username Username for user to create
     * @param {Boolean} [admin=false] Should the created user be an admin
     */
    user(test, username, admin = false) {
        test.test('Create Token', async (t) => {
            const new_user = await prequest({
                url: 'http://localhost:2001/api/user',
                json: true,
                method: 'POST',
                body: {
                    username: username,
                    password: 'testing123',
                    email: `${username}@example.com`
                }
            });

            if (new_user.statusCode !== 200) throw new Error(new_user.body.message);

            if (admin) {
                await this.config.pool.query(sql`
                     UPDATE users
                        SET
                            access = 'admin'
                        WHERE
                            id = ${new_user.body.id}
                `);
            }

            const login = await prequest({
                url: 'http://localhost:2001/api/login',
                json: true,
                method: 'POST',
                body: {
                    username: username,
                    password: 'testing123'
                }
            });

            if (login.statusCode !== 200) throw new Error(login.body.message);

            this.token[username] = login.body.token;
            t.end();
        });
    }

    /**
     * Shutdown an existing server test instance
     *
     * @param {Tape} test tape instance to run landing action on
     */
    landing(test) {
        test('test server landing - api', async (t) => {
            if (this.srv) {
                t.ok(this.srv, 'server object returned');
                await this.srv.close();
            }

            t.ok(this.config.pool, 'pool object returned');
            await this.config.pool.end();

            t.end();
        });
    }
}
