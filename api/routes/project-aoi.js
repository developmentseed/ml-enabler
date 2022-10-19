import Err from '@openaddresses/batch-error';
import AOI from '../lib/types/project-aoi.js';
import Auth from '../lib/auth.js';

export default async function router(schema, config) {

    /**
     * @api {get} /api/project/:pid/aoi List AOI
     * @apiVersion 1.0.0
     * @apiName ListAOI
     * @apiGroup AOI
     * @apiPermission user
     *
     * @apiDescription
     *     Return a list of all AOIs within a project
     *
     * @apiSchema (Query) {jsonschema=../schema/req.query.ListAOI.json} apiParam
     * @apiSchema {jsonschema=../schema/res.ListAOI.json} apiSuccess
     */
    await schema.get('/project/:pid/aoi', {
        ':pid': 'integer',
        query: 'req.query.ListAOI.json',
        res: 'res.ListAOI.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.query.pid = req.params.pid;
            res.json(await AOI.list(config.pool, req.params.pid, req.query));
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {post} /api/project/:pid/aoi Create AOI
     * @apiVersion 1.0.0
     * @apiName CreateAOI
     * @apiGroup AOI
     * @apiPermission user
     *
     * @apiDescription
     *     Create a new AOI
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.CreateAOI.json} apiParam
     * @apiSchema {jsonschema=../schema/res.AOI.json} apiSuccess
     */
    await schema.post('/project/:pid/aoi', {
        ':pid': 'integer',
        body: 'req.body.CreateAOI.json',
        res: 'res.AOI.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            req.body.pid = req.params.pid;
            const img = await AOI.generate(config.pool, req.body);

            return res.json(img.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {get} /api/project/:pid/aoi/:aoiid Get AOI
     * @apiVersion 1.0.0
     * @apiName GetAOI
     * @apiGroup AOI
     * @apiPermission user
     *
     * @apiDescription
     *     Get a single AOI
     *
     * @apiSchema {jsonschema=../schema/res.AOI.json} apiSuccess
     */
    await schema.get('/project/:pid/aoi/:aoiid', {
        ':pid': 'integer',
        ':aoiid': 'integer',
        res: 'res.AOI.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const img = await AOI.from(config.pool, req.params.aoiid);

            return res.json(img.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {patch} /api/project/:pid/aoi/:aoiid Patch AOI
     * @apiVersion 1.0.0
     * @apiName PatchAOI
     * @apiGroup AOI
     * @apiPermission user
     *
     * @apiDescription
     *     Update an AOI
     *
     * @apiSchema (Body) {jsonschema=../schema/req.body.PatchAOI.json} apiParam
     * @apiSchema {jsonschema=../schema/res.AOI.json} apiSuccess
     */
    await schema.patch('/project/:pid/aoi/:aoiid', {
        ':pid': 'integer',
        ':aoiid': 'integer',
        body: 'req.body.PatchAOI.json',
        res: 'res.AOI.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const img = await AOI.from(config.pool, req.params.aoiid);
            img.patch(req.body);
            await img.commit(config.pool);

            return res.json(img.serialize());
        } catch (err) {
            return Err.respond(err, res);
        }
    });

    /**
     * @api {delete} /api/project/:pid/aoi/:aoiid Delete AOI
     * @apiVersion 1.0.0
     * @apiName DeleteAOI
     * @apiGroup AOI
     * @apiPermission user
     *
     * @apiDescription
     *     Delete an AOI
     *
     * @apiSchema {jsonschema=../schema/res.Standard.json} apiSuccess
     */
    await schema.delete('/project/:pid/aoi/:aoiid', {
        ':pid': 'integer',
        ':aoiid': 'integer',
        res: 'res.Standard.json'
    }, async (req, res) => {
        try {
            await Auth.is_auth(req);

            const img = await AOI.from(config.pool, req.params.aoiid);
            await img.delete(config.pool);

            return res.json({
                status: 200,
                message: 'AOI Deleted'
            });
        } catch (err) {
            return Err.respond(err, res);
        }
    });
}
