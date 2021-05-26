'use strict';

const test = require('tape');
const Flight = require('./flight');
const { sql } = require('slonik');

const flight = new Flight();
flight.init(test);
flight.takeoff(test);

test('GET: api/user (no auth)', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 401, 'http: 401');
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: api/user', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user',
            method: 'POST',
            json: true,
            body: {
                username: 'ingalls',
                password: 'password123',
                email: 'ingalls@example.com'
            }
        }, t);

        t.deepEquals(res.body, {
            id: 1,
            username: 'ingalls'    ,
            email: 'ingalls@example.com',
            access: 'user',
            validated: false
        }, 'user');

        t.end();
    } catch (err) {
        t.error(err, 'no error');
    }
});

test('POST: api/login (failed)', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/login',
            method: 'POST',
            json: true,
            body: {
                username: 'ingalls',
                password: 'password124'
            }
        });

        t.equals(res.statusCode, 403, 'http: 403');
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: api/login (not confirmed)', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/login',
            method: 'POST',
            json: true,
            body: {
                username: 'ingalls',
                password: 'password123'
            }
        });

        t.equals(res.statusCode, 403, 'http: 403');
        t.deepEquals(res.body, {
            status: 403, message: 'User has not confirmed email', messages: []
        });

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('META: Validate User', async (t) => {
    await flight.config.pool.query(sql`
        UPDATE users SET validated = True;
    `);

    t.end();
});

let token;
test('POST: api/login (success)', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/login',
            method: 'POST',
            json: true,
            body: {
                username: 'ingalls',
                password: 'password123'
            }
        }, t);

        t.equals(res.statusCode, 200, 'http: 200');

        token = res.body.token;
        t.ok(res.body.token, '.token');
        delete res.body.token;

        t.deepEquals(res.body, {
            uid: 1,
            username: 'ingalls',
            email: 'ingalls@example.com',
            access: 'user'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/login - no session', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/login',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 401, 'http: 401');

        t.deepEquals(res.body, {
            status: 401,
            message: 'Authentication Required',
            messages: []
        }, 'user');

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/login - not bearer', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/login',
            method: 'GET',
            auth: {
                username: 'test'
            },
            json: true
        });

        t.equals(res.statusCode, 401, 'http: 401');

        t.deepEquals(res.body, {
            status: 401,
            message: 'Only "Bearer" authorization header is allowed'
        }, 'user');

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/login - empty token', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/login',
            method: 'GET',
            auth: {
                bearer: false
            },
            json: true
        });

        t.equals(res.statusCode, 401, 'http: 401');

        t.deepEquals(res.body, {
            status: 401,
            message: 'No bearer token present'
        }, 'user');

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/login - invalid token', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/login',
            method: 'GET',
            auth: {
                bearer: token + '123'
            },
            json: true
        });

        t.equals(res.statusCode, 401, 'http: 401');

        t.deepEquals(res.body, {
            status: 401,
            message: 'Invalid Token',
            messages: []
        });

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/login', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/login',
            method: 'GET',
            auth: {
                bearer: token
            },
            json: true
        }, t);

        t.deepEquals(res.body, {
            uid: 1,
            username: 'ingalls'    ,
            email: 'ingalls@example.com',
            validated: true,
            access: 'user'
        }, 'user');

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/user - not admin', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user',
            method: 'GET',
            auth: {
                bearer: token
            },
            json: true
        });

        t.equals(res.statusCode, 401, 'http: 401');

        t.deepEquals(res.body, {
            status: 401,
            message: 'Admin token required',
            messages: []
        });

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('META: Admin User', async (t) => {
    await flight.config.pool.query(sql`
        UPDATE users SET access = 'admin';
    `);

    t.end();
});

test('GET: api/user', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user',
            method: 'GET',
            auth: {
                bearer: token
            },
            json: true
        }, t);

        t.deepEquals(res.body, {
            total: 1,
            users: [{
                id: 1,
                username: 'ingalls',
                email: 'ingalls@example.com',
                access: 'admin',
                validated: true,
                orgs: []
            }]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/user?filter=test', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user?filter=test',
            method: 'GET',
            auth: {
                bearer: token
            },
            json: true
        }, t);

        t.deepEquals(res.body, {
            total: 0,
            users: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/user?filter=ingalls', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user?filter=ingalls',
            method: 'GET',
            auth: {
                bearer: token
            },
            json: true
        }, t);

        t.deepEquals(res.body, {
            total: 1,
            users: [{
                id: 1,
                username: 'ingalls',
                email: 'ingalls@example.com',
                access: 'admin',
                validated: true,
                orgs: []
            }]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/user?filter=ingalls&access=user', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user?filter=ingalls&access=user',
            method: 'GET',
            auth: {
                bearer: token
            },
            json: true
        }, t);

        t.deepEquals(res.body, {
            total: 0,
            users: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: api/user?filter=ingalls&access=admin', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user?filter=ingalls&access=admin',
            method: 'GET',
            auth: {
                bearer: token
            },
            json: true
        }, t);

        t.deepEquals(res.body, {
            total: 1,
            users: [{
                id: 1,
                username: 'ingalls',
                email: 'ingalls@example.com',
                access: 'admin',
                validated: true,
                orgs: []
            }]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: api/user', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user',
            method: 'POST',
            json: true,
            body: {
                username: 'ingalls-sub',
                password: 'password123',
                email: 'ingalls-sub@example.com'
            }
        }, t);

        t.deepEquals(res.body, {
            id: 2,
            username: 'ingalls-sub',
            email: 'ingalls-sub@example.com',
            access: 'user',
            validated: false
        }, 'user');

        t.end();
    } catch (err) {
        t.error(err, 'no error');
    }
});

test('PATCH: api/user/2', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/user/2',
            method: 'PATCH',
            json: true,
            auth: {
                bearer: token
            },
            body: {
                validated: true,
                access: 'disabled'
            }
        }, t);

        t.deepEquals(res.body, {
            id: 2,
            username: 'ingalls-sub',
            email: 'ingalls-sub@example.com',
            access: 'disabled',
            validated: true
        }, 'user');

        t.end();
    } catch (err) {
        t.error(err, 'no error');
    }
});

flight.landing(test);
