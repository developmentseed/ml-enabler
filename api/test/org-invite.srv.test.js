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

test('POST api/org/1/user/invite', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user/invite',
            auth: {
                bearer: flight.token.ingalls
            },
            body: {
                email: 'nick@ds.io'
            },
            method: 'POST',
            json: true
        }, t);

        t.ok(res.body.token);
        delete res.body.token;

        t.ok(res.body.created);
        delete res.body.created;

        t.deepEquals(res.body, {
            id: 1,
            email: 'nick@ds.io',
            org_id: 1
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET api/org/1/user/invite', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user/invite',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'GET',
            json: true
        }, t);

        t.ok(res.body.invites[0].created);
        delete res.body.invites[0].created;

        t.deepEquals(res.body, {
            total: 1,
            invites: [{
                id: 1,
                email: 'nick@ds.io'
            }]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('DELETE api/org/1/user/invite/2', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user/invite/2',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'DELETE',
            json: true
        });

        t.deepEquals(res.body, {
            status: 404,
            message: 'Invite not found in Org',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('DELETE api/org/1/user/invite/1', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user/invite/1',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'DELETE',
            json: true
        }, t);

        t.deepEquals(res.body, {
            status: 200,
            message: 'Invite Deleted'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET api/org/1/user/invite', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1/user/invite',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'GET',
            json: true
        }, t);

        t.deepEquals(res.body, {
            total: 0,
            invites: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST api/org/accept - invalid token', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/accept',
            auth: {
                bearer: flight.token.ingalls_sub
            },
            body: {
                token: '123'
            },
            method: 'POST',
            json: true
        });

        t.deepEquals(res.body, {
            status: 400,
            message: 'JWT Decoded Error',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
