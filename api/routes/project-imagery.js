import Err from '@openaddresses/batch-error';
import Imagery from '../lib/types/project-imagery.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {
    /**
     * @api {get} /api/project/:pid/imagery List Imagery
     * @apiVersion 1.0.0
     * @apiName ListImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all imagery sources within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListImagery.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListImagery.json} apiSuccess
     */
    await schema.get('/project/:pid/imagery', {
        ':pid': 'integer',
        query: 'req.query.ListImagery.json',
        res: 'res.ListImagery.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.pid = req.params.pid;
            res.json(await Imagery.list(config.pool, req.params.pid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid/imagery Create Imagery
     * @apiVersion 1.0.0
     * @apiName CreateImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new imagery source
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateImagery.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Imagery.json} apiSuccess
     */
    await schema.post('/project/:pid/imagery', {
        ':pid': 'integer',
        body: 'req.body.CreateImagery.json',
        res: 'res.Imagery.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.body.pid = req.params.pid;
            const img = await Imagery.generate(config.pool, req.body);

            return res.json(img.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/imagery/:imageryid Get Imagery
     * @apiVersion 1.0.0
     * @apiName GetImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Get a single imagery source
     *
     * @apiSchema {jsonschema=../schema/res.Imagery.json} apiSuccess
     */
    await schema.get('/project/:pid/imagery/:imageryid', {
        ':pid': 'integer',
        ':imageryid': 'integer',
        res: 'res.Imagery.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const img = await Imagery.from(config.pool, req.params.imageryid);

            return res.json(img.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/project/:pid/imagery/:imageryid Patch Imagery
     * @apiVersion 1.0.0
     * @apiName PatchImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Update an imagery source
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchImagery.json} apiParam
     * @apiSchema {jsonschema=../schema/res.Imagery.json} apiSuccess
     */
    await schema.patch('/project/:pid/imagery/:imageryid', {
        ':pid': 'integer',
        ':imageryid': 'integer',
        body: 'req.body.PatchImagery.json',
        res: 'res.Imagery.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const img = await Imagery.commit(config.pool, req.params.imageryid, req.body);

            return res.json(img.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/project/:pid/imagery/:imageryid delete Imagery
     * @apiVersion 1.0.0
     * @apiName DeleteImagery
     * @apiGroup Imagery
     * @apiPermission user
     *
     * @apiDescription
     *     Delete an imagery source
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/project/:pid/imagery/:imageryid', {
        ':pid': 'integer',
        ':imageryid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const img = await Imagery.from(config.pool, req.params.imageryid);
            await img.delete(config.pool);

            return res.json({
                status: 200,
                message: 'Imagery Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
