'use strict';
const test = require('tape');
const Flight = require('./flight');

const flight = new Flight();

flight.init(test);
flight.takeoff(test);

test('GET: /project', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project',
            method: 'GET',
            json: true
        }, false);

        t.deepEquals(res.body, {
            status: 401,
            message: 'Authentication Required',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: /project/1 - no project', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project/1',
            method: 'GET',
            json: true
        }, false);

        t.deepEquals(res.body, {
            status: 404,
            message: 'projects not found',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
