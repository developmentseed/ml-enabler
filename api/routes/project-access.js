import Err from '@openaddresses/batch-error';
import ProjectAccess from '../lib/project/access.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    /**
     * @api {get} /api/project/:pid/user List Users
     * @apiVersion 1.0.0
     * @apiName ListProjectAccess
     * @apiGroup ProjectAccess
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of users with access to a particular project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListProjectAccess.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListProjectAccess.json} apiSuccess
     */
    await schema.get('/project/:pid/user', {
        ':pid': 'integer',
        query: 'req.query.ListProjectAccess.json',
        res: 'res.ListProjectAccess.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            res.json(await ProjectAccess.list(config.pool, req.params.pid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid/user Add User
     * @apiVersion 1.0.0
     * @apiName CreateProjectAccess
     * @apiGroup ProjectAccess
     * @apiPermission user
     *
     * @apiDescription
     *     Create another project user
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateProjectAccess.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ProjectAccess.json} apiSuccess
     */
    await schema.post('/project/:pid/user', {
        ':pid': 'integer',
        ':id': 'integer',
        body: 'req.body.CreateProjectAccess.json',
        res: 'res.ListProjectAccess.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.body.pid = req.params.pid;
            const access = await ProjectAccess.generate(config.pool, req.body);
            return res.json(access.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/project/:pid/user/:id Patch User
     * @apiVersion 1.0.0
     * @apiName PatchProjectAccess
     * @apiGroup ProjectAccess
     * @apiPermission user
     *
     * @apiDescription
     *     Create another project user
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchProjectAccess.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ProjectAccess.json} apiSuccess
     */
    await schema.patch('/project/:pid/user/:id', {
        ':pid': 'integer',
        ':id': 'integer',
        body: 'req.body.PatchProjectAccess.json',
        res: 'res.ProjectAccess.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const access = await ProjectAccess.from(config.pool, req.params.id);
            access.patch(req.body);
            await access.commit(config.pool);

            return res.json(access.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
