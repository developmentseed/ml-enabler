'use strict';

const test = require('tape');
const Flight = require('./flight');

const flight = new Flight();

flight.init(test);
flight.takeoff(test);
flight.user(test, 'ingalls', true);

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

test('PATCH api/org/1', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'PATCH',
            body: {
                name: 'Alpine International Inc.'
            },
            json: true
        }, t);

        t.ok(res.body.created);
        delete res.body.created;

        t.deepEquals(res.body, {
            id: 1,
            name: 'Alpine International Inc.'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET api/org/1', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/org/1',
            auth: {
                bearer: flight.token.ingalls
            },
            method: 'GET',
            json: true
        }, t);

        t.ok(res.body.created);
        delete res.body.created;

        t.deepEquals(res.body, {
            id: 1,
            name: 'Alpine International Inc.'
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

flight.landing(test);
