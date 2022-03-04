'use strict';
const fs = require('fs');
const path = require('path');
const test = require('tape');
const Flight = require('./flight');

const flight = new Flight();

flight.init(test);
flight.takeoff(test);

const UPDATE = process.env.UPDATE;

test('GET: api/schema', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/schema',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 200, 'http: 200');

        const fixture = path.resolve(__dirname, './fixtures/get_schema.json');
        if (UPDATE) {
            fs.writeFileSync(fixture, JSON.stringify(res.body, null, 4));
        }

        t.deepEquals(res.body, JSON.parse(fs.readFileSync(fixture)));
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/schema?method=FAKE', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/schema?method=fake',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 400, 'http: 400');
        t.deepEquals(res.body, {
            status: 400,
            message: 'validation error',
            messages: [{
                keyword: 'enum',
                dataPath: '.method',
                schemaPath: '#/properties/method/enum',
                params: { allowedValues: [ 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'CONNECT', 'OPTIONS', 'TRACE', 'PATCH' ] },
                message: 'should be equal to one of the allowed values'
            }]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/schema?method=GET', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/schema?method=GET',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 400, 'http: 400');
        t.deepEquals(res.body, {
            status: 400,
            message: 'url & method params must be used together',
            messages: []
        });

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/schema?url=123', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/schema?url=123',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 400, 'http: 400');
        t.deepEquals(res.body, {
            status: 400,
            message: 'url & method params must be used together',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/schema?method=POST&url=/login', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/schema?method=POST&url=/login',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 200, 'http: 200');
        t.deepEquals(res.body, {
            body: {
                type: 'object',
                required: [ 'username', 'password' ],
                additionalProperties: false,
                properties: {
                    username: {
                        type: 'string',
                        description: 'username'
                    },
                    password: {
                        type: 'string',
                        description: 'password'
                    }
                }
            },
            res: {
                type: 'object',
                required: [ 'id', 'username', 'email', 'access' ],
                additionalProperties: false,
                properties: {
                    id: {
                        type: 'integer'
                    },
                    username: {
                        type: 'string'
                    },
                    email: {
                        type: 'string'
                    },
                    access: {
                        type: 'string',
                        enum: [ 'user', 'read', 'disabled', 'admin' ],
                        description: 'The access level of a given user'
                    },
                    validated: {
                        type: 'boolean',
                        description: 'Has the user\'s email address been validated'
                    },
                    token: {
                        type: 'string',
                        description: 'JSON Web Token to use for subsequent auth'
                    }
                }
            },
            query: null
        });

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: api/login', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/login',
            method: 'POST',
            json: true,
            body: {
                fake: 123,
                username: 123
            }
        });

        t.equals(res.statusCode, 400, 'http: 400');
        t.deepEquals(res.body, {
            status: 400,
            message: 'validation error',
            messages: [
                { keyword: 'type', dataPath: '.username', schemaPath: '#/properties/username/type', params: { type: 'string' }, message: 'should be string' },
                { keyword: 'required', dataPath: '', schemaPath: '#/required', params: { missingProperty: 'password' }, message: 'should have required property \'password\'' }
            ]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
