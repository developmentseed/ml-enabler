const test = require('tape');
const Flight = require('./flight');

const flight = new Flight();

flight.init(test);
flight.takeoff(test);

test('GET: api', async (t) => {
    try {
        const res = await flight.request({
            url: '/api',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 200, 'http: 200');
        t.deepEquals(res.body, {
            version: '3.0.0',
            stack: 'test',
            environment: 'docker',
            security: 'authenticated'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
