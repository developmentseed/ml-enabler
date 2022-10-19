import test from 'tape';
import Flight from './flight.js';

const flight = new Flight();

flight.init(test);
flight.takeoff(test);
flight.user(test, 'ingalls', true);
flight.user(test, 'rando', false);
flight.user(test, 'admin', true);

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

test('POST: /project', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project',
            method: 'POST',
            json: true,
            body: {
                name: 'Test Project',
                source: 'Development Seed',
                project_url: 'example.com/test',
                access: 'private',
                notes: 'I am a note',
                tags: [{
                    Key: 'Billing',
                    Value: 'Tags'
                }],
                users: [{
                    uid: 1,
                    access: 'admin'
                }]
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
            name: 'Test Project',
            source: 'Development Seed',
            project_url: 'example.com/test',
            archived: false,
            tags: [{ Key: 'Billing', Value: 'Tags' }],
            access: 'private',
            notes: 'I am a note',
            repo: null
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('POST: /project - no duplicate projects', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project',
            method: 'POST',
            json: true,
            body: {
                name: 'Test Project',
                source: 'Development Seed',
                project_url: 'example.com/test',
                access: 'private',
                notes: 'I am a note',
                tags: [{
                    Key: 'Billing',
                    Value: 'Tags'
                }],
                users: [{
                    uid: 1,
                    access: 'admin'
                }]
            },
            auth: {
                bearer: flight.token.ingalls
            }
        }, false);

        t.deepEquals(res.body, {
            status: 400,
            message: 'Project by that name already exists',
            messages: []
        });

    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: /project/1', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project/1',
            method: 'GET',
            json: true,
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
            name: 'Test Project',
            source: 'Development Seed',
            project_url: 'example.com/test',
            archived: false,
            tags: [{ Key: 'Billing', Value: 'Tags' }],
            access: 'private',
            notes: 'I am a note',
            repo: null
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: /project/1 - no access for non-user in private project', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project/1',
            method: 'GET',
            json: true,
            auth: {
                bearer: flight.token.rando
            }
        }, false);

        t.deepEquals(res.body, {
            status: 404,
            message: 'Project does not exist or user does not have access',
            messages: []
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: /project/1 - server admin', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project/1',
            method: 'GET',
            json: true,
            auth: {
                bearer: flight.token.admin
            }
        }, t);

        t.ok(res.body.created);
        t.ok(res.body.updated);
        delete res.body.created;
        delete res.body.updated;

        t.deepEquals(res.body, {
            id: 1,
            name: 'Test Project',
            source: 'Development Seed',
            project_url: 'example.com/test',
            archived: false,
            tags: [{ Key: 'Billing', Value: 'Tags' }],
            access: 'private',
            notes: 'I am a note',
            repo: null
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

test('GET: /project', async (t) => {
    try {
        const res = await flight.request({
            url: '/api/project',
            method: 'GET',
            json: true,
            auth: {
                bearer: flight.token.ingalls
            }
        }, t);

        t.ok(res.body.projects[0].created);
        t.ok(res.body.projects[0].updated);
        delete res.body.projects[0].created;
        delete res.body.projects[0].updated;

        t.deepEquals(res.body, {
            total: 1,
            projects: [{
                id: 1,
                name: 'Test Project',
                source: 'Development Seed',
                project_url: 'example.com/test',
                archived: false,
                access: 'private',
                stacks: [],
                repo: null
            }]
        });
    } catch (err) {
        t.error(err, 'no error');
    }

    t.end();
});

flight.landing(test);
