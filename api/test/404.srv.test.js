'use strict';
const test = require('tape');
const Flight = require('./flight');

const flight = new Flight();

flight.init(test);
flight.takeoff(test);

test('GET: api/fake', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/fake',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 404, 'http: 404');
        t.deepEquals(res.body, {
            status: 404,
            message: 'API endpoint does not exist!'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
