'use strict';

const test = require('tape');
const Flight = require('./flight');

const flight = new Flight();

flight.init(test);
flight.takeoff(test);
flight.user(test, 'ingalls', true);
flight.user(test, 'ingalls_sub');


test('POST api/org ', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'POST',
            body: {
                name: 'Alpine International'
            },
            json: true
        }, t);

        t.ok(res.body.created);
        delete res.body.created;

        t.deepEquals(res.body, {
            id: 1,
            name: 'Alpine International'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET api/org/1/user', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'GET',
            json: true
        }, t);

        t.deepEquals(res.body, {
            total: 1,
            users: [{
                id: 1,
                username: 'ingalls',
                validated: true,
                email: 'ingalls@example.com',
                access: 'admin'
            }]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET api/org/1/user (non-member)', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user',
            auth: {
                bearer: flight.token.ingalls_sub
            },
            method: 'GET',
            json: true
        });

        t.deepEquals(res.body, {
            status: 404,
            message: 'User not found in Org',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST api/org/1/user (non-member)', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user',
            auth: {
                bearer: flight.token.ingalls_sub
            },
            body: {
                uid: 2,
                access: 'user'
            },
            method: 'POST',
            json: true
        });

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

test('POST api/org/1/user - user doesn\'t exist', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user',
            auth: {
                bearer: flight.token.ingalls
            },
            body: {
                uid: 100,
                access: 'admin'
            },
            method: 'POST',
            json: true
        });

        t.deepEquals(res.body, {
            status: 400,
            message: 'User does not exist',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST api/org/1/user', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user',
            auth: {
                bearer: flight.token.ingalls
            },
            body: {
                uid: 2,
                access: 'user'
            },
            method: 'POST',
            json: true
        }, t);

        t.deepEquals(res.body, {
            uid: 2,
            org_id: 1,
            access: 'user'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET api/org/1/user', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'GET',
            json: true
        }, t);

        t.deepEquals(res.body, {
            total: 2,
            users: [{
                id: 2,
                username: 'ingalls_sub',
                validated: true,
                email: 'ingalls_sub@example.com',
                access: 'user'
            },{
                id: 1,
                username: 'ingalls',
                validated: true,
                email: 'ingalls@example.com',
                access: 'admin'
            }]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('PATCH api/org/1/user', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user/2',
            auth: {
                bearer: flight.token.ingalls
            },
            body: {
                access: 'admin'
            },
            method: 'PATCH',
            json: true
        }, t);

        t.deepEquals(res.body, {
            uid: 2,
            org_id: 1,
            access: 'admin'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('DELETE api/org/1/user/2', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user/2',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'DELETE',
            json: true
        }, t);

        t.deepEquals(res.body, {
            status: 200,
            message: 'User Removed'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
