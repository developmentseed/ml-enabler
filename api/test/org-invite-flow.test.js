'use strict';

const test = require('tape');
const Flight = require('./flight');

const flight = new Flight();

flight.init(test);
flight.takeoff(test);
flight.user(test, 'ingalls', true);
flight.user(test, 'ingalls_sub');


test('Org Invite Flow', async (t) => {
    try {
        await flight.request({
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

        const token = (await flight.request({
            url: '/api/org/1/user/invite',
            auth: {
                bearer: flight.token.ingalls
            },
            body: {
                email: 'nick@ds.io'
            },
            method: 'POST',
            json: true
        }, t)).body.token;

        const accept = await flight.request({
            url: '/api/org/accept',
            auth: {
                bearer: flight.token.ingalls_sub
            },
            body: {
                token: token
            },
            method: 'POST',
            json: true
        }, t);

        t.deepEquals(accept.body, {
            status: 200,
            message: 'Accepted Org Invite'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
