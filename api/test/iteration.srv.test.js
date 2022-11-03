import test from 'tape';
import Flight from './flight.js';

const flight = new Flight();

flight.init(test);
flight.takeoff(test);

flight.user(test, 'ingalls', true);

flight.fixture(test, 'project.json', 'ingalls');

test('POST /project/1/iteration - no imagery', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project/1/iteration',
            method: 'POST',
            json: true,
            body: {
                'model_type': 'tensorflow',
                'tile_zoom': 18,
                'inf_list': [{
                    'name': 'building',
                    'color': '#ffffff'
                },{
                    'name': 'not_building',
                    'color': '#000000'
                }],
                'inf_type': 'segmentation',
                'inf_binary': true,
                'inf_supertile': false,
                'version': '1.0.0',
                'hint': 'iteration',
                'imagery_id': 1,
                'gitsha': '1234567890'
            },
            auth: {
                bearer: flight.token.ingalls
            }
        }, false);

        t.deepEquals(res.body, {
            status: 404,
            message: 'imagery not found',
            messages: []
        });
    } catch (err) {
        t.error(err);
    }

    t.end();
});

flight.fixture(test, 'imagery.json', 'ingalls');

test('POST /project/1/iteration', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project/1/iteration',
            method: 'POST',
            json: true,
            body: {
                'model_type': 'tensorflow',
                'tile_zoom': 18,
                'inf_list': [{
                    'name': 'building',
                    'color': '#ffffff'
                },{
                    'name': 'not_building',
                    'color': '#000000'
                }],
                'inf_type': 'segmentation',
                'inf_binary': true,
                'inf_supertile': false,
                'version': '1.0.0',
                'hint': 'iteration',
                'imagery_id': 1,
                'gitsha': '1234567890'
            },
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.ok(res.body.created);
        t.ok(res.body.updated);
        delete res.body.created;
        delete res.body.updated;

        t.deepEquals(res.body, {
            id: 1,
            pid: 1,
            docker_link: null,
            model_link: null,
            model_type: 'tensorflow',
            checkpoint_link: null,
            tfrecord_link: null,
            save_link: null,
            tile_zoom: 18,
            inf_list: [
                { name: 'building', color: '#ffffff' },
                { name: 'not_building', color: '#000000' }
            ],
            inf_type: 'segmentation',
            inf_binary: true,
            inf_supertile: false,
            version: '1.0.0',
            hint: 'iteration',
            imagery_id: 1,
            gitsha: '1234567890'
        });
    } catch (err) {
        t.error(err);
    }

    t.end();
});

test('POST /project/1/iteration - duplicate version', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project/1/iteration',
            method: 'POST',
            json: true,
            body: {
                'model_type': 'tensorflow',
                'tile_zoom': 18,
                'inf_list': [{
                    'name': 'building',
                    'color': '#ffffff'
                },{
                    'name': 'not_building',
                    'color': '#000000'
                }],
                'inf_type': 'segmentation',
                'inf_binary': true,
                'inf_supertile': false,
                'version': '1.0.0',
                'hint': 'iteration',
                'imagery_id': 1,
                'gitsha': '1234567890'
            },
            auth: {
                bearer: flight.token.ingalls
            }
        }, false);

        t.deepEquals(res.body, {
            status: 400,
            message: 'iterations already exists',
            messages: []
        });
    } catch (err) {
        t.error(err);
    }

    t.end();
});

flight.landing(test);
