import test from 'tape';
import Flight from './flight.js';

const flight = new Flight();

flight.init(test);
flight.takeoff(test);

test('GET: health', async (t) => {
    try {
        const res = await flight.request({
            url: '/health',
            method: 'GET',
            json: true
        });

        t.equals(res.statusCode, 200, 'http: 200');
        t.deepEquals(res.body, {
            healthy: true,
            message: ':wave:'
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
